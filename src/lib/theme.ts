/**
 * Theme constants shared by the server layout (which inlines the no-FOUC
 * script) and the client ThemeProvider. Kept in a plain module — NOT a
 * "use client" file — so the string can be read on the server.
 */
export const THEME_STORAGE_KEY = "hejsot-theme";

/** Runs before paint to apply the saved theme and avoid a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;
