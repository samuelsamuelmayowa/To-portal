import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { money, decimal, percent, getOptionMark, getMoneyness, calculateBreakeven, calculateContractCost } from '../../lib/optionsCalculations';
import { GreekLabel, QueryStatus } from './OptionsPrimitives';
export default function OptionsChain({ query, spot, selectedContract, onSelectContract, advanced }) {
  const contracts = query.data?.contracts || [];
  const strikes = contracts.map(c => c.strike);
  const marker = spot == null ? -1 : Math.max(0, contracts.findIndex(c => c.strike >= spot) === -1 ? contracts.length - 1 : contracts.findIndex(c => c.strike >= spot));
  return <><QueryStatus query={query} empty={!contracts.length && 'No options contracts are available for this expiration.'}>options chain</QueryStatus>
    {query.data && !query.isError && <div className="op-table-scroll"><table><thead><tr><th>Strike</th><th>Bid</th><th>Ask</th><th>Last</th>{advanced ? ['iv', 'delta', 'gamma', 'theta', 'vega'].map(k => <th key={k}><GreekLabel name={k} /></th>) : <><th>Est. cost</th><th>Breakeven</th><th>Moneyness</th></>}</tr></thead><tbody>{contracts.map((c, i) => {
      const mark = getOptionMark(c), state = getMoneyness(c.type, c.strike, spot, strikes);
      const isSelected = selectedContract?.symbol === c.symbol;
      return <Fragment key={c.symbol}>{i === marker && <tr className="op-spot"><td colSpan={advanced ? 9 : 7}>Underlying {money(spot)} ↓</td></tr>}<tr
        className={`op-contract-row ${isSelected ? 'op-selected' : ''} ${state === 'ITM' ? 'op-itm' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Select ${c.symbol}, ${c.type} ${money(c.strike)} expiring ${c.expiration}`}
        onClick={() => onSelectContract(c)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectContract(c);
          }
        }}
      ><td><span className="op-strike">{money(c.strike)}</span></td><td>{money(c.bid)}</td><td>{money(c.ask)}</td><td>{money(c.last)}</td>{advanced ? ['iv', 'delta', 'gamma', 'theta', 'vega'].map(k => <td key={k}>{k === 'iv' ? percent(c.iv == null ? null : c.iv * 100) : decimal(c[k])}</td>) : <><td>{money(calculateContractCost(mark))}</td><td>{money(calculateBreakeven(c.type, c.strike, mark))}</td><td><span className={`op-tag op-${state.toLowerCase()}`}>{state}</span></td></>}</tr></Fragment>;
    })}</tbody></table></div>}
    {query.data?.hasMore && <p className="op-warning">This chain is incomplete because the provider result limit was reached.</p>}
    <p className="op-note">Select a strike to plan a trade. Cost and breakeven use an estimated midpoint, or last trade when no valid two-sided quote exists. Standard multiplier: 100.</p></>;
}
OptionsChain.propTypes = { query: PropTypes.object.isRequired, spot: PropTypes.number, selectedContract: PropTypes.object, onSelectContract: PropTypes.func.isRequired, advanced: PropTypes.bool.isRequired };
