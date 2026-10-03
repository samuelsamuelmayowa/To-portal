import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { money, percent, getOptionMark, calculateExpirationPayoff, calculateContractCost, calculateBreakeven } from '../../lib/optionsCalculations';
export default function OptionsPayoff({ contract, quantity, onExplore }) {
  const [scenario, setScenario] = useState(null);
  const id = useId().replace(/:/g, '');
  const premium = getOptionMark(contract);
  if (!contract || premium == null) return <section className="op-panel"><h3>Expiration Payoff</h3><p className="op-empty">Select a priced contract to explore its payoff.</p></section>;
  const { strike, type } = contract;
  const breakeven = calculateBreakeven(type, strike, premium);
  const low = Math.max(0, Math.min(strike * 0.5, breakeven * 0.8)), high = Math.max(strike * 1.5, breakeven * 1.2);
  const price = Math.max(low, Math.min(high, scenario ?? strike));
  const profit = p => calculateExpirationPayoff(type, strike, premium, p, quantity);
  const points = [...new Set([low, strike, high, Math.max(low, breakeven)])].sort((a, b) => a - b).map(p => ({ price: p, profit: profit(p) }));
  const min = Math.min(0, ...points.map(p => p.profit)), max = Math.max(1, ...points.map(p => p.profit));
  const x = p => 70 + (p - low) / (high - low) * 470;
  const y = p => 190 - (p - min) / (max - min) * 150;
  const curve = points.map(p => `${x(p.price)},${y(p.profit)}`).join(' ');
  const area = `${x(low)},${y(0)} ${curve} ${x(high)},${y(0)}`;
  const pnl = profit(price), cost = calculateContractCost(premium, quantity);
  return <section className="op-panel op-payoff"><div className="op-heading"><div><span className="op-eyebrow">Explore your scenario</span><h3>Expiration Payoff</h3></div><span className="op-tag">LONG {type.toUpperCase()}</span></div>
    <svg viewBox="0 0 580 240" role="img" aria-label={`Expiration payoff: ${money(pnl)} at an underlying price of ${money(price)}`}>
      <defs><clipPath id={`${id}-profit`}><rect x="0" y="0" width="580" height={Math.max(0, y(0))} /></clipPath><clipPath id={`${id}-loss`}><rect x="0" y={y(0)} width="580" height="240" /></clipPath></defs>
      <polygon points={area} fill="#34d399" opacity=".18" clipPath={`url(#${id}-profit)`} /><polygon points={area} fill="#fb7185" opacity=".18" clipPath={`url(#${id}-loss)`} />
      <line x1="70" x2="540" y1={y(0)} y2={y(0)} stroke="#52637c" strokeDasharray="5 5" /><text x="5" y={y(0)}>$0</text><text x="5" y="40">{money(max)}</text><text x="5" y="190">{money(min)}</text>
      <polyline points={curve} fill="none" stroke="#38bdf8" strokeWidth="3" />
      <line x1={x(strike)} x2={x(strike)} y1="30" y2="195" stroke="#94a3b8" strokeDasharray="3 5" /><text x={x(strike)} y="215" textAnchor="middle">Strike {money(strike)}</text>
      {breakeven >= low && <><line x1={x(breakeven)} x2={x(breakeven)} y1="30" y2="195" stroke="#34d399" strokeDasharray="3 5" /><text x={x(breakeven)} y="20" textAnchor="middle">BE {money(breakeven)}</text></>}
      <circle cx={x(price)} cy={y(pnl)} r="5" fill={pnl >= 0 ? '#34d399' : '#fb7185'} /><text x="70" y="235">{money(low)}</text><text x="540" y="235" textAnchor="end">{money(high)}</text>
    </svg>
    <label className="op-slider">Stock price at expiration <strong>{money(price)}</strong><input aria-label="Hypothetical stock price at expiration" type="range" min={low} max={high} step="0.01" value={price} onChange={e => { setScenario(Number(e.target.value)); onExplore(); }} /></label>
    <div className="op-heading"><span>Hypothetical P/L · {quantity} contract(s)</span><strong className={pnl >= 0 ? 'op-positive' : 'op-negative'}>{money(pnl)} ({percent(cost > 0 ? pnl / cost * 100 : null)})</strong></div>
    <p className="op-note">This scenario illustrates profit/loss at expiration and is not a market forecast. Excludes fees. Maximum loss is the premium paid.</p></section>;
}
OptionsPayoff.propTypes = { contract: PropTypes.object, quantity: PropTypes.number.isRequired, onExplore: PropTypes.func.isRequired };
