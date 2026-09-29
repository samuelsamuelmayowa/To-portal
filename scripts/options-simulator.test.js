import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyWallet, expirationProfit, normalizeContract, placeOptionOrder } from '../src/lib/optionsSimulator.js';

const contract = { id: 'test-call', symbol: 'AAPL', type: 'call', strike: 100, premium: 5, multiplier: 100, expiration: '2099-01-01' };
test('long call and put payoffs include premium and the 100-share multiplier', () => {
  assert.equal(expirationProfit(contract, 105), 0);
  assert.equal(expirationProfit(contract, 90, 2), -1000);
  assert.equal(expirationProfit(contract, 120, 2), 3000);
  assert.equal(expirationProfit({ ...contract, type: 'put' }, 95), 0);
  assert.equal(expirationProfit({ ...contract, type: 'put' }, 80), 1500);
});
test('buy, average, partial sell, and full close conserve practice cash', () => {
  let wallet = placeOptionOrder(emptyWallet(), contract, 2, 'buy');
  assert.equal(wallet.cash, 9000);
  wallet = placeOptionOrder(wallet, { ...contract, premium: 8 }, 1, 'buy');
  assert.equal(wallet.positions[0].average, 6);
  wallet = placeOptionOrder(wallet, { ...contract, premium: 9 }, 1, 'sell');
  assert.equal(wallet.history[0].realized, 300);
  assert.equal(wallet.positions[0].quantity, 2);
  wallet = placeOptionOrder(wallet, { ...contract, premium: 9 }, 2, 'sell');
  assert.equal(wallet.positions.length, 0);
  assert.equal(wallet.cash, 10900);
});
test('invalid quantities, overspending, naked sells, and expiration are blocked', () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => placeOptionOrder(emptyWallet(), contract, quantity, 'buy'));
  assert.throws(() => placeOptionOrder(emptyWallet(), contract, 21, 'buy'), /cash/);
  assert.throws(() => placeOptionOrder(emptyWallet(), contract, 1, 'sell'), /own/);
  assert.throws(() => placeOptionOrder(emptyWallet(), { ...contract, expiration: '2000-01-01' }, 1, 'buy'), /expiration/);
  assert.throws(() => placeOptionOrder(emptyWallet(), { ...contract, premium: NaN }, 1, 'buy'));
});
test('market snapshots preserve provenance and exclude unpriced or adjusted contracts', () => {
  const item = { details: { ticker: 'O:TEST', contract_type: 'call', strike_price: 100, expiration_date: '2099-01-01', shares_per_contract: 100 }, last_quote: { midpoint: 2 }, day: { close: 1 } };
  assert.equal(normalizeContract(item, 'AAPL').premium, 2);
  assert.equal(normalizeContract({ ...item, last_quote: null }, 'AAPL').source, 'Daily close');
  assert.equal(normalizeContract({ ...item, details: { ...item.details, shares_per_contract: 10 } }, 'AAPL'), null);
  assert.equal(normalizeContract({ ...item, last_quote: null, day: null }, 'AAPL'), null);
});
