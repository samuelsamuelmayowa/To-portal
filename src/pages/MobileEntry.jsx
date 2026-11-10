import { useEffect, useState } from 'react';
import { cookieAuthApi } from "../lib/cookieAuth";
import { useStateContext } from "../context/ContextProvider";

// Dedicated first-party entry page. The native app sends credentials only after
// checking this exact HTTPS origin and path; credentials never enter a URL.
export default function MobileEntry() {
  const [error, setError] = useState('');
  const { setToken, setUser } = useStateContext();
  useEffect(() => {
    if (!window.ReactNativeWebView) return;
    let received = false;
    window.receiveMobileSession = async ({ token, email, path, progress = {} } = {}) => {
      if (received) return;
      try {
        if (typeof token !== 'string' || !token || typeof email !== 'string' || !email.includes('@') ||
            typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) throw new Error('Invalid session');
        const destination = new URL(path, window.location.origin);
        if (destination.origin !== window.location.origin || destination.pathname === '/mobile-entry') throw new Error('Invalid destination');
        received = true;
        const { data } = await cookieAuthApi.post("/api/session/exchange", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.authenticated !== true || !data.user || data.user.email?.toLowerCase() !== email.trim().toLowerCase()) throw new Error('Session exchange failed');
        const verifiedEmail = data.user.email;
        localStorage.setItem('user', verifiedEmail);
        setUser(data.user);
        setToken(true);
        const normalized = verifiedEmail.trim().toLowerCase();
        for (const key of [`cp_progress_${normalized}`, `stock_options_progress_${normalized}`]) {
          const value = progress[key];
          if (typeof value === 'string' && value.length <= 2_000_000) {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) localStorage.setItem(key, value);
          }
        }
        sessionStorage.setItem('to-mobile', '1');
        window.location.replace(destination.pathname + destination.search + destination.hash);
      } catch { received = false; setError('Unable to connect your account. Close this page and try again.'); }
    };
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'to-mobile-ready' }));
    return () => { delete window.receiveMobileSession; };
  }, [setToken, setUser]);
  return <main style={{ padding: 28, fontFamily: 'sans-serif', textAlign: 'center' }}>
    <h1>T.O Analytics</h1><p>{error || 'Connecting your learning account…'}</p>
    {!window.ReactNativeWebView && <p>Open a learning tool from the T.O Analytics mobile app.</p>}
  </main>;
}
