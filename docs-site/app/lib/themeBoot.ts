// Kept out of ThemeToggle.tsx: that is a client module, and a plain string
// exported from one reaches a server component as a client reference, not text.

export const THEME_STORAGE_KEY = 'opteryx-docs-theme'

// Runs inline in <head>, before first paint, so a dark-mode reader never sees a
// white flash. It resolves "auto" to a concrete theme on <html data-theme>, so
// the stylesheet only has one selector to key dark tokens on, and follows the
// OS setting live while the preference is "auto".
export const themeBootScript = `(function(){
  var k='${THEME_STORAGE_KEY}', m=window.matchMedia('(prefers-color-scheme: dark)');
  function pref(){ try { return localStorage.getItem(k) || 'auto' } catch (e) { return 'auto' } }
  function apply(){ var p=pref(); document.documentElement.dataset.theme = p==='auto' ? (m.matches?'dark':'light') : p; }
  apply();
  m.addEventListener('change', apply);
})();`
