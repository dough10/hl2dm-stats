import {qs} from './helpers.js';

function loadCSSFile(src) {
  return new Promise((resolve, reject) => {
    const css = document.createElement( "link" );
    css.href = src;
    css.type = "text/css";
    css.rel = "stylesheet";
    css.onload = resolve;
    css.onerror = reject;
    qs('head').appendChild(css);
  });
}

function loadJSFile(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = src;
    script.onload = setTimeout(resolve, 50);
    script.onerror = reject;
    qs('body').appendChild(script);
  });
}

export {loadCSSFile, loadJSFile};
