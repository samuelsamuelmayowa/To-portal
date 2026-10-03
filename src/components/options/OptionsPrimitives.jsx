import PropTypes from 'prop-types';
import { decimal, percent } from '../../lib/optionsCalculations';
export function QueryStatus({ query, empty, children }) {
  if (query.isPending) return <p role="status" className="op-empty animate-pulse">Loading {children}…</p>;
  if (query.isError) return <div role="alert" className="op-error">{query.error.message} <button onClick={() => query.refetch()}>Retry</button></div>;
  return empty ? <p className="op-empty">{empty}</p> : null;
}
QueryStatus.propTypes = { query: PropTypes.object.isRequired, empty: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), children: PropTypes.node };
export const greekHelp = {
  iv: 'Implied volatility: the annualized volatility implied by this contract’s market price.',
  delta: 'Estimated premium sensitivity to a $1 move in the underlying.',
  gamma: 'Estimated change in Delta for a $1 move in the underlying.',
  theta: 'Estimated option value decay as time passes, all else equal.',
  vega: 'Estimated premium sensitivity to a one percentage point change in implied volatility.',
};
export function GreekLabel({ name }) { return <abbr tabIndex={0} title={greekHelp[name]}>{name === 'iv' ? 'IV' : name[0].toUpperCase() + name.slice(1)}</abbr>; }
GreekLabel.propTypes = { name: PropTypes.string.isRequired };
export function OptionsGreeks({ contract }) { return <dl className="op-greeks">{Object.keys(greekHelp).map(name => <div key={name}><dt><GreekLabel name={name} /></dt><dd>{name === 'iv' ? percent(contract?.iv == null ? null : contract.iv * 100) : decimal(contract?.[name])}</dd></div>)}</dl>; }
OptionsGreeks.propTypes = { contract: PropTypes.object };
