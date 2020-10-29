import * as ripples from './ripples.js';
export {animateElement, animateScroll, fadeIn, fadeOut, animateHeight};


function whichTransitionEvent() {
  let t;
  const el = document.createElement('fakeelement');
  const transitions = {
    'WebkitTransition' :'webkitTransitionEnd',
    'MozTransition'    :'transitionend',
    'MSTransition'     :'msTransitionEnd',
    'OTransition'      :'oTransitionEnd',
    'transition'       :'transitionEnd'
  };
  for (t in transitions) {
    if (el.style[t] !== undefined ) {
      return transitions[t];
    }
  }
}
// the browser transition event name
const transitionEvent = whichTransitionEvent();

/**
 * animate transform / opacity on a give element
 *
 * @param {HTMLElement} el *required*
 * @param {String} transform *required*
 * @param {Number} time
 * @param {Number} opacity
 * @param {Number} delay
 */
function animateElement(el, transform, time, opacity, delay) {
  return new Promise(resolve => {
    if (el.style.transform === transform) {
      resolve();
      return;
    }
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    if (!time) {
      time = 300;
    }
    if (!delay) {
      delay = 0;
    }
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'auto';
    el.style.transition = `all ${time}ms cubic-bezier(.33,.17,.85,1.1) ${delay}ms`;
    requestAnimationFrame(_ => {
      el.style.transform = transform;
      if (opacity !== undefined) {
        el.style.opacity = opacity;
      }
    });
  });
}

/**
 * fade in opacity of a given element
 *
 * @param {HTMLElement} el
 */
function fadeIn(el, time) {
  return new Promise(resolve => {
    if (el.style.opacity === 1) {
      resolve();
      return;
    }
    if (!time) {
      time = 200;
    }
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 1;
    });

  });
}

/**
 * fade out opacity of a given element
 *
 * @param {HTMLElement} el
 */
function fadeOut(el, time) {
  return new Promise(resolve => {
    if (el.style.opacity === 0) {
      resolve();
      return;
    }
    if (!time) {
      time = 200;
    }
    var animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 0;
    });
  });
}

/**
 * animate scroll to top of the page
 */
function animateScroll() {
  return new Promise(resolve => {
    const wrapper = document.querySelector('#container');
    const content = document.querySelector('#content');
    animateElement(content, `translateY(${wrapper.scrollTop}px)`, 350).then(_ => {
      content.style.transform = 'initial';
      wrapper.scrollTop = 0;
      resolve();
    });
  });
}

/**
 * animate transform / opacity on a give element
 *
 * @param {HTMLElement} el *required*
 * @param {String} height *required*
 * @param {Number} time
 */
function animateHeight(el, height, time) {
  return new Promise(resolve => {
    var timer = 0;
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    if (!time) {
      time = 300;
    }
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'auto';
    el.style.transition = `height ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.height = height;
    });
  });
}
