import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { scenarios } from '../../lib/advancedLab/advancedScenarios';
import { runPractice } from '../../lib/advancedLab/advancedPractice';
import './advancedPractice.css';

const storageKey = id => `toSplunkAdvanced:v1:${id}`;
function readProgress(id) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function Results({ rows, onPin }) {
  if (!rows.length) return <p className="ap-empty">No matching events. Check your filters and the replay position.</p>;
  const fields = [...new Set(rows.flatMap(row => Object.keys(row)))];
  return <div className="ap-table-scroll"><table><thead><tr>{fields.map(field => <th key={field}>{field}</th>)}<th>Evidence</th></tr></thead>
    <tbody>{rows.slice(0, 200).map((row, i) => <tr key={i}>{fields.map(field => <td key={field}>{String(row[field] ?? '—')}</td>)}<td><details><summary>Inspect</summary><pre>{JSON.stringify(row, null, 2)}</pre></details><button type="button" onClick={() => onPin(row)}>Pin row</button></td></tr>)}</tbody></table>
    {rows.length > 200 && <p>Showing the first 200 rows. Refine your search to inspect fewer results.</p>}</div>;
}
Results.propTypes = { rows: PropTypes.array.isRequired, onPin: PropTypes.func.isRequired };

function Chart({ rows }) {
  const numeric = [...new Set(rows.flatMap(row => Object.keys(row).filter(key => typeof row[key] === 'number')))];
  if (!numeric.length) return <p className="ap-empty">Run stats or timechart to visualize numeric results.</p>;
  const max = Math.max(1, ...rows.flatMap(row => numeric.map(key => Math.abs(row[key] || 0))));
  return <div className="ap-chart" aria-label="Search result chart">{rows.slice(0, 30).map((row, i) => <div key={i} className="ap-chart-group"><strong>{row._time || Object.values(row).find(value => typeof value === 'string') || `Result ${i + 1}`}</strong>{numeric.map((key, n) => <div className="ap-bar-row" key={key}><span>{key}</span><div><i style={{ width: `${Math.max(0, (row[key] || 0) / max * 100)}%`, background: ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399'][n % 4] }} /></div><b>{Number(row[key] || 0).toLocaleString()}</b></div>)}</div>)}{rows.length > 30 && <p>Chart shows the first 30 groups; use the table for all results.</p>}</div>;
}
Chart.propTypes = { rows: PropTypes.array.isRequired };

function Workspace({ scenario, onExit }) {
  const [saved] = useState(() => readProgress(scenario.id));
  const [taskIndex, setTaskIndex] = useState(0);
  const [query, setQuery] = useState(typeof saved.query === 'string' ? saved.query : `index=${scenario.index}`);
  const [completed, setCompleted] = useState(() => Array.isArray(saved.completed) ? saved.completed.filter(id => scenario.tasks.some(t => t.id === id)) : []);
  const [hints, setHints] = useState(saved.hints && typeof saved.hints === 'object' ? saved.hints : {});
  const [history, setHistory] = useState(Array.isArray(saved.history) ? saved.history.filter(q => typeof q === 'string').slice(0, 12) : []);
  const [bookmarks, setBookmarks] = useState(Array.isArray(saved.bookmarks) ? saved.bookmarks.filter(q => typeof q === 'string').slice(0, 12) : []);
  const [evidence, setEvidence] = useState(Array.isArray(saved.evidence) ? saved.evidence.filter(e => e && typeof e.query === 'string' && e.row).slice(0, 12) : []);
  const [notes, setNotes] = useState(typeof saved.notes === 'string' ? saved.notes : '');
  const [recommendation, setRecommendation] = useState(typeof saved.recommendation === 'string' ? saved.recommendation : '');
  const [mode, setMode] = useState('guided');
  const [cursor, setCursor] = useState(scenario.events.length);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [windowMinutes, setWindowMinutes] = useState(0);
  const [result, setResult] = useState(null);
  const [resultQuery, setResultQuery] = useState('');
  const [view, setView] = useState('table');
  const [running, setRunning] = useState(false);
  const [attempted, setAttempted] = useState({});
  const [status, setStatus] = useState('Progress is saved on this device.');
  const [storageError, setStorageError] = useState('');
  const [report, setReport] = useState(false);
  const request = useRef(null);
  const task = scenario.tasks[taskIndex];
  const hintLevel = Math.max(0, Math.min(3, Number(hints[task.id]) || 0));
  const ready = completed.length === scenario.tasks.length && evidence.length > 0 && notes.trim().length >= 40 && recommendation.trim().length >= 20;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(scenario.id), JSON.stringify({ query, completed, hints, history, bookmarks, evidence, notes, recommendation }));
      setStorageError('');
    } catch { setStorageError('Device storage is unavailable. Keep this tab open and export your report before leaving.'); }
  }, [scenario.id, query, completed, hints, history, bookmarks, evidence, notes, recommendation]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCursor(value => Math.min(scenario.events.length, value + speed)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed, scenario.events.length]);
  useEffect(() => { if (cursor === scenario.events.length) setPlaying(false); }, [cursor, scenario.events.length]);
  useEffect(() => () => request.current?.abort(), []);

  async function run() {
    if (request.current || !query.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    setRunning(true);
    setPlaying(false);
    setAttempted(value => ({ ...value, [task.id]: true }));
    setHistory(value => [query, ...value.filter(q => q !== query)].slice(0, 12));
    const payload = { scenarioId: scenario.id, taskId: task.id, query, cursor, windowMinutes };
    let source = 'Local simulator';
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      let next;
      const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
      if (base) {
        try {
          const response = await fetch(`${base}/api/splunk-lab/practice/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
          if (response.ok) { next = (await response.json()).data; source = 'Online simulator'; }
          else if (response.status === 422 || response.status === 429) {
            const body = await response.json().catch(() => ({}));
            throw Object.assign(new Error(body.message || 'Too many searches. Please wait a minute.'), { validation: true });
          }
        } catch (error) { if (error.validation) throw error; }
      }
      if (!next) next = runPractice(payload);
      setResult(next); setResultQuery(query);
      setStatus(`${source} · ${next.scanned} events scanned · snapshot at ${scenario.events[cursor - 1]._time} UTC`);
      if (next.passed) setCompleted(value => value.includes(task.id) ? value : [...value, task.id]);
    } catch (error) {
      setResult({ rows: [], message: error.message, passed: false, error: true });
      setResultQuery(query);
      setStatus('Search needs attention. No task credit was awarded.');
    } finally {
      window.clearTimeout(timeout); request.current = null; setRunning(false);
    }
  }

  function pin(row) {
    if (evidence.length >= 12) { setStatus('Notebook holds 12 evidence rows. Remove one before adding more.'); return; }
    setEvidence(value => [...value, { query: resultQuery, row, capturedAt: new Date().toISOString() }]);
    setStatus('Evidence added to your notebook.');
  }

  function exportReport() {
    const text = [`# ${scenario.title}`, 'Synthetic Splunk practice report — self-guided, not a certification.', `Tasks completed: ${completed.length}/${scenario.tasks.length}`, `Exported: ${new Date().toISOString()}`, '\n## Findings', notes, '\n## Recommended response', recommendation, '\n## Evidence', ...evidence.map((entry, i) => `### Evidence ${i + 1}\nSearch: ${entry.query}\n\n${JSON.stringify(entry.row, null, 2)}`), '\n## Completed tasks', ...scenario.tasks.filter(t => completed.includes(t.id)).map(t => `- ${t.title}`)].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${scenario.id}-report.md`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (report) return <div className="ap-shell"><header className="ap-header"><button onClick={() => setReport(false)}>Back to investigation</button><span>{scenario.code} / REPORT</span></header><section className="ap-report ap-card"><p className="ap-eyebrow">Investigation complete</p><h1>{scenario.title}</h1><p>7 of 7 tasks passed · {evidence.length} evidence rows · {Object.values(hints).reduce((sum, n) => sum + (Number(n) || 0), 0)} hints revealed</p><h2>Your findings</h2><p className="ap-preserve">{notes}</p><h2>Your recommended response</h2><p className="ap-preserve">{recommendation}</p><h2>Case debrief</h2><p>{scenario.debrief}</p><p className="ap-muted">Search tasks are checked automatically. Your written analysis is for self-review or instructor review; it has not been automatically graded.</p><div className="ap-actions"><button className="ap-primary" onClick={exportReport}>Download report</button><button onClick={onExit}>Choose another investigation</button></div></section></div>;

  return <div className="ap-shell">
    <header className="ap-header"><button onClick={onExit}>← Investigations</button><span>{scenario.code} / {scenario.title}</span><label>Mode <select value={mode} onChange={e => setMode(e.target.value)}><option value="guided">Guided</option><option value="challenge">Challenge</option></select></label></header>
    <div className="ap-intro"><div><p className="ap-eyebrow">Analyst workbench / synthetic data</p><h1>{scenario.title}</h1><p>{scenario.briefing}</p></div><div className="ap-progress"><strong>{completed.length}<small> / 7</small></strong><span>tasks complete</span><progress value={completed.length} max="7" /></div></div>
    {storageError && <p role="alert" className="ap-warning">{storageError}</p>}
    <div className="ap-layout">
      <aside className="ap-card ap-tasks"><p className="ap-eyebrow">Investigation tasks</p>{scenario.tasks.map((item, i) => <button key={item.id} disabled={running} className={i === taskIndex ? 'ap-task active' : 'ap-task'} aria-current={i === taskIndex ? 'step' : undefined} onClick={() => { setTaskIndex(i); setResult(null); }}><span>{completed.includes(item.id) ? '✓' : String(i + 1).padStart(2, '0')}</span><b>{item.title}</b></button>)}<p className="ap-muted">Explore any task. Progress stays on this device.</p></aside>
      <main className="ap-main">
        <section className="ap-card"><p className="ap-eyebrow">Task {taskIndex + 1} / 7</p><h2>{task.title}</h2><p>{task.instruction}</p>{mode === 'guided' && <div className="ap-hints"><button disabled={hintLevel >= 3 || (hintLevel === 2 && !attempted[task.id])} onClick={() => setHints(value => ({ ...value, [task.id]: hintLevel + 1 }))}>{hintLevel < 2 ? `Reveal hint ${hintLevel + 1}` : 'Reveal worked search'}</button>{hintLevel === 2 && !attempted[task.id] && <small>Try a search before revealing the solution.</small>}{task.hints.slice(0, hintLevel).map(hint => <p key={hint}>{hint}</p>)}{hintLevel >= 3 && <pre>{task.query}</pre>}</div>}{completed.includes(task.id) && <p className="ap-success">✓ {task.explanation}</p>}</section>
        <section className="ap-card ap-replay"><div className="ap-section-heading"><h2>Event replay</h2><span className="ap-pill">{playing ? 'Replaying' : cursor === scenario.events.length ? 'Full capture' : 'Paused'} · simulated</span></div><p className="ap-muted">{cursor} / {scenario.events.length} events available · {scenario.events[cursor - 1]._time} UTC. Replay advances events, not wall-clock time.</p><progress value={cursor} max={scenario.events.length} /><div className="ap-actions"><button disabled={running} onClick={() => { if (cursor === scenario.events.length) setCursor(1); setPlaying(!playing); }}>{playing ? 'Pause' : 'Play replay'}</button><button disabled={running} onClick={() => { setCursor(1); setPlaying(false); }}>Restart replay</button><button disabled={running} onClick={() => { setCursor(scenario.events.length); setPlaying(false); setWindowMinutes(0); }}>Load full capture</button><label>Speed <select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value="1">1 event/sec</option><option value="5">5 events/sec</option><option value="15">15 events/sec</option></select></label></div></section>
        <section className="ap-card"><div className="ap-section-heading"><label htmlFor="advanced-query">SPL search</label><label>Time range <select disabled={running} value={windowMinutes} onChange={e => setWindowMinutes(Number(e.target.value))}><option value="0">All time</option><option value="5">Last 5 minutes</option><option value="15">Last 15 minutes</option></select></label></div><textarea id="advanced-query" className="ap-editor" spellCheck="false" maxLength={3000} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } }} /><div className="ap-actions"><button className="ap-primary" disabled={running || !query.trim()} onClick={run}>{running ? 'Searching…' : 'Run search & check task'}</button><button disabled={!query.trim() || bookmarks.includes(query) || bookmarks.length >= 12} onClick={() => setBookmarks(value => [...value, query])}>Save search</button><small>Ctrl / ⌘ + Enter</small></div><p className="ap-muted">Time ranges are relative to the latest replayed event. Searches use a snapshot; run again after more events arrive.</p>
          <details className="ap-reference"><summary>Supported SPL & field reference</summary><p>This practice track supports a bounded SPL subset. Field names are case-sensitive. Use field=value without spaces around operators; quote values containing spaces.</p><code>{Object.keys(scenario.events[0]).join(' · ')}</code><pre>{`index=${scenario.index} sourcetype=${scenario.sourcetype}\n| stats count AS events BY field\n| stats sum(bytes_out) AS total BY src\n| where total>500000000\n| sort - total | head 5\n| dedup field | table field\n| timechart span=5m count BY field`}</pre><p>Also supported: search, fields, stats avg(field), numeric comparisons, and * wildcards in field values. Unsupported commands return an error.</p></details>
        </section>
        <section className="ap-card"><div className="ap-section-heading"><h2>Latest available events</h2><span className="ap-pill">{playing ? 'Incoming simulated logs' : 'Replay snapshot'}</span></div><p className="ap-muted">The most recent three events in the capture so far. Expand an event to inspect its raw fields.</p>{scenario.events.slice(Math.max(0, cursor - 3), cursor).map((event, i) => <details key={`${cursor}-${i}`}><summary>{event._time} UTC · {event.user || event.host || event.src} · {event.action || `HTTP ${event.status}`}</summary><pre>{JSON.stringify(event, null, 2)}</pre></details>)}</section>
        <section className="ap-card ap-results" aria-busy={running}><div className="ap-section-heading"><h2>Search results {result && `(${result.rows.length})`}</h2><div className="ap-actions"><button aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button><button aria-pressed={view === 'chart'} onClick={() => setView('chart')}>Chart</button></div></div><p className="ap-muted" role="status">{status}</p>{result ? <><p role="status" className={result.passed ? 'ap-success' : 'ap-warning'}>{result.message}</p><details><summary>Search used for these results</summary><pre>{resultQuery}</pre></details>{view === 'table' ? <Results rows={result.rows} onPin={pin} /> : <Chart rows={result.rows} />}</> : <p className="ap-empty">Write a search to inspect events, calculate statistics, or build a timeline.</p>}</section>
      </main>
      <aside className="ap-notebook">
        <section className="ap-card"><h2>Analyst notebook</h2><p className="ap-muted">Pin rows from your search results, then explain what they establish.</p><label>Findings<textarea value={notes} maxLength={6000} onChange={e => setNotes(e.target.value)} placeholder="Describe the timeline, affected entities, and evidence. What remains uncertain?" /></label><label>Recommended response<textarea value={recommendation} maxLength={3000} onChange={e => setRecommendation(e.target.value)} placeholder="What should the team investigate or do next, and why?" /></label><h3>Pinned evidence ({evidence.length}/12)</h3>{evidence.length === 0 && <p className="ap-muted">Use Inspect and Pin row in the results table.</p>}{evidence.map((entry, i) => <details key={i}><summary>Evidence {i + 1}</summary><pre>{JSON.stringify(entry.row, null, 2)}</pre><code>{entry.query}</code><button onClick={() => setEvidence(value => value.filter((_, index) => index !== i))}>Remove evidence {i + 1}</button></details>)}<button className="ap-primary" disabled={!ready} onClick={() => setReport(true)}>Complete investigation</button>{!ready && <p className="ap-muted">Pass all seven tasks, pin evidence, and write findings (40+ characters) and a response (20+ characters).</p>}<button onClick={exportReport}>Export draft report</button></section>
        <section className="ap-card"><h2>Saved searches</h2>{bookmarks.length === 0 && <p className="ap-muted">Save useful searches to reuse them.</p>}{bookmarks.map(q => <div className="ap-saved" key={q}><button onClick={() => setQuery(q)}>{q}</button><button aria-label={`Remove saved search ${q}`} onClick={() => setBookmarks(value => value.filter(item => item !== q))}>×</button></div>)}<h3>Recent searches</h3>{history.map(q => <button className="ap-history" key={q} onClick={() => setQuery(q)}>{q}</button>)}</section>
      </aside>
    </div>
  </div>;
}
Workspace.propTypes = { scenario: PropTypes.object.isRequired, onExit: PropTypes.func.isRequired };

export default function AdvancedPractice({ onExit }) {
  const [selected, setSelected] = useState(null);
  if (selected) return <Workspace key={selected.id} scenario={selected} onExit={() => setSelected(null)} />;
  return <div className="ap-shell"><header className="ap-header"><button onClick={onExit}>← Original case library</button><span>TO SKILL LAB / ADVANCED PRACTICE</span></header><div className="ap-library"><p className="ap-eyebrow">Learn by investigating</p><h1>Your next shift starts here.</h1><p>Search realistic synthetic logs, replay incoming events, and build an evidence-backed report. Every investigation includes seven practical tasks.</p><div className="ap-library-grid">{scenarios.map((scenario, i) => {
    const saved = readProgress(scenario.id);
    const count = Array.isArray(saved.completed) ? new Set(saved.completed.filter(id => scenario.tasks.some(t => t.id === id))).size : 0;
    return <button className="ap-case" key={scenario.id} onClick={() => setSelected(scenario)}><div className="ap-section-heading"><span className="ap-pill">{scenario.difficulty}</span><span>{scenario.code}</span></div><div className="ap-case-number">0{i + 1}</div><h2>{scenario.title}</h2><p>{scenario.briefing}</p><div className="ap-case-footer"><span>{scenario.events.length} events · {scenario.duration} min</span><b>{count ? `Resume ${count}/7 →` : 'Start investigation →'}</b></div></button>;
  })}</div><p className="ap-muted">Synthetic training environment with a limited SPL command set. Progress is stored on this device; export reports to keep a portable copy.</p></div></div>;
}
AdvancedPractice.propTypes = { onExit: PropTypes.func.isRequired };
