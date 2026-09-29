import { normalizeAlpacaContract } from '../src/lib/optionsSimulator.js';

export function createOptionsHandler(env = process.env, fetcher = fetch) {
  const cache = new Map();
  return async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return response.status(405).json({ error: 'Method not allowed.' });
    }
    const params = new URL(request.url, 'http://localhost').searchParams;
    const symbol = (params.get('symbol') || '').toUpperCase();
    const expiration = params.get('expiration') || '';
    if (!['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'SPY'].includes(symbol) || !/^\d{4}-\d{2}-\d{2}$/.test(expiration) || Number.isNaN(Date.parse(expiration)) || new Date(expiration).toISOString().slice(0, 10) !== expiration) {
      return response.status(400).json({ error: 'Choose a supported stock and valid expiration date.' });
    }
    if (!env.ALPACA_API_KEY || !env.ALPACA_API_SECRET) return response.status(503).json({ error: 'Alpaca credentials are missing on the server. Configure ALPACA_API_KEY and ALPACA_API_SECRET.' });
    const requestedFeed = env.ALPACA_OPTIONS_FEED || 'auto';
    if (!['auto', 'opra', 'indicative'].includes(requestedFeed)) return response.status(503).json({ error: 'ALPACA_OPTIONS_FEED must be auto, opra, or indicative.' });
    const cacheKey = `${symbol}:${expiration}:${requestedFeed}`;
    const cached = cache.get(cacheKey);
    if (cached?.expires > Date.now()) return response.status(200).json(cached.data);
    try {
      let feed = requestedFeed === 'auto' ? 'opra' : requestedFeed;
      let pageToken;
      const rows = [];
      const signal = AbortSignal.timeout(12000);
      for (let page = 0; page < 4; page += 1) {
        const query = new URLSearchParams({ expiration_date: expiration, root_symbol: symbol, feed, limit: '1000' });
        if (pageToken) query.set('page_token', pageToken);
        const call = () => fetcher(`https://data.alpaca.markets/v1beta1/options/snapshots/${symbol}?${query}`, {
          headers: { 'APCA-API-KEY-ID': env.ALPACA_API_KEY, 'APCA-API-SECRET-KEY': env.ALPACA_API_SECRET }, signal,
        });
        let upstream = await call();
        if (upstream.status === 403 && requestedFeed === 'auto' && feed === 'opra' && page === 0) {
          feed = 'indicative'; query.set('feed', feed); upstream = await call();
        }
        if (!upstream.ok) {
          const status = upstream.status;
          return response.status(status === 429 ? 429 : 502).json({ error: status === 401 ? 'Alpaca rejected the server credentials. Check the API key and secret.' : status === 403 ? 'Your Alpaca account does not have access to the selected options feed.' : status === 429 ? 'Alpaca request limit reached. Wait a moment and refresh.' : 'Alpaca options data is temporarily unavailable. Please retry.' });
        }
        const body = await upstream.json();
        if (!body.snapshots || typeof body.snapshots !== 'object' || Array.isArray(body.snapshots)) throw new Error('Invalid snapshot response');
        rows.push(...Object.entries(body.snapshots).map(([ticker, snapshot]) => normalizeAlpacaContract(ticker, snapshot, symbol, feed)).filter((row) => row && row.expiration === expiration));
        pageToken = body.next_page_token;
        if (!pageToken) break;
      }
      const data = { contracts: [...new Map(rows.map((row) => [row.id, row])).values()], feed, fetchedAt: new Date().toISOString(), hasMore: Boolean(pageToken) };
      if (cache.size >= 32) cache.delete(cache.keys().next().value);
      cache.set(cacheKey, { data, expires: Date.now() + 15000 });
      return response.status(200).json(data);
    } catch {
      return response.status(502).json({ error: 'Could not load Alpaca options data. The request may have timed out; please retry.' });
    }
  };
}

export default createOptionsHandler();
