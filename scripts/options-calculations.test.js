import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../src/lib/optionsCalculations.js';
test('mark handles absent values, crossed quotes and valid zero bids', () => {
  assert.equal(c.getOptionMark({ bid: 4, ask: 6, last: 8 }), 5);
  assert.equal(c.getOptionMark({ bid: 0, ask: 2 }), 1);
  assert.equal(c.getOptionMark({ bid: null, ask: null, last: 4 }), 4);
  assert.equal(c.getOptionMark({ bid: 6, ask: 4, last: 3 }), 3);
  assert.equal(c.getOptionMark({ bid: null, ask: 4 }), null);
  assert.equal(c.money(null), '—');
});
test('long call and put payoff, cost and P/L use 100 shares per contract', () => {
  assert.equal(c.calculateContractCost(5, 2), 1000);
  assert.equal(c.calculateBreakeven('call', 100, 5), 105);
  assert.equal(c.calculateBreakeven('put', 100, 5), 95);
  assert.equal(c.calculateExpirationPayoff('call', 100, 5, 110, 2), 1000);
  assert.equal(c.calculateExpirationPayoff('put', 100, 5, 90, 2), 1000);
  assert.equal(c.calculateExpirationPayoff('put', 100, 5, 110, 2), -1000);
  assert.equal(c.calculateUnrealizedPnl(5, null, 2), null);
  assert.equal(c.calculateRealizedPnl(5, 6, 2), 200);
});
test('nearest strike is ATM and put moneyness reverses call moneyness', () => {
  assert.equal(c.getMoneyness('call', 100, 101, [95, 100, 105]), 'ATM');
  assert.equal(c.getMoneyness('put', 105, 101, [95, 100, 105]), 'ITM');
  assert.equal(c.getMoneyness('call', 105, 101, [95, 100, 105]), 'OTM');
  assert.equal(c.getMoneyness('call', 100, null, [100]), '—');
  assert.equal(c.calculateDTE('2026-10-16', new Date('2026-10-02T18:00:00Z')), 14);
});
