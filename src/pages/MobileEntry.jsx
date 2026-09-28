import { useEffect, useState } from 'react';

// Dedicated first-party entry page. The native app sends credentials only after
// checking this exact HTTPS origin and path; credentials never enter a URL.
export default function MobileEntry() {
  const [error, setError] = useState('');
  useEffect(() => {
    if (!window.ReactNativeWebView) return;
    let received = false;
    window.receiveMobileSession = ({ token, email, path, progress = {} } = {}) => {
      if (received) return;
      try {
        if (typeof token !== 'string' || !token || typeof email !== 'string' || !email.includes('@') ||
            typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) throw new Error('Invalid session');
        const destination = new URL(path, window.location.origin);
        if (destination.origin !== window.location.origin || destination.pathname === '/mobile-entry') throw new Error('Invalid destination');
        received = true;
        // Match the existing web login format. Enrollment checks remain in the portals.
        localStorage.setItem('ACCESS_TOKEN', token);
        localStorage.setItem('user', email);
        const normalized = email.trim().toLowerCase();
        for (const key of [`cp_progress_${normalized}`, `stock_options_progress_${normalized}`]) {
          const value = progress[key];
          if (typeof value === 'string' && value.length <= 2_000_000) {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) localStorage.setItem(key, value);
          }
        }
        sessionStorage.setItem('to-mobile', '1');
        window.location.replace(destination.pathname + destination.search + destination.hash);
      } catch { setError('Unable to connect your account. Close this page and try again.'); }
    };
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'to-mobile-ready' }));
    return () => { delete window.receiveMobileSession; };
  }, []);
  return <main style={{ padding: 28, fontFamily: 'sans-serif', textAlign: 'center' }}>
    <h1>T.O Analytics</h1><p>{error || 'Connecting your learning account…'}</p>
    {!window.ReactNativeWebView && <p>Open a learning tool from the T.O Analytics mobile app.</p>}
  </main>;
}
