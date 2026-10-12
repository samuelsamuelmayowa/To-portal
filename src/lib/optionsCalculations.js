export const CONTRACT_MULTIPLIER = 100;
export const isNumber = value => typeof value === 'number' && Number.isFinite(value);
export const money = value => isNumber(value) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : '—';
export const decimal = value => isNumber(value) ? value.toFixed(3) : '—';
export const percent = value => isNumber(value) ? `${value.toFixed(2)}%` : '—';
export function getOptionMark(c) {
  if (!c) return null;
  if (isNumber(c.bid) && isNumber(c.ask) && c.bid >= 0 && c.ask > 0 && c.ask >= c.bid) return (c.bid + c.ask) / 2;
  return isNumber(c.last) && c.last > 0 ? c.last : null;
}
export const calculateContractCost = (premium, quantity = 1) => isNumber(premium) && Number.isSafeInteger(quantity) && quantity > 0 ? premium * CONTRACT_MULTIPLIER * quantity : null;
export const calculateMaxLoss = calculateContractCost;
export const calculatePositionMarketValue = calculateContractCost;
export const calculateBreakeven = (type, strike, premium) => isNumber(premium) && isNumber(strike) ? strike + (type === 'call' ? premium : -premium) : null;
export function canBuyOptionsOrder({ selectedContract, contract, premium, quantity, buyingPower, hasSession, accountLoaded, marketAvailable, pending }) {
  const debit = calculateContractCost(premium, quantity);
  return Boolean(selectedContract && contract && isNumber(premium) && premium > 0
    && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 10000
    && isNumber(buyingPower) && isNumber(debit) && debit <= buyingPower
    && hasSession && accountLoaded && marketAvailable && !pending);
}
export const calculateRealizedPnl = (entry, exit, quantity) => isNumber(entry) && isNumber(exit) ? calculateContractCost(exit - entry, quantity) : null;
export const calculateUnrealizedPnl = calculateRealizedPnl;
export function calculateExpirationPayoff(type, strike, premium, price, quantity) {
  if (![strike, premium, price].every(isNumber)) return null;
  return calculateContractCost(Math.max(type === 'call' ? price - strike : strike - price, 0) - premium, quantity);
}
export function calculateDTE(expiration, now = new Date()) {
  const days = Math.ceil((Date.parse(`${expiration}T00:00:00Z`) - Date.parse(now.toISOString().slice(0, 10))) / 86400000);
  return Number.isFinite(days) ? Math.max(0, days) : null;
}
export function getMoneyness(type, strike, spot, strikes = []) {
  if (!isNumber(spot)) return '—';
  const nearest = strikes.filter(isNumber).reduce((best, s) => best == null || Math.abs(s - spot) < Math.abs(best - spot) ? s : best, null);
  if (strike === nearest || strike === spot) return 'ATM';
  return (type === 'call' ? spot > strike : spot < strike) ? 'ITM' : 'OTM';
}
export function isStale(c, now = Date.now()) {
  const age = now - Date.parse(c?.timestamp);
  return !Number.isFinite(age) || age > 20 * 60000 || age < -60000;
}
