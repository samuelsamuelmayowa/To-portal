export const STARTING_CASH = 10000;
export const emptyWallet = () => ({ cash: STARTING_CASH, positions: [], history: [] });
const cents = (value) => Math.round(value * 100) / 100;

export function expirationProfit(contract, stockPrice, quantity = 1) {
  const intrinsic = Math.max(0, contract.type === 'call' ? stockPrice - contract.strike : contract.strike - stockPrice);
  return cents((intrinsic - contract.premium) * contract.multiplier * quantity);
}

export function demoChain(symbol, expiration, spot = 200) {
  return Array.from({ length: 9 }, (_, index) => cents(spot * (0.8 + index * 0.05))).flatMap((strike) =>
    ['call', 'put'].map((type) => {
      const intrinsic = Math.max(0, type === 'call' ? spot - strike : strike - spot);
      const timeValue = spot * 0.025 * Math.exp(-Math.abs(spot - strike) / (spot * 0.15));
      return { id: `demo:${symbol}:${expiration}:${type}:${strike}`, symbol, expiration, type, strike, premium: cents(intrinsic + timeValue), multiplier: 100, source: 'Illustrative premium' };
    }),
  );
}

export function normalizeContract(item, symbol) {
  const d = item.details || {};
  const premium = Number(item.last_quote?.midpoint ?? item.last_trade?.price ?? item.day?.close);
  if (!['call', 'put'].includes(d.contract_type) || !Number.isFinite(premium) || premium <= 0 || Number(d.shares_per_contract) !== 100 || !(Number(d.strike_price) > 0) || !d.ticker || !/^\d{4}-\d{2}-\d{2}$/.test(d.expiration_date)) return null;
  return { id: d.ticker, symbol, expiration: d.expiration_date, type: d.contract_type, strike: Number(d.strike_price), premium, multiplier: 100, source: item.last_quote?.midpoint != null ? 'Quote midpoint' : item.last_trade?.price != null ? 'Last trade' : 'Daily close' };
}

export function normalizeAlpacaContract(ticker, snapshot, symbol, feed) {
  const match = /^([A-Z]+)(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/.exec(ticker);
  if (!match || match[1] !== symbol || !snapshot) return null;
  const expiration = `20${match[2]}-${match[3]}-${match[4]}`;
  const strike = Number(match[6]) / 1000;
  const bid = Number(snapshot.latestQuote?.bp);
  const ask = Number(snapshot.latestQuote?.ap);
  const hasQuote = Number.isFinite(bid) && bid >= 0 && Number.isFinite(ask) && ask > 0 && ask >= bid;
  const premium = hasQuote ? (bid + ask) / 2 : Number(snapshot.latestTrade?.p);
  if (!Number.isFinite(premium) || premium <= 0 || strike <= 0 || Number.isNaN(Date.parse(expiration))) return null;
  return { id: ticker, symbol, expiration, type: match[5] === 'C' ? 'call' : 'put', strike, premium, multiplier: 100, feed,
    source: `${feed === 'indicative' ? 'Indicative' : 'OPRA'} ${hasQuote ? 'quote midpoint' : 'last trade'}`,
    timestamp: (hasQuote ? snapshot.latestQuote?.t : snapshot.latestTrade?.t) || null,
    bid: hasQuote ? bid : null, ask: hasQuote ? ask : null,
  };
}

// Pure accounting: long contracts only, with the multiplier applied to every fill.
export function placeOptionOrder(wallet, contract, quantity, side, now = new Date()) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new Error('Enter a whole number of contracts greater than zero.');
  if (!['buy', 'sell'].includes(side)) throw new Error('Invalid order side.');
  if (!contract || !Number.isFinite(contract.premium) || contract.premium <= 0 || contract.multiplier !== 100) throw new Error('Select a contract with an available premium.');
  if (contract.expiration <= now.toISOString().slice(0, 10)) throw new Error('This contract has reached its expiration date. Select a later expiration.');
  const total = cents(quantity * contract.premium * contract.multiplier);
  if (!Number.isFinite(total)) throw new Error('Order size is too large.');
  const existing = wallet.positions.find((position) => position.id === contract.id);
  if (side === 'buy' && total > wallet.cash) throw new Error('Not enough options practice cash for this order.');
  if (side === 'sell' && (!existing || quantity > existing.quantity)) throw new Error('You can only sell contracts you already own.');
  const remaining = (existing?.quantity || 0) + (side === 'buy' ? quantity : -quantity);
  const average = side === 'buy' ? ((existing?.average || 0) * (existing?.quantity || 0) + contract.premium * quantity) / remaining : existing.average;
  const positions = wallet.positions.filter((position) => position.id !== contract.id);
  if (remaining) positions.push({ ...contract, quantity: remaining, average });
  const order = { ...contract, quantity, side, total, date: now.toISOString(), realized: side === 'sell' ? cents((contract.premium - existing.average) * quantity * contract.multiplier) : null };
  return { cash: cents(wallet.cash + (side === 'buy' ? -total : total)), positions, history: [order, ...wallet.history].slice(0, 100) };
}
