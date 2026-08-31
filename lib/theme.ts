const THEME_KEY = 'rahil-theme'

export const themeInitScript = `(function(){try{var stored=localStorage.getItem('${THEME_KEY}');var theme=stored==='dark'||stored==='light'?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`
