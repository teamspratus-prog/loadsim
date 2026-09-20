/* Shared site behaviour for the marketing pages.
   Reuses the simulator's own theme key so the setting carries across pages.
   Loaded in <head> without defer so the theme is applied before first paint. */
(function(){
  "use strict";
  var KEY = "containerTheme";

  function get(key){ try { return localStorage.getItem(key); } catch(e) { return null; } }
  function set(key,value){ try { localStorage.setItem(key,value); } catch(e) {} }
  function systemPrefersDark(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function apply(theme){
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('siteTheme');
    var label = document.getElementById('siteThemeText');
    if(btn) btn.setAttribute('aria-label', theme==='dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if(label) label.textContent = theme==='dark' ? 'Light' : 'Dark';
  }

  apply(get(KEY) || (systemPrefersDark() ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function(){
    apply(document.documentElement.getAttribute('data-theme') || 'light');
    var btn = document.getElementById('siteTheme');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
      apply(next);
      set(KEY, next);
    });
  });
})();
