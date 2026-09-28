// Only active inside the native app's private portal session. Keep the existing
// website storage behavior and mirror account-scoped lesson notes to the app.
if (window.ReactNativeWebView && sessionStorage.getItem('to-mobile') === '1') {
  const email = (localStorage.getItem('user') || '').trim().toLowerCase();
  const keys = new Set([`cp_progress_${email}`, `stock_options_progress_${email}`]);
  const originalSet = Storage.prototype.setItem;
  const originalRemove = Storage.prototype.removeItem;
  const send = (key, value) => {
    if (keys.has(key)) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'to-mobile-progress', key, value }));
  };
  Storage.prototype.setItem = function (key, value) {
    originalSet.call(this, key, value);
    if (this === window.localStorage) send(String(key), String(value));
  };
  Storage.prototype.removeItem = function (key) {
    originalRemove.call(this, key);
    if (this === window.localStorage) send(String(key), null);
  };
}
