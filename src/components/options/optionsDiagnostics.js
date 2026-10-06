export function logOptionsDiagnostic(event, detail) {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('optionsDebug') === '1') {
    console.info(event, detail);
  }
}
