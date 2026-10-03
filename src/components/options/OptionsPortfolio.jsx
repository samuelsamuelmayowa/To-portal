import PropTypes from 'prop-types';
import { money, percent, getOptionMark, isStale, calculateDTE, calculatePositionMarketValue, calculateUnrealizedPnl } from '../../lib/optionsCalculations';
import { QueryStatus } from './OptionsPrimitives';
function positionMark(p) { return isStale(p.current) ? null : getOptionMark(p.current); }
export function OptionsAccountSummary({ account, positions }) {
  const rows = positions.data?.positions || [];
  const complete = positions.isSuccess && !positions.isError && rows.every(p => positionMark(p) != null);
  const marketValue = complete ? rows.reduce((sum, p) => sum + calculatePositionMarketValue(positionMark(p), p.quantity), 0) : null;
  const cash = account.isError ? null : account.data?.cash;
  const value = cash != null && marketValue != null ? cash + marketValue : null;
  return <section className="op-panel"><QueryStatus query={account}>practice account</QueryStatus><div className="op-account">{[['Practice Cash', cash], ['Options Market Value', marketValue], ['Account Value', value], ["Today’s P/L", account.data?.todayPnl], ['Total P/L', value == null ? null : value - account.data.initialCash], ['Buying Power', cash]].map(([label, amount]) => <div key={label}><span>{label}</span><strong>{money(amount)}</strong></div>)}</div><p className="op-note">Separate Options wallet · Today’s P/L requires a daily valuation baseline and is currently unavailable.{!complete && ' Portfolio valuation requires current data for every position.'}</p></section>;
}
OptionsAccountSummary.propTypes = { account: PropTypes.object.isRequired, positions: PropTypes.object.isRequired };
export function OptionsPositions({ query, onClose, pending }) {
  const rows = query.data?.positions || [];
  return <section className="op-panel"><div className="op-heading"><h3>Open Options positions</h3><span className="op-tag">{rows.length} OPEN</span></div><QueryStatus query={query} empty={!rows.length && 'No open Options positions.'}>positions</QueryStatus>{query.data?.marketError && <p role="alert" className="op-warning">Market data unavailable: {query.data.marketError}</p>}
    {rows.length > 0 && <div className="op-table-scroll"><table><thead><tr>{['Contract / expiration', 'Qty', 'Avg. entry', 'Est. mark', 'Market value', 'Unrealized P/L', 'Return', 'DTE', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(p => {
      const mark = query.isError ? null : positionMark(p), pnl = calculateUnrealizedPnl(p.average, mark, p.quantity), expired = calculateDTE(p.expiration) === 0;
      return <tr key={p.symbol}><td><strong>{p.underlyingSymbol} {money(p.strike)} {p.type.toUpperCase()}</strong><small>{p.expiration} · {p.symbol}</small>{mark == null && <small>Market data unavailable or stale</small>}</td><td>{p.quantity}</td><td>{money(p.average)}</td><td>{money(mark)}</td><td>{money(calculatePositionMarketValue(mark, p.quantity))}</td><td className={pnl == null ? '' : pnl >= 0 ? 'op-positive' : 'op-negative'}>{money(pnl)}</td><td>{percent(pnl == null || p.average <= 0 ? null : pnl / (p.average * 100 * p.quantity) * 100)}</td><td>{calculateDTE(p.expiration)}</td><td><button disabled={pending || mark == null || expired} onClick={() => onClose(p)}>Sell to Close</button>{expired && <small>Expired · unsettled</small>}</td></tr>;
    })}</tbody></table></div>}<p className="op-note">Sell to Close sells your full held quantity at a server-verified estimated premium. No automatic exercise or assignment. Expired positions remain for review.</p></section>;
}
OptionsPositions.propTypes = { query: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired, pending: PropTypes.bool };
export function OptionsHistory({ query }) {
  const rows = query.data?.history || [];
  return <section className="op-panel"><h3>Options trade history</h3><QueryStatus query={query} empty={!rows.length && 'No Options trades yet.'}>trade history</QueryStatus>{rows.length > 0 && <div className="op-table-scroll"><table><thead><tr>{['Date / time', 'Contract', 'Action', 'Quantity', 'Fill premium', 'Total', 'Realized P/L', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(f => <tr key={f.requestId}><td>{new Date(f.date).toLocaleString()}</td><td>{f.underlyingSymbol} {money(f.strike)} {f.type.toUpperCase()}<small>{f.expiration} · {f.symbol}</small></td><td>{f.action === 'buy' ? 'Buy to Open' : 'Sell to Close'}</td><td>{f.quantity}</td><td>{money(f.premium)}</td><td>{money(f.total)}</td><td>{money(f.realizedPnl)}</td><td>{f.status}<small>Alpaca {f.feed}</small></td></tr>)}</tbody></table></div>}</section>;
}
OptionsHistory.propTypes = { query: PropTypes.object.isRequired };
