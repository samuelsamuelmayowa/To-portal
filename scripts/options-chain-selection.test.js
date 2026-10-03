import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { createServer } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function findContractRow(node, symbol) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findContractRow(child, symbol);
      if (match) return match;
    }
  } else if (React.isValidElement(node)) {
    if (node.props.role === 'button' && node.props['aria-label']?.includes(symbol)) return node;
    return findContractRow(node.props.children, symbol);
  }
  return null;
}

test('clicking rendered option rows updates parent selection and enables a priced order ticket', async t => {
  const vite = await createServer({
    configFile: resolve(fileURLToPath(new URL('../', import.meta.url)), 'vite.config.js'),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  t.after(() => vite.close());

  const [{ default: OptionsChain }, { canBuyOptionsOrder, calculateContractCost, getOptionMark }] = await Promise.all([
    vite.ssrLoadModule('/src/components/options/OptionsChain.jsx'),
    vite.ssrLoadModule('/src/lib/optionsCalculations.js'),
  ]);
  const contracts = [770, 771].map(strike => ({
    symbol: `SPY261005C${String(strike * 1000).padStart(8, '0')}`,
    underlyingSymbol: 'SPY',
    type: 'call',
    strike,
    expiration: '2026-10-05',
    bid: 1.84,
    ask: 1.85,
    last: 2.05,
    mark: 1.845,
    iv: 0.2,
    delta: 0.5,
    gamma: 0.01,
    theta: -0.02,
    vega: 0.03,
    timestamp: new Date().toISOString(),
  }));
  const query = { data: { contracts }, isError: false };
  let selectedContract = null;
  const onSelectContract = contract => { selectedContract = contract; };
  const renderChain = () => OptionsChain({
    query,
    spot: 770,
    selectedContract,
    onSelectContract,
    advanced: false,
  });

  const firstRow = findContractRow(renderChain(), contracts[0].symbol);
  assert.ok(firstRow, 'the $770 contract is rendered as an interactive row');
  firstRow.props.onClick();
  assert.strictEqual(selectedContract, contracts[0], 'the parent receives the exact selected chain object');
  assert.equal(findContractRow(renderChain(), contracts[0].symbol).props['aria-pressed'], true);

  const premium = getOptionMark(selectedContract);
  const estimatedDebit = calculateContractCost(premium, 1);
  assert.ok(Math.abs(estimatedDebit - 184.5) < 0.0001);
  assert.equal(canBuyOptionsOrder({
    selectedContract,
    contract: selectedContract,
    premium,
    quantity: 1,
    buyingPower: 10000,
    hasSession: true,
    accountLoaded: true,
    marketAvailable: true,
    pending: false,
  }), true);

  findContractRow(renderChain(), contracts[1].symbol).props.onClick();
  assert.strictEqual(selectedContract, contracts[1], 'clicking $771 replaces the previous $770 selection');
});
