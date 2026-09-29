# Trading simulator

Route: `/trading-simulator`. Switch between Stock trading and Options trading.

## Existing integrations

- Stock quotes: Supabase Edge Function `stock-quote`.
- Stock execution: Supabase Edge Function `paper-trade` with `assetType: "stock"`.
- Stock persistence: `paper_accounts`, `paper_positions`, `paper_orders`.
- The stock backend uses Alpaca, as confirmed by the project owner. Its deployed Supabase function source is not in this repository. Other dashboards still use Massive / Polygon; this options workspace now uses Alpaca exclusively.

## Options workspace

Market data is the default. Opening Options trading or changing the underlying/expiration requests `/api/options-chain`. Refresh is also available manually. Errors leave the chain empty and trading unavailable; the app never silently substitutes fictional prices.

Demo mode remains an explicit optional choice and works without market data. Its contracts and fixed premiums are illustrative, based on a fictional $200 underlying. The payoff slider changes a hypothetical expiration outcome; it does not change fill prices or portfolio marks.

The server requests Alpaca `/v1beta1/options/snapshots/{underlying}`, filtered by expiration and unadjusted root symbol. It fetches up to four pages of 1,000 snapshots and indicates truncated results. Responses are cached for 15 seconds. Premiums use a valid quote midpoint, otherwise the last trade. The ticket displays the source and price timestamp. Practice fills are estimates, not brokerage orders.

## Alpaca setup

Keep these credentials server-only (never prefix them with `VITE_`):

- `ALPACA_API_KEY`
- `ALPACA_API_SECRET`
- Optional `ALPACA_OPTIONS_FEED`: `auto` (default), `opra`, or `indicative`.

Local Vite dev/preview loads the existing credentials from `.env.local`. Restart Vite after changing environment values. Vercel runs `api/options-chain.js`; configure the same variables in the Vercel project's server environment before deploying. A static-only host cannot run this endpoint.

`auto` tries OPRA and falls back to indicative only after a 403. The indicative feed has modified quotes and delayed trades and is explicitly labeled. The existing stock `ALPACA_DATA_FEED` (such as IEX) is not used for options. Authentication, entitlement, throttling, empty-chain and timeout failures are shown to the user. API credentials and upstream error bodies are never returned to the browser.

Reference: https://docs.alpaca.markets/us/reference/optionchain

Options execution is local educational simulation, not the stock Edge Function. Each mode has a separate $10,000 browser-local wallet. These wallets are not user-account synced and are shared by people using the same browser profile. No automatic exercise, settlement, adjusted contracts, short options, commissions, or spread execution is implemented. Expired positions remain labeled for review. Open values use loaded premiums, falling back to entry cost when unavailable. Realized P/L summarizes the retained 100 trades.

Run checks:

```sh
node --test scripts/options-simulator.test.js
node --test scripts/alpaca-options.test.js
node scripts/check-alpaca-options.js
node node_modules/eslint/bin/eslint.js src/components/OptionsLab.jsx src/lib/optionsSimulator.js
npm run build
```
