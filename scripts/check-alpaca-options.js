import { loadEnv } from 'vite';
import { createOptionsHandler } from '../api/options-chain.js';

const date = new Date();
date.setUTCDate(date.getUTCDate() + ((5 - date.getUTCDay() + 7) % 7 || 7));
const handler = createOptionsHandler({ ...loadEnv('development', process.cwd(), 'ALPACA_'), ...process.env });
await handler({ method: 'GET', url: `/api/options-chain?symbol=AAPL&expiration=${date.toISOString().slice(0, 10)}` }, {
  code: 200,
  setHeader() {},
  status(code) { this.code = code; return this; },
  json(data) {
    console.log(JSON.stringify({ status: this.code, error: data.error, feed: data.feed, contracts: data.contracts?.length, sample: data.contracts?.[0] }, null, 2));
    if (this.code !== 200) process.exitCode = 1;
  },
});
