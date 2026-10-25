import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BookOpen, Bookmark, BookmarkCheck,
  Brain, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp,
  Clipboard, Code2, Copy, ExternalLink, GraduationCap,
  Layers3, Moon, Play, RotateCcw, Search,
  SlidersHorizontal, Sparkles, Sun, TerminalSquare, Trophy,
} from 'lucide-react';
import { DICTIONARY_ITEMS, LEARNING_PATHS, LABS, QUIZ, DOCS } from './splunkDictionaryData';

/**
 * Drop-in educational UI; does not connect to a Splunk instance and does NOT
 * execute student queries. Examples are educational templates only.
 * Requires: React, lucide-react, Tailwind CSS.
 */
const saveKey = 'toanalytics.splunkDictionary.v2';
const CATEGORY_ALL = 'All topics';
const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIALECTS = ['All languages', 'SPL', 'SPL2', 'Concept'];
const TABS = [
  { value:'reference', label:'Command reference', icon:BookOpen },
  { value:'paths', label:'Learning paths', icon:GraduationCap },
  { value:'labs', label:'Case study labs', icon:TerminalSquare },
  { value:'quiz', label:'Knowledge check', icon:Brain },
];
const DIFFICULTY = {
  Beginner:'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  Intermediate:'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  Advanced:'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  Expert:'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300',
};
const SKILL_ORDER = {Beginner:1,Intermediate:2,Advanced:3,Expert:4};
const INTERVIEW = {
  stats:'How does stats differ from eventstats and streamstats when you need event-level context?',
  tstats:'When would tstats be faster than stats, and which fields are eligible?',
  transaction:'Why can transaction exhaust resources, and when is stats a better replacement?',
  rex:'Explain the difference between rex and regex, using a log parsing example.',
  'from (SPL2)':'What SQL-style features does SPL2 FROM add, and where might syntax differ?',
  'Risk-Based Alerting (RBA)':'How do risk signals across detections become prioritized findings?',
  'CIM (Common Information Model)':'Why is normalization important to cross-sourcetype detection content?',
  'Data Model Acceleration':'What are acceleration prerequisites and how does tstats benefit?',
};
const COMPARE = [
  {left:'stats',right:'eventstats',answer:'stats returns a summary table. eventstats appends summary values to every original event.'},
  {left:'stats',right:'streamstats',answer:'stats groups all matching input. streamstats works in event order for running/window calculations.'},
  {left:'rex',right:'regex',answer:'rex extracts new fields. regex removes events that do not match a pattern.'},
  {left:'transaction',right:'stats',answer:'transaction groups individual event sequences; stats is often faster for large summaries.'},
  {left:'SPL',right:'SPL2',answer:'SPL2 adds SQL-style syntax and dataset/data-pipeline features. Commands differ by runtime and product.'},
];

function loadPreferences() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(saveKey) || '{}') || {}; }
  catch { return {}; }
}
function readSet(value) { return Array.isArray(value) ? new Set(value) : new Set(); }
function prettyCount(n) { return new Intl.NumberFormat('en-US').format(n); }
function docFor(item) {
  if (item?.language === 'SPL2') return DOCS.spl2;
  if (item?.category === 'Security & SOC') return DOCS.security;
  return DOCS.spl;
}
function Pill({children,className=''}) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>{children}</span>;
}
function Button({children,icon:Icon,variant='outline',className='',...props}) {
  const variants = {
    outline:'border border-slate-200 bg-white text-slate-700 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-fuchsia-500 dark:hover:text-white',
    primary:'border border-fuchsia-500 bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-sm shadow-fuchsia-700/20',
    ghost:'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };
  return <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>
    {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}{children}
  </button>;
}
function EmptyState({title,description,onReset}) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center dark:border-slate-700">
    <Search className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
    <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {onReset && <Button onClick={onReset} className="mt-5">Clear filters</Button>}
  </div>;
}
function Mono({children}) {
  return <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-4 font-mono text-xs leading-6 text-cyan-100 sm:text-sm whitespace-pre-wrap break-words">{children}</pre>;
}

export default function SplunkDictionary() {
  const [prefs] = useState(loadPreferences);
  const [dark,setDark] = useState(prefs.dark !== false);
  const [favorites,setFavorites] = useState(() => readSet(prefs.favorites));
  const [mastered,setMastered] = useState(() => readSet(prefs.mastered));
  const [tab,setTab] = useState('reference');
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState(CATEGORY_ALL);
  const [level,setLevel] = useState('All levels');
  const [dialect,setDialect] = useState('All languages');
  const [onlyFavorites,setOnlyFavorites] = useState(false);
  const [sort,setSort] = useState('name');
  const [pageSize,setPageSize] = useState(24);
  const [selectedId,setSelectedId] = useState(DICTIONARY_ITEMS.find(x => x.name === 'tstats')?.id || DICTIONARY_ITEMS[0]?.id);
  const [activePath,setActivePath] = useState(LEARNING_PATHS[0].id);
  const [activeLab,setActiveLab] = useState(LABS[0].id);
  const [showSolution,setShowSolution] = useState(false);
  const [quizIndex,setQuizIndex] = useState(0);
  const [quizAnswer,setQuizAnswer] = useState(null);
  const [correctAnswers,setCorrectAnswers] = useState(0);
  const [quizFinished,setQuizFinished] = useState(false);
  const [toast,setToast] = useState('');
  const [filtersOpen,setFiltersOpen] = useState(false);
  const searchRef = useRef(null);
  const detailRef = useRef(null);

  const categories = useMemo(() => [CATEGORY_ALL,...new Set(DICTIONARY_ITEMS.map(x => x.category))],[]);
  const selected = useMemo(() => DICTIONARY_ITEMS.find(x => x.id === selectedId) || DICTIONARY_ITEMS[0], [selectedId]);
  const activePathData = LEARNING_PATHS.find(x => x.id === activePath) || LEARNING_PATHS[0];
  const activeLabData = LABS.find(x => x.id === activeLab) || LABS[0];
  const commandCount = useMemo(() => DICTIONARY_ITEMS.filter(x => x.kind === 'Command').length,[]);
  const remaining = DICTIONARY_ITEMS.length - mastered.size;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {window.localStorage.setItem(saveKey,JSON.stringify({ dark,favorites:[...favorites],mastered:[...mastered] }));}
    catch { /* Private mode / disabled storage: component still works */ }
  },[dark,favorites,mastered]);
  useEffect(() => { setPageSize(24); },[query,category,level,dialect,sort,onlyFavorites]);
  useEffect(() => {
    const keyHandler = e => {
      const isTyping = ['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable;
      if(e.key === '/' && !isTyping) {e.preventDefault();setTab('reference');searchRef.current?.focus();}
      if(e.key === 'Escape' && document.activeElement === searchRef.current) searchRef.current?.blur();
    };
    if(typeof window !== 'undefined') window.addEventListener('keydown',keyHandler);
    return () => { if(typeof window !== 'undefined') window.removeEventListener('keydown',keyHandler); };
  },[]);
  useEffect(() => {
    if(!toast) return;
    const timer = setTimeout(() => setToast(''),2200);
    return () => clearTimeout(timer);
  },[toast]);

  const filtered = useMemo(() => {
    const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = DICTIONARY_ITEMS.filter(item => {
      if(category !== CATEGORY_ALL && item.category !== category) return false;
      if(level !== 'All levels' && item.level !== level) return false;
      if(dialect !== 'All languages' && item.language !== dialect) return false;
      if(onlyFavorites && !favorites.has(item.id)) return false;
      const text=[item.name,item.definition,item.category,item.level,item.example,item.expected,item.tip,item.kind].join(' ').toLowerCase();
      return words.every(word => text.includes(word));
    });
    matches.sort((a,b) => {
      if(sort === 'level') return (SKILL_ORDER[a.level] - SKILL_ORDER[b.level]) || a.name.localeCompare(b.name);
      if(sort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      if(sort === 'mastery') return Number(mastered.has(a.id)) - Number(mastered.has(b.id)) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return matches;
  },[query,category,level,dialect,onlyFavorites,favorites,sort,mastered]);

  function switchSet(setter,id) {setter(prev => {const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;});}
  function resetFilters() {setQuery('');setCategory(CATEGORY_ALL);setLevel('All levels');setDialect('All languages');setOnlyFavorites(false);setSort('name');}
  function openItem(id) {
    setSelectedId(id);setTab('reference');
    if(typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),40);
    }
  }
  async function copy(value,label='Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(value);
      setToast(label);
    } catch { setToast('Clipboard unavailable: select the code to copy it'); }
  }
  function resetQuiz() {setQuizIndex(0);setQuizAnswer(null);setCorrectAnswers(0);setQuizFinished(false);}
  function nextQuiz() {
    if(quizAnswer === null) return;
    if(quizIndex + 1 >= QUIZ.length) setQuizFinished(true);
    else {setQuizIndex(x => x + 1);setQuizAnswer(null);}
  }
  const selectedQuiz = QUIZ[quizIndex];
  const selectStyles='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-fuchsia-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  const surface='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90';
  const sectionLabel='text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400';

  return (
    <div className={dark?'dark':''}>
      <div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900 selection:bg-fuchsia-500/20 dark:bg-[#080e1c] dark:text-slate-100">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <header className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#10172a] sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-300"><Sparkles className="h-3.5 w-3.5" /> T.O Analytics · Advanced learning</div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[44px]">Splunk <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">Command Academy</span></h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">An advanced searchable Splunk dictionary for analysts, SOC engineers, administrators and learners. Learn the command, see working examples, understand the output and practice the problem it solves.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2"><Pill className="border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">SPL + SPL2</Pill><Pill className="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">2026 reference</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">Student-friendly / expert depth</Pill></div>
              </div>
              <div className="flex items-center gap-2"><Button icon={dark?Sun:Moon} onClick={() => setDark(x=>!x)} aria-label={dark?'Switch to light mode':'Switch to dark mode'}>{dark?'Light':'Dark'} mode</Button></div>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Your learning overview">
            {[
              {label:'Reference entries',value:prettyCount(DICTIONARY_ITEMS.length),icon:Layers3,hint:'Commands, functions and concepts'},
              {label:'Search commands',value:prettyCount(commandCount),icon:Code2,hint:'Curated SPL/SPL2 coverage'},
              {label:'Saved entries',value:prettyCount(favorites.size),icon:Bookmark,hint:'Stored on this browser'},
              {label:'Mastered topics',value:`${mastered.size}/${DICTIONARY_ITEMS.length}`,icon:Trophy,hint:remaining===0?'Reference completed':`${remaining} remaining`},
            ].map(({label,value,icon:Icon,hint}) => <div key={label} className={`${surface} p-4 sm:p-5`}>
              <div className="flex items-start justify-between gap-2"><span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span><Icon className="h-4 w-4 text-fuchsia-500" aria-hidden="true" /></div>
              <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{value}</div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
            </div>)}
          </section>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#10172a]" role="tablist" aria-label="Learning workspace">
            <div className="flex min-w-max gap-1.5">
              {TABS.map(item => {const Icon=item.icon;return <button key={item.value} type="button" role="tab" aria-selected={tab===item.value} onClick={()=>setTab(item.value)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${tab===item.value?'bg-fuchsia-600 text-white shadow-sm':'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>;})}
            </div>
          </div>

          {tab === 'reference' && <>
            <section className={`${surface} mt-5 p-4 sm:p-5`} aria-label="Search and filters">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative block flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search Splunk reference</span><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stats, tstats, SPL2, CIM, response time…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-fuchsia-500 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-500" /></label>
                <div className="flex gap-2"><Button icon={SlidersHorizontal} onClick={()=>setFiltersOpen(x=>!x)} aria-expanded={filtersOpen} className="lg:hidden">Filters</Button><Button icon={Bookmark} variant={onlyFavorites?'primary':'outline'} onClick={()=>setOnlyFavorites(x=>!x)} aria-pressed={onlyFavorites}>Bookmarks</Button><Button icon={RotateCcw} onClick={resetFilters}>Reset</Button></div>
              </div>
              <div className={`${filtersOpen?'grid':'hidden'} mt-3 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-4`}>
                <label><span className={sectionLabel}>Topic</span><select className={`${selectStyles} mt-1.5`} value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Difficulty</span><select className={`${selectStyles} mt-1.5`} value={level} onChange={e=>setLevel(e.target.value)}>{LEVELS.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Language</span><select className={`${selectStyles} mt-1.5`} value={dialect} onChange={e=>setDialect(e.target.value)}>{DIALECTS.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Sort by</span><select className={`${selectStyles} mt-1.5`} value={sort} onChange={e=>setSort(e.target.value)}><option value="name">A to Z</option><option value="level">Difficulty</option><option value="category">Topic</option><option value="mastery">Not yet mastered</option></select></label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{prettyCount(filtered.length)} matching entries</span><span>Keyboard shortcut: <kbd className="rounded border border-slate-300 px-1.5 py-0.5 dark:border-slate-700">/</kbd> to search</span></div>
            </section>

            <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
              <section aria-label="Dictionary results" className="min-w-0 space-y-3">
                {filtered.length===0 ? <EmptyState title="No matching commands" description="Try fewer keywords, another command language or a different topic." onReset={resetFilters} /> : <>
                  {filtered.slice(0,pageSize).map(item => {
                    const isSelected=selectedId===item.id, isSaved=favorites.has(item.id), isMastered=mastered.has(item.id);
                    return <article key={item.id} className={`group relative rounded-2xl border p-4 transition-colors sm:p-5 ${isSelected?'border-fuchsia-400 bg-fuchsia-50/50 shadow-sm dark:border-fuchsia-500/60 dark:bg-fuchsia-500/5':'border-slate-200 bg-white hover:border-fuchsia-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-600'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={()=>openItem(item.id)} className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-500" aria-label={`Open ${item.name} reference`}>
                          <div className="flex flex-wrap items-center gap-2"><span className="break-words font-mono text-lg font-bold tracking-tight text-slate-950 dark:text-white">{item.name}</span>{isMastered && <CheckCheck className="h-4 w-4 text-emerald-500" aria-label="Mastered" />}</div>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.definition}</p>
                        </button>
                        <button type="button" onClick={()=>switchSet(setFavorites,item.id)} aria-label={isSaved?`Remove ${item.name} bookmark`:`Bookmark ${item.name}`} aria-pressed={isSaved} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-fuchsia-500 dark:hover:bg-slate-800">{isSaved?<BookmarkCheck className="h-5 w-5 text-fuchsia-500" />:<Bookmark className="h-5 w-5" />}</button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5"><Pill className={DIFFICULTY[item.level]}>{item.level}</Pill><Pill className="border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">{item.language}</Pill><Pill className="border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">{item.category}</Pill></div>
                      <div className="mt-3 flex justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"><span className="text-xs text-slate-500 dark:text-slate-400">{item.kind}</span><button onClick={()=>openItem(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300">Read full explanation <ChevronRight className="h-3.5 w-3.5" /></button></div>
                    </article>;
                  })}
                  {filtered.length>pageSize && <Button onClick={()=>setPageSize(x=>x+24)} className="w-full py-3" icon={ChevronDown}>Load more · {filtered.length-pageSize} remaining</Button>}
                </>}
              </section>

              <aside ref={detailRef} aria-label="Selected command details" className={`${surface} min-w-0 scroll-mt-5 overflow-hidden lg:sticky lg:top-5`}>
                {selected && <>
                  <div className="border-b border-slate-200 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 px-5 py-5 dark:border-slate-800 sm:px-6">
                    <div className="mb-2 flex flex-wrap gap-2"><Pill className={DIFFICULTY[selected.level]}>{selected.level}</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">{selected.language}</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">{selected.kind}</Pill></div>
                    <h2 className="break-words font-mono text-2xl font-black tracking-tight sm:text-3xl">{selected.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.definition}</p>
                  </div>
                  <div className="max-h-[76vh] space-y-6 overflow-y-auto p-5 sm:p-6">
                    {selected.language==='SPL2' && <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3 text-xs leading-5 text-cyan-800 dark:text-cyan-200"><strong>SPL2 compatibility:</strong> Check the target Search app, module editor or data pipeline. SPL2 syntax and available commands differ by environment.</div>}
                    <div>
                      <div className="mb-2 flex items-center justify-between"><h3 className={sectionLabel}>Syntax / working example</h3><button onClick={()=>copy(selected.example,'Example copied')} className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-300"><Copy className="h-3.5 w-3.5" /> Copy example</button></div>
                      <Mono>{selected.example}</Mono>
                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Examples use sample indexes, field names or datasets. Replace them with the fields available in your Splunk environment.</p>
                    </div>
                    <div><h3 className={sectionLabel}>Plain-English explanation</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.definition}</p></div>
                    {selected.steps.length>0 && <div><h3 className={sectionLabel}>Step-by-step breakdown</h3><ol className="mt-3 space-y-2">{selected.steps.map((step,i)=><li className="flex gap-3 text-sm leading-6" key={i}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-300">{i+1}</span><span>{step}</span></li>)}</ol></div>}
                    <div><h3 className={sectionLabel}>Expected result</h3><p className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.expected}</p></div>
                    <div><h3 className={sectionLabel}>Expert caution / performance tip</h3><p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.tip}</p></div>
                    <div><h3 className={sectionLabel}>Technical interview challenge</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{INTERVIEW[selected.name] || `In a production environment, when would you use ${selected.name}, how would you validate its output, and what could go wrong?`}</p></div>
                    <div className="flex flex-wrap gap-2"><Button icon={mastered.has(selected.id)?CheckCheck:Check} variant={mastered.has(selected.id)?'primary':'outline'} onClick={()=>switchSet(setMastered,selected.id)}>{mastered.has(selected.id)?'Mastered':'Mark mastered'}</Button><Button icon={favorites.has(selected.id)?BookmarkCheck:Bookmark} onClick={()=>switchSet(setFavorites,selected.id)}>{favorites.has(selected.id)?'Saved':'Bookmark'}</Button></div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800"><a href={docFor(selected)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300">Official Splunk reference <ExternalLink className="h-3.5 w-3.5" /></a><Button variant="ghost" icon={Clipboard} className="!py-1.5 text-xs" onClick={()=>copy(`${selected.name}\n${selected.definition}\n\nExample:\n${selected.example}\n\nExpected:\n${selected.expected}\n\nTip:\n${selected.tip}`,'Cheat sheet copied')}>Copy notes</Button></div>
                  </div>
                </>}
              </aside>
            </div>
            <section className={`${surface} mt-5 p-5`} aria-label="Compare similar commands"><div className="mb-4 flex items-center gap-2"><Layers3 className="h-5 w-5 text-fuchsia-500" /><h3 className="font-bold">Know the differences</h3></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{COMPARE.map(pair=><div key={`${pair.left}-${pair.right}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><code className="text-fuchsia-600 dark:text-fuchsia-300">{pair.left}</code><span className="text-slate-400">vs</span><code className="text-cyan-600 dark:text-cyan-300">{pair.right}</code></div><p className="text-xs leading-6 text-slate-600 dark:text-slate-300">{pair.answer}</p></div>)}</div></section>
          </>}

          {tab==='paths' && <div className="mt-5 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <div className="space-y-3">{LEARNING_PATHS.map(path=>{const complete=path.items.filter(name=>mastered.has(DICTIONARY_ITEMS.find(item=>item.name===name)?.id)).length;return <button type="button" key={path.id} onClick={()=>setActivePath(path.id)} className={`w-full rounded-2xl border p-5 text-left transition-colors ${activePath===path.id?'border-fuchsia-500 bg-fuchsia-500/5 dark:bg-fuchsia-500/10':'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex justify-between gap-3"><div className="font-bold">{path.title}</div><span className="text-xs text-slate-500">{complete}/{path.items.length}</span></div><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{path.description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-fuchsia-500" style={{width:`${(complete/path.items.length)*100}%`}} /></div></button>;})}</div>
            <section className={`${surface} p-6`}><div className={sectionLabel}>Guided learning path</div><h2 className="mt-2 text-2xl font-black">{activePathData.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{activePathData.description} Select each command to open its complete explanation, then mark it mastered.</p><div className="mt-6 space-y-3">{activePathData.items.map((name,i)=>{const item=DICTIONARY_ITEMS.find(x=>x.name===name);if(!item)return null;return <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold dark:bg-slate-800">{i+1}</span><div className="min-w-0 flex-1"><div className="font-mono text-sm font-bold">{name}</div><p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.definition}</p></div>{mastered.has(item.id)&&<CheckCheck className="h-4 w-4 text-emerald-500" />}<Button onClick={()=>openItem(item.id)} className="!px-2 !py-1.5">Learn <ArrowRight className="h-3.5 w-3.5" /></Button></div>;})}</div></section>
          </div>}

          {tab==='labs' && <div className="mt-5 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <section className="space-y-3" aria-label="Practice scenarios">{LABS.map(lab=><button type="button" key={lab.id} onClick={()=>{setActiveLab(lab.id);setShowSolution(false);}} className={`w-full rounded-2xl border p-4 text-left transition-colors ${activeLab===lab.id?'border-fuchsia-500 bg-fuchsia-500/5 dark:bg-fuchsia-500/10':'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="text-xs text-slate-500 dark:text-slate-400">{lab.category} · {lab.level}</div><h3 className="mt-1 font-bold">{lab.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{lab.question}</p></button>)}</section>
            <section className={`${surface} p-6`}><Pill className={DIFFICULTY[activeLabData.level]}>{activeLabData.level}</Pill><h2 className="mt-3 text-2xl font-black">{activeLabData.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeLabData.question}</p><div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"><div className={sectionLabel}>Your challenge</div><p className="mt-1 text-sm font-semibold">{activeLabData.goal}</p><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Try writing the SPL yourself first. This educational workspace does not execute real searches or connect to your Splunk server.</p></div><div className="mt-5"><Button variant="primary" icon={showSolution?CircleHelp:Play} onClick={()=>setShowSolution(x=>!x)}>{showSolution?'Hide walkthrough':'Reveal solution and explanation'}</Button></div>{showSolution&&<div className="mt-6 space-y-5"><div><div className="mb-2 flex items-center justify-between"><h3 className={sectionLabel}>Example solution</h3><Button icon={Copy} className="!py-1.5" onClick={()=>copy(activeLabData.query,'Lab SPL copied')}>Copy query</Button></div><Mono>{activeLabData.query}</Mono></div><div><h3 className={sectionLabel}>How it works</h3><ol className="mt-3 space-y-3">{activeLabData.steps.map((x,i)=><li className="flex gap-3 text-sm leading-6" key={x}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-300">{i+1}</span>{x}</li>)}</ol></div><div><h3 className={sectionLabel}>Expected result</h3><p className="mt-2 text-sm leading-6">{activeLabData.expected}</p></div><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6">{activeLabData.caveat}</div></div>}</section>
          </div>}

          {tab==='quiz' && <section className={`${surface} mx-auto mt-5 max-w-3xl p-6 sm:p-8`}>
            <div className="flex items-center justify-between gap-4"><div><p className={sectionLabel}>Applied knowledge</p><h2 className="mt-1 text-2xl font-black">Splunk knowledge check</h2></div><Trophy className="h-9 w-9 text-fuchsia-500" /></div>
            {!quizFinished ? <><div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>Question {quizIndex+1} of {QUIZ.length}</span><span>Correct so far: {correctAnswers}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-fuchsia-500" style={{width:`${((quizIndex+1)/QUIZ.length)*100}%`}} /></div><h3 className="mt-7 text-xl font-bold leading-8">{selectedQuiz.q}</h3><div className="mt-5 space-y-3">{selectedQuiz.options.map((option,i)=>{const revealed=quizAnswer!==null;const right=i===selectedQuiz.answer;return <button key={i} type="button" disabled={revealed} onClick={()=>{setQuizAnswer(i);if(i===selectedQuiz.answer)setCorrectAnswers(x=>x+1);}} className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-colors ${revealed&&right?'border-emerald-500 bg-emerald-500/10':revealed&&quizAnswer===i?'border-rose-500 bg-rose-500/10':'border-slate-200 bg-slate-50 hover:border-fuchsia-400 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-fuchsia-500'} ${revealed?'cursor-default':''}`}><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-current/20 font-mono text-xs">{String.fromCharCode(65+i)}</span>{option}{revealed&&right&&<Check className="ml-2 inline h-4 w-4 text-emerald-500" />}</button>;})}</div>{quizAnswer!==null&&<div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm leading-6"><strong>{quizAnswer===selectedQuiz.answer?'Correct.':'The right answer is highlighted.'}</strong> {selectedQuiz.detail}</div>}<div className="mt-6 flex justify-end"><Button disabled={quizAnswer===null} variant="primary" icon={ArrowRight} onClick={nextQuiz}>{quizIndex===QUIZ.length-1?'See results':'Next question'}</Button></div></>:<div className="py-12 text-center"><Trophy className="mx-auto h-12 w-12 text-fuchsia-500" /><h3 className="mt-4 text-3xl font-black">{correctAnswers} / {QUIZ.length}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You completed the knowledge check. Review unfamiliar concepts in the command reference and try again.</p><Button variant="primary" icon={RotateCcw} className="mt-5" onClick={resetQuiz}>Retake quiz</Button></div>}
          </section>}

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div><span className="font-bold text-slate-800 dark:text-slate-200">T.O Analytics · Splunk Command Academy</span><p className="mt-1">Educational reference, not a full Splunk parser or live query engine. Verify product/version compatibility.</p></div>
            <div className="flex flex-wrap gap-4"><a href={DOCS.spl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL reference <ExternalLink className="h-3 w-3" /></a><a href={DOCS.spl2} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL2 reference <ExternalLink className="h-3 w-3" /></a><a href={DOCS.comparison} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL vs SPL2 <ExternalLink className="h-3 w-3" /></a></div>
          </footer>
        </div>
        {toast && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-xl border border-fuchsia-500/30 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div>}
      </div>
    </div>
  );
}
