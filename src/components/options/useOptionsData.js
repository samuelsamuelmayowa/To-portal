import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureVisitorSession } from '../../supabaseClient';
import { MARKET_DATA_API_BASE } from '../../services/marketDataConfig';
import { fetchMarketQuote, normalizeStockSearchResults } from '../../services/marketDataClient';
import { createOptionsClient } from '../../services/optionsClient';

export const optionsRequest = createOptionsClient({ getSession: async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
} });
export function useOptionsData(symbol, expiration, type, active) {
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState('');
  const client = useQueryClient();
  useEffect(() => {
    let mounted = true;
    ensureVisitorSession().then(value => { if (mounted) { setSession(value); setAuthError(''); } }).catch(e => { if (mounted) setAuthError(e.message); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, value) => { if (mounted) { setSession(value); if (value) setAuthError(''); } });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);
  const polling = { staleTime: 15000, refetchInterval: active ? 30000 : false, retry: 1, refetchIntervalInBackground: false };
  const quote = useQuery({ queryKey: ['options-quote', symbol], queryFn: ({ signal }) => fetchMarketQuote(symbol, { signal }), enabled: active, ...polling });
  const expirations = useQuery({ queryKey: ['options-expirations', symbol], queryFn: ({ signal }) => optionsRequest(`expirations?symbol=${encodeURIComponent(symbol)}`, { signal }), enabled: active, staleTime: 900000, retry: 1 });
  const chain = useQuery({ queryKey: ['options-chain', symbol, expiration, type], queryFn: ({ signal }) => optionsRequest(`chain?${new URLSearchParams({ symbol, expiration, type })}`, { signal }), enabled: active && Boolean(expiration), ...polling });
  const userId = session?.user?.id;
  const privateQuery = (name) => ({ queryKey: ['options-private', userId, name], queryFn: ({ signal }) => optionsRequest(name, { signal, authenticated: true }), enabled: active && Boolean(userId), ...polling });
  const account = useQuery(privateQuery('account'));
  const positions = useQuery(privateQuery('positions'));
  const history = useQuery({ ...privateQuery('history'), refetchInterval: false });
  const refreshAccount = () => client.invalidateQueries({ queryKey: ['options-private', userId] });
  const order = useMutation({ mutationFn: body => optionsRequest('orders', { body, authenticated: true }), onSuccess: refreshAccount, retry: false });
  const reset = useMutation({ mutationFn: () => optionsRequest('reset', { body: {}, authenticated: true }), onSuccess: refreshAccount, retry: false });
  return { quote, expirations, chain, account, positions, history, order, reset, authError, session, refresh: () => { quote.refetch(); expirations.refetch(); if (expiration) chain.refetch(); refreshAccount(); } };
}
export function useOptionsSearch(term, active) {
  const [debounced, setDebounced] = useState('');
  useEffect(() => { const timer = setTimeout(() => setDebounced(term.trim()), 300); return () => clearTimeout(timer); }, [term]);
  return useQuery({ queryKey: ['options-symbol-search', debounced], queryFn: async ({ signal }) => {
    const response = await fetch(`${MARKET_DATA_API_BASE}/market-data/search?q=${encodeURIComponent(debounced)}`, { signal });
    if (!response.ok) throw new Error('Symbol search unavailable. Please retry.');
    return normalizeStockSearchResults(await response.json());
  }, enabled: active && Boolean(debounced), staleTime: 300000, retry: 1 });
}
