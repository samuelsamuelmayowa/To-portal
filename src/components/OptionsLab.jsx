import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, FlaskConical, RefreshCw, Target, Sparkles } from 'lucide-react';
import { demoChain, emptyWallet, expirationProfit, placeOptionOrder, STARTING_CASH } from '../lib/optionsSimulator';
import './OptionsLab.css';

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const storageKey = (mode) => `to-options-lab-v1:${mode}`;
const expirations = Array.from({ length: 4 }, (_, i) => {
  const date = new Date();
  const untilFriday = (5 - date.getUTCDay() + 7) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + untilFriday + 7 * i);
  return date.toISOString().slice(0, 10);
});
function readWallet(mode) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(mode)));
    if (saved && Number.isFinite(saved.cash) && saved.cash >= 0 && Array.isArray(saved.positions) && Array.isArray(saved.history) && saved.positions.every((p) => typeof p.id === 'string' && Number.isSafeInteger(p.quantity) && p.quantity > 0 && Number.isFinite(p.average) && p.multiplier === 100)) return saved;
  } catch { /* An unavailable or old browser save starts a new practice session. */ }
  return emptyWallet();
}

export default function OptionsLab({ active = true }) {
  const [mode, setMode] = useState('market');
  const [symbol, setSymbol] = useState('AAPL');
  const [expiration, setExpiration] = useState(expirations[0]);
  const [type, setType] = useState('call');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [marketChain, setMarketChain] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState('');
  const [feed, setFeed] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(() => readWallet('market'));
  const [move, setMove] = useState(0);
  const [explored, setExplored] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current += 1; }, []);

  const chain = useMemo(() => mode === 'demo' ? demoChain(symbol, expiration) : marketChain, [mode, symbol, expiration, marketChain]);
  const contracts = chain.filter((c) => c.type === type).sort((a, b) => a.strike - b.strike);
  const contract = contracts.find((c) => c.id === selectedId) || contracts[Math.floor(contracts.length / 2)];
  const count = Number(quantity);
  const validCount = Number.isSafeInteger(count) && count > 0;
  const cost = contract && validCount ? contract.premium * 100 * count : 0;
  const owned = wallet.positions.find((p) => p.id === contract?.id)?.quantity || 0;
  const breakeven = contract ? contract.strike + (type === 'call' ? contract.premium : -contract.premium) : 0;
  const reference = contract?.strike || 200;
  const scenarioPrice = reference * (1 + move / 100);
  const scenarioProfit = contract ? expirationProfit(contract, scenarioPrice, validCount ? count : 1) : 0;
  const markedValue = wallet.positions.reduce((sum, p) => sum + p.quantity * 100 * (chain.find((c) => c.id === p.id)?.premium ?? p.average), 0);
  const realized = wallet.history.reduce((sum, o) => sum + (o.realized || 0), 0);
  const milestones = [Boolean(contract), explored, wallet.history.some((o) => o.side === 'buy'), wallet.history.some((o) => o.side === 'sell')];
  const blocked = !contract || !validCount || loading || (side === 'buy' ? cost > wallet.cash : count > owned) || contract?.expiration <= new Date().toISOString().slice(0, 10);

  function invalidate() {
    requestId.current += 1;
    setLoading(false); setMarketChain([]); setSelectedId(''); setLoadedAt(''); setFeed(''); setError(''); setNotice('');
  }
  function switchMode(next) {
    invalidate(); setMode(next); setWallet(readWallet(next)); setSide('buy'); setResetConfirm(false);
  }
  function save(next) {
    try { localStorage.setItem(storageKey(mode), JSON.stringify(next)); }
    catch { setError('Browser storage is unavailable. Your practice session will not survive a page reload.'); }
    setWallet(next);
  }
  const loadChain = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true); setError(''); setNotice(''); setMarketChain([]); setLoadedAt('');
    try {
      const params = new URLSearchParams({ symbol, expiration });
      const response = await fetch(`/api/options-chain?${params}`, { signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Alpaca options data is unavailable. Please retry.');
      const rows = data.contracts || [];
      if (id !== requestId.current) return;
      setMarketChain(rows); setFeed(data.feed); setLoadedAt(new Date(data.fetchedAt).toLocaleTimeString());
      if (!rows.length) setError('No priced standard contracts were returned for this date. Try another expiration or Demo mode.');
      else setNotice(`Loaded ${rows.length} Alpaca contracts${data.hasMore ? ' (additional contracts exist beyond this result limit)' : ''}. ${data.feed === 'indicative' ? 'Indicative feed: trades are delayed and quotes are modified by Alpaca.' : 'OPRA feed: check the contract timestamp for quote age.'} Practice fills use the displayed premium.`);
    } catch (e) {
      if (id === requestId.current) setError(e.name === 'TimeoutError' ? 'The data request timed out. Please try again.' : e.message || 'Unable to load market data.');
    } finally { if (id === requestId.current) setLoading(false); }
  }, [symbol, expiration]);

  useEffect(() => {
    if (!active || mode !== 'market' || !expiration) return;
    loadChain();
    return () => { requestId.current += 1; };
  }, [active, mode, expiration, loadChain]);
  function trade() {
    setError(''); setNotice('');
    try {
      if (blocked) throw new Error('Review your contract, quantity, and practice buying power.');
      const next = placeOptionOrder(wallet, contract, count, side);
      save(next);
      setNotice(`${side === 'buy' ? 'Bought' : 'Sold'} ${count} ${symbol} ${type} contract${count === 1 ? '' : 's'} for ${money(cost)} in your ${mode} wallet.`);
    } catch (e) { setError(e.message); }
  }
  function selectPosition(p) {
    invalidate(); setSymbol(p.symbol); setExpiration(p.expiration); setType(p.type); setSelectedId(p.id); setSide('sell'); setQuantity(p.quantity);
    setNotice(mode === 'market' ? 'Load this expiration’s snapshot, then select your held strike to close the position.' : 'Your held contract is selected. Review the sell ticket below.');
  }

  return <div className="options-lab">
    <section className="ol-intro">
      <div><span className="ol-eyebrow"><FlaskConical size={15} /> THE OPTIONS PLAYGROUND</span><h2>Small experiments.<br /><span>Real understanding.</span></h2><p>Explore calls and puts, test a price move, and build confidence one practice contract at a time.</p></div>
      <div className="ol-mission"><Sparkles size={22} /><div><strong>Your first options journey</strong><p>{milestones.filter(Boolean).length} of 4 milestones completed</p></div><div className="ol-progress"><span style={{ width: `${milestones.filter(Boolean).length * 25}%` }} /></div><div className="ol-steps">{['Pick a contract', 'Explore a payoff', 'Buy a contract', 'Close a position'].map((label, i) => <span key={label} className={milestones[i] ? 'complete' : ''}><CheckCircle2 size={14} />{label}</span>)}</div></div>
    </section>
    <div className="ol-toolbar"><div className="ol-toggle" aria-label="Options data mode">{['demo', 'market'].map((item) => <button key={item} aria-pressed={mode === item} onClick={() => switchMode(item)}>{item === 'demo' ? 'Demo playground' : 'Alpaca market data'}</button>)}</div><span className="ol-save">Browser-saved · Separate options wallet</span></div>
    <p className="ol-disclosure">{mode === 'demo' ? 'Illustrative contracts and fixed premiums, based on a fictional $200 underlying price. These are not market quotes.' : 'Prices come from Alpaca. Indicative quotes are modified and trades are delayed; OPRA access depends on your subscription. Check each contract timestamp. Practice fills use the displayed premium.'} Long calls and puts only. No real orders are sent.</p>
    <div className="ol-stats">{[['Practice cash', money(wallet.cash)], ['Holdings estimate', money(markedValue)], ['Account estimate', money(wallet.cash + markedValue)], ['Realized P/L · last 100 trades', money(realized)]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="ol-workspace">
      <section className="ol-panel ol-chain"><div className="ol-heading"><div><span className="ol-eyebrow">01 / DISCOVER</span><h3>Find your contract</h3></div><span className="ol-tag">{mode === 'demo' ? 'DEMO DATA' : (feed ? feed.toUpperCase() + ' DATA' : 'ALPACA DATA')}</span></div>
        <div className="ol-filters"><label>Underlying<select value={symbol} onChange={(e) => { invalidate(); setSymbol(e.target.value); }}>{['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'SPY'].map((s) => <option key={s}>{s}</option>)}</select></label><label>Expiration{mode === 'demo' ? <select value={expiration} onChange={(e) => { invalidate(); setExpiration(e.target.value); }}>{[...new Set([expiration, ...expirations])].sort().map((d) => <option key={d}>{d}</option>)}</select> : <input type="date" value={expiration} min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} onChange={(e) => { invalidate(); setExpiration(e.target.value); }} />}</label></div>
        <div className="ol-toggle ol-types"><button aria-pressed={type === 'call'} onClick={() => { setType('call'); setSelectedId(''); }}><ArrowUpRight size={16} /> Calls · bullish</button><button aria-pressed={type === 'put'} onClick={() => { setType('put'); setSelectedId(''); }}><ArrowDownRight size={16} /> Puts · bearish</button></div>
        {mode === 'market' && <button className="ol-secondary ol-load" disabled={loading || !expiration} onClick={loadChain}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />{loading ? 'Loading contracts…' : 'Load / refresh chain'}{loadedAt && ` · ${loadedAt}`}</button>}
        <div className="ol-table-wrap"><table><thead><tr><th>Strike</th><th>Premium / share</th><th>Contract cost</th><th>Select</th></tr></thead><tbody>{contracts.map((c) => <tr key={c.id} className={contract?.id === c.id ? 'ol-selected' : ''}><td><strong>{money(c.strike)}</strong>{wallet.positions.some((p) => p.id === c.id) && <small>Owned</small>}</td><td>{money(c.premium)}</td><td>{money(c.premium * 100)}</td><td><button aria-label={`Select ${symbol} ${c.strike} ${type}`} aria-pressed={contract?.id === c.id} onClick={() => { setSelectedId(c.id); setMove(0); }}>{contract?.id === c.id ? 'Selected' : 'Select'}</button></td></tr>)}</tbody></table>{!contracts.length && <div className="ol-empty"><Target size={28} /><strong>{loading ? 'Finding contracts…' : 'Your next experiment starts here'}</strong><p>Load a chain to explore available {type}s, or try the Demo playground.</p></div>}</div>
        <p className="ol-footnote">Premium × 100 shares = cost of one standard contract. Only standard 100-share contracts are supported.</p>
      </section>
      <section className="ol-panel"><span className="ol-eyebrow">02 / PLAN YOUR TRADE</span><h3>Your options ticket</h3><div className="ol-contract"><span>{symbol} <b>{type.toUpperCase()}</b></span><strong>{contract ? `${money(contract.strike)} strike` : 'Select a contract'}</strong><small>Expires {expiration} · {contract?.source || 'No premium available'}</small>{mode === 'market' && contract && <small className='block mt-2'>Price timestamp: {contract.timestamp ? new Date(contract.timestamp).toLocaleString() : 'Unavailable'}</small>}</div><div className="ol-toggle"><button aria-pressed={side === 'buy'} onClick={() => setSide('buy')}>Buy to open</button><button aria-pressed={side === 'sell'} onClick={() => setSide('sell')}>Sell to close</button></div><label className="ol-quantity">Number of contracts<input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><div className="ol-quick">{[1, 2, 5].map((n) => <button key={n} onClick={() => setQuantity(n)}>{n} contract{n > 1 ? 's' : ''}</button>)}</div><dl className="ol-summary"><div><dt>You own</dt><dd>{owned} contracts</dd></div><div><dt>{side === 'buy' ? 'Estimated debit' : 'Estimated credit'}</dt><dd>{money(cost)}</dd></div><div><dt>Breakeven at expiry *</dt><dd>{contract ? money(breakeven) : '—'}</dd></div><div><dt>Maximum loss if buying *</dt><dd>{money(cost)}</dd></div></dl><p className="ol-footnote">* For a new long position at this premium, excluding fees. Calls can lose the entire premium; puts can too.</p>{!validCount && <p className="ol-warning">Enter a positive whole number of contracts.</p>}{side === 'buy' && cost > wallet.cash && <p className="ol-warning">This order exceeds your practice cash.</p>}{side === 'sell' && count > owned && <p className="ol-warning">You can sell only the contracts you own.</p>}<button className="ol-primary" disabled={blocked} onClick={trade}>{side === 'buy' ? 'Buy' : 'Sell'} practice {type} <ArrowUpRight size={18} /></button><p className="ol-footnote">No commissions, assignment, or automatic exercise. Expired positions are retained for review; reset the wallet to start again.</p></section>
    </div>
    <div aria-live="polite">{error && <p className="ol-alert ol-error">{error}</p>}{notice && <p className="ol-alert">{notice}</p>}</div>
    <section className="ol-panel ol-payoff"><div><span className="ol-eyebrow">03 / EXPLORE THE WHAT-IF</span><h3>What if the stock moves?</h3><p>Drag to explore this new long {type} at expiration. This is a scenario, not a forecast or a price before expiration.</p><label className="ol-slider-label" htmlFor="option-scenario">Stock price at expiry <strong>{money(scenarioPrice)}</strong></label><input id="option-scenario" type="range" min="-50" max="50" step="1" value={move} disabled={!contract} onChange={(e) => { setMove(Number(e.target.value)); setExplored(true); }} /><div className="ol-slider-label"><span>−50% from strike</span><span>+50% from strike</span></div><div className={`ol-result ${scenarioProfit >= 0 ? 'ol-positive' : 'ol-negative'}`}><span>Hypothetical {validCount ? count : 1}-contract P/L</span><strong>{contract ? money(scenarioProfit) : '—'}</strong></div></div><div className="ol-chart">{contract ? <PayoffChart contract={contract} quantity={validCount ? count : 1} price={scenarioPrice} /> : <p>Select a contract to see its payoff curve.</p>}<div className="ol-legend"><span /> Profit / loss at expiration · after premium</div></div></section>
    <section className="ol-panel ol-positions"><div className="ol-heading"><div><span className="ol-eyebrow">YOUR PRACTICE DESK</span><h3>Open options positions</h3></div><span className="ol-tag">{wallet.positions.length} OPEN</span></div><p className="ol-footnote">Estimates use the loaded chain where available, otherwise entry cost. Expired contracts are not settled automatically.</p><div className="ol-table-wrap"><table><thead><tr><th>Contract</th><th>Quantity</th><th>Avg. premium</th><th>Estimated value</th><th>Action</th></tr></thead><tbody>{wallet.positions.map((p) => { const mark = chain.find((c) => c.id === p.id); const expired = p.expiration <= new Date().toISOString().slice(0, 10); return <tr key={p.id}><td><strong>{p.symbol} {money(p.strike)} {p.type.toUpperCase()}</strong><small>{p.expiration}{expired ? ' · Expired / unsettled' : ''}</small></td><td>{p.quantity}</td><td>{money(p.average)}</td><td>{money((mark?.premium ?? p.average) * p.quantity * 100)}<small>{mark ? 'Loaded premium' : 'At entry cost'}</small></td><td><button disabled={expired} onClick={() => selectPosition(p)}>Review close</button></td></tr>; })}</tbody></table>{!wallet.positions.length && <div className="ol-empty"><FlaskConical size={28} /><strong>Room for your first experiment</strong><p>Choose a call or put above to start your practice portfolio.</p></div>}</div></section>
    <section className="ol-panel"><div className="ol-heading"><div><h3>Options trade journal</h3><p className="ol-footnote">Your latest 100 practice fills · {mode} wallet</p></div><button className="ol-secondary" onClick={() => setResetConfirm(!resetConfirm)}>Reset wallet</button></div>{resetConfirm && <div className="ol-alert">Clear this wallet’s positions and history and restore {money(STARTING_CASH)}?<div className="ol-quick"><button onClick={() => { save(emptyWallet()); setResetConfirm(false); setNotice('Practice wallet reset. Your next experiment awaits.'); }}>Yes, reset this wallet</button><button onClick={() => setResetConfirm(false)}>Keep practising</button></div></div>}<div className="ol-table-wrap"><table><thead><tr><th>Time</th><th>Contract</th><th>Side</th><th>Quantity</th><th>Total</th><th>Realized P/L</th></tr></thead><tbody>{wallet.history.map((o, i) => <tr key={`${o.date}-${i}`}><td>{new Date(o.date).toLocaleString()}</td><td>{o.symbol} {money(o.strike)} {o.type}<small>Expires {o.expiration}</small></td><td>{o.side === 'buy' ? 'Buy to open' : 'Sell to close'}</td><td>{o.quantity}</td><td>{money(o.total)}</td><td>{o.realized === null ? '—' : money(o.realized)}</td></tr>)}</tbody></table>{!wallet.history.length && <p className="ol-empty">Your practice trades will appear here.</p>}</div></section>
  </div>;
}

OptionsLab.propTypes = { active: PropTypes.bool };

function PayoffChart({ contract, quantity, price }) {
  const low = contract.strike * 0.5, high = contract.strike * 1.5;
  const values = Array.from({ length: 41 }, (_, i) => ({ x: low + (high - low) * i / 40, y: expirationProfit(contract, low + (high - low) * i / 40, quantity) }));
  const min = Math.min(0, ...values.map((p) => p.y)), max = Math.max(1, ...values.map((p) => p.y));
  const x = (v) => 55 + (v - low) / (high - low) * 450;
  const y = (v) => 190 - (v - min) / (max - min) * 160;
  return <svg viewBox="0 0 550 235" role="img" aria-label={`Long ${contract.type} expiration payoff. Selected scenario profit or loss: ${money(expirationProfit(contract, price, quantity))}.`}><line x1="55" x2="505" y1={y(0)} y2={y(0)} stroke="#52637c" strokeDasharray="5 5" /><text x="8" y={y(0) - 5} fill="#98aac3" fontSize="12">$0</text><polyline points={values.map((p) => `${x(p.x)},${y(p.y)}`).join(' ')} fill="none" stroke="#5eead4" strokeWidth="3" /><line x1={x(price)} x2={x(price)} y1="25" y2="195" stroke="#a78bfa" strokeDasharray="4 4" /><circle cx={x(price)} cy={y(expirationProfit(contract, price, quantity))} r="6" fill="#a78bfa" stroke="#fff" strokeWidth="2" /><text x="55" y="222" fill="#98aac3" fontSize="12">{money(low)}</text><text x="280" y="222" textAnchor="middle" fill="#98aac3" fontSize="12">Stock price at expiry</text><text x="505" y="222" textAnchor="end" fill="#98aac3" fontSize="12">{money(high)}</text></svg>;
}

PayoffChart.propTypes = {
  contract: PropTypes.shape({ type: PropTypes.string.isRequired, strike: PropTypes.number.isRequired, premium: PropTypes.number.isRequired, multiplier: PropTypes.number.isRequired }).isRequired,
  quantity: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
};
