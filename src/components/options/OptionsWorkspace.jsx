import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, ShieldCheck, Search } from 'lucide-react';
import StockChart from '../trading/StockChart';
import OptionsChain from './OptionsChain';
import OptionsPayoff from './OptionsPayoff';
import { OptionsAccountSummary, OptionsPositions, OptionsHistory } from './OptionsPortfolio';
import { OptionsGreeks, QueryStatus } from './OptionsPrimitives';
import { useOptionsData, useOptionsSearch } from './useOptionsData';
import { money, getOptionMark, calculateBreakeven, calculateContractCost, calculateDTE, getMoneyness, isStale } from '../../lib/optionsCalculations';
import './OptionsWorkspace.css';

export default function OptionsWorkspace({ active = true }) {
  const [asset, setAsset] = useState({ symbol: 'AAPL', name: 'Apple Inc.' });
  const [search, setSearch] = useState('');
  const [expiration, setExpiration] = useState('');
  const [type, setType] = useState('call');
  const [selected, setSelected] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [explored, setExplored] = useState(false);
  const [notice, setNotice] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  const data = useOptionsData(asset.symbol, expiration, type, active);
  const results = useOptionsSearch(search, active);
  const { quote, expirations, chain, account, positions, history, order, reset } = data;
  const dates = expirations.data?.expirations || [];
  useEffect(() => { if (expirations.data && !expirations.data.expirations.includes(expiration)) setExpiration(expirations.data.expirations[0] || ''); }, [expirations.data, expiration]);
  const contract = !chain.isError && selected?.underlyingSymbol === asset.symbol && selected?.expiration === expiration && selected?.type === type
    ? chain.data?.contracts.find(c => c.symbol === selected.symbol) || null
    : null;
  const underlyingQuote = quote.isError ? null : quote.data;
  const premium = getOptionMark(contract), count = Number(quantity);
  const validQuantity = Number.isSafeInteger(count) && count > 0 && count <= 10000;
  const cost = calculateContractCost(premium, count);
  const stale = contract && isStale(contract);
  const blocked = !data.session || !contract || premium == null || !validQuantity || stale || calculateDTE(contract?.expiration) === 0 || !account.isSuccess || account.isError || cost > account.data.cash || order.isPending || reset.isPending || chain.isError;
  const milestones = [Boolean(contract), explored, history.data?.history.some(f => f.action === 'buy'), history.data?.history.some(f => f.action === 'sell')];
  function clearSelection() { setSelected(null); setExplored(false); setNotice(''); order.reset(); }
  function chooseAsset(next) { clearSelection(); setAsset(next); setExpiration(''); setSearch(''); }
  async function submit(symbol, qty, action) {
    setNotice('');
    try { const result = await order.mutateAsync({ symbol, quantity: qty, action, requestId: crypto.randomUUID() }); setNotice(`${action === 'buy' ? 'Buy to Open' : 'Sell to Close'} filled${result.fill ? ` at ${money(result.fill.premium)} per share` : ''}. Options virtual funds updated.`); } catch { /* Mutation error is displayed below. */ }
  }
  return <div className="options-workspace">
    <header className="op-heading op-title"><div><span className="op-eyebrow">T.O. Analytics / Options desk</span><h2>Options simulator</h2><p>Practice Account · Virtual Funds · No Real Orders</p></div><button className="op-refresh" onClick={data.refresh} disabled={chain.isFetching || order.isPending}><RefreshCw size={15} /> Refresh</button></header>
    <div className="op-disclosure"><ShieldCheck size={16} /><span>Paper Trading / Educational Simulator · Long calls & puts only</span><span className="op-source">Market Data · {chain.data?.feed ? `Alpaca ${chain.data.feed === 'opra' ? 'OPRA' : 'Indicative'}` : 'Alpaca — awaiting data'}</span></div>
    {chain.data?.feed === 'indicative' && <p className="op-note">Indicative quotes are modified and trades may be delayed. All fills are estimates using available market data.</p>}
    {data.authError && <p role="alert" className="op-error">Practice session: {data.authError}</p>}
    <OptionsAccountSummary account={account} positions={positions} />
    <details className="op-journey"><summary>Your Options Journey <span>{milestones.filter(Boolean).length}/4 milestones</span></summary><div>{['Pick a contract', 'Explore the payoff', 'Buy a practice contract', 'Close a position'].map((label, i) => <span key={label} className={milestones[i] ? 'op-positive' : ''}>{milestones[i] ? '✓' : i + 1} {label}</span>)}</div></details>
    <div className="op-workspace-grid"><div className="op-main">
      <section className="op-panel"><div className="op-underlying"><div className="op-search"><label htmlFor="options-search"><Search size={16} /> Find an underlying</label><input id="options-search" placeholder="Search symbol or company" value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" />{search && <div className="op-search-results">{results.isFetching && <p role="status">Searching…</p>}{results.isError && <p role="alert">{results.error.message}</p>}{results.data?.map(row => <button key={row.symbol} onClick={() => chooseAsset(row)}><strong>{row.symbol}</strong> {row.name}</button>)}{results.isSuccess && !results.data.length && <p>No matching stocks.</p>}</div>}</div><div><h3>{asset.symbol} <span className="op-muted">{asset.name}</span></h3><strong className="op-spot-price">{money(underlyingQuote?.marketPrice)}</strong><p className="op-note">Bid {money(underlyingQuote?.bid)} / Ask {money(underlyingQuote?.ask)} · {underlyingQuote?.timestamp ? new Date(underlyingQuote.timestamp).toLocaleString() : 'Timestamp unavailable'}</p></div></div><QueryStatus query={quote}>underlying quote</QueryStatus></section>
      <section className="op-panel op-chart-panel"><div className="op-heading"><h3>Underlying chart</h3><span className="op-tag">{asset.symbol}</span></div><StockChart symbol={asset.symbol} active={active} /></section>
      <section className="op-panel"><div className="op-heading"><h3>Options Chain</h3><div className="op-toggle">{[false, true].map(value => <button key={String(value)} aria-pressed={advanced === value} onClick={() => setAdvanced(value)}>{value ? 'Greeks & IV' : 'Basic'}</button>)}</div></div>
        <div className="op-filters"><label>Expiration<select value={expiration} disabled={!dates.length} onChange={e => { clearSelection(); setExpiration(e.target.value); }}>{!dates.length && <option value="">No expirations</option>}{dates.map(date => <option key={date} value={date}>{date} · {calculateDTE(date)} DTE</option>)}</select></label><div className="op-toggle">{['call', 'put'].map(value => <button key={value} aria-pressed={type === value} onClick={() => { clearSelection(); setType(value); }}>{value === 'call' ? 'CALLS' : 'PUTS'}</button>)}</div></div>
        <QueryStatus query={expirations} empty={!dates.length && 'No Options expirations are available for this symbol.'}>expiration dates</QueryStatus>
        {expirations.data?.hasMore && <p className="op-warning">The provider returned a partial expiration list.</p>}
        {expiration && <OptionsChain query={chain} spot={underlyingQuote?.marketPrice} selected={contract} onSelect={c => { setSelected(c); setExplored(false); order.reset(); }} advanced={advanced} />}
      </section>
    </div><aside className="op-aside">
      <section className="op-panel"><span className="op-eyebrow">Selected contract</span><h3>{contract ? `${asset.symbol} ${money(contract.strike)} ${type.toUpperCase()}` : 'Choose a strike'}</h3>{contract ? <><p className="op-note">{contract.symbol} · {contract.expiration} · {calculateDTE(contract.expiration)} DTE</p><div className="op-heading"><strong className="op-spot-price">{money(premium)}</strong><span className="op-tag">{getMoneyness(type, contract.strike, underlyingQuote?.marketPrice, chain.data?.contracts.map(c => c.strike))}</span></div><p className="op-note">Estimated premium / share · Bid {money(contract.bid)} · Ask {money(contract.ask)} · Last {money(contract.last)}</p><OptionsGreeks contract={contract} /><p className="op-note">Quote: {contract.quoteTimestamp ? new Date(contract.quoteTimestamp).toLocaleString() : 'Unavailable'}<br />Premium timestamp: {contract.timestamp ? new Date(contract.timestamp).toLocaleString() : 'Unavailable'}</p>{stale && <p className="op-warning">Stale or unavailable timestamp. Practice trading is disabled until fresh market data is available.</p>}{premium == null && <p className="op-warning">This contract has no usable quote or latest trade.</p>}</> : <p className="op-empty">Select a contract from the chain to see its data and plan a trade.</p>}</section>
      <OptionsPayoff key={contract?.symbol || 'empty'} contract={contract} quantity={validQuantity ? count : 1} onExplore={() => setExplored(true)} />
      <section className="op-panel op-ticket"><span className="op-eyebrow">Buy to Open</span><h3>Practice order</h3><label>Number of contracts<input type="number" min="1" max="10000" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} /></label><dl className="op-order-summary"><div><dt>Estimated debit / maximum loss</dt><dd>{money(cost)}</dd></div><div><dt>Breakeven at expiration</dt><dd>{money(contract ? calculateBreakeven(type, contract.strike, premium) : null)}</dd></div><div><dt>Options buying power</dt><dd>{money(account.data?.cash)}</dd></div></dl>{!validQuantity && <p className="op-warning">Enter 1–10,000 whole contracts.</p>}{cost != null && account.data && cost > account.data.cash && <p className="op-warning">Insufficient Options practice buying power.</p>}<button className="op-primary" disabled={blocked} onClick={() => submit(contract.symbol, count, 'buy')}>{order.isPending ? 'Submitting…' : `Buy Practice ${type === 'call' ? 'Call' : 'Put'}`}</button><p className="op-note">Practice Order · No Real Money. The server verifies the current estimated premium before filling; it can differ from this preview.</p></section>
    </aside></div>
    <div aria-live="polite">{order.isError && <p role="alert" className="op-error">{order.error.message}</p>}{notice && <p className="op-success">{notice}</p>}</div>
    <OptionsPositions query={positions} pending={order.isPending || reset.isPending} onClose={p => submit(p.symbol, p.quantity, 'sell')} />
    <OptionsHistory query={history} />
    <footer className="op-panel"><div className="op-heading"><p className="op-note">Options practice records are saved to your authenticated account. Legacy browser playground saves remain in your browser and are not imported as verified balances.</p><button onClick={() => setResetConfirm(!resetConfirm)} disabled={order.isPending || reset.isPending || !data.session}>Reset Options account</button></div>{resetConfirm && <div className="op-warning"><p>Clear this Options account’s positions and history and restore {money(account.data?.initialCash)} in virtual funds?</p><button disabled={reset.isPending} onClick={async () => { try { await reset.mutateAsync(); setResetConfirm(false); setNotice('Options practice account reset.'); } catch { /* Display mutation error. */ } }}>Confirm reset</button> <button onClick={() => setResetConfirm(false)}>Cancel</button></div>}{reset.isError && <p role="alert" className="op-error">{reset.error.message}</p>}</footer>
  </div>;
}
OptionsWorkspace.propTypes = { active: PropTypes.bool };
