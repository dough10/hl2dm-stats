export {Toast};

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
 * display a toast message
 *
 * @param {String} message
 * @param {Number} timeout in seconds  || defualt 5 seconds  ** optional
 */
class Toast {
  constructor(message, _timeout) {
    // bind this to internal functions
    this._transitionEnd = this._transitionEnd.bind(this);
    this._cleanUp = this._cleanUp.bind(this);
    // create the toast
    this._checkPrevious().then(_ => {
      this._timer = false;
      this._timeout = _timeout * 1000 || 4500;
      this.toast = this._createToast();
      this.toast.addEventListener(transitionEvent, this._transitionEnd, true);
      this.toast.addEventListener('click', this._cleanUp, true);
      this.toast.textContent = message;
      document.querySelector('body').appendChild(this.toast);
      ripples.attachButtonRipple(this.toast);
      setTimeout(_ => requestAnimationFrame(_ => {
        this.toast.style.opacity = 1;
        this.toast.style.transform = 'translateY(0px)';
      }), 50);
    });
  }

  /**
   * check if there is a existing toast
   */
  _checkPrevious() {
    return new Promise(resolve => {
      let previous = document.querySelector('#toast');
      if (!previous) {
        resolve();
        return;
      }
      previous.addEventListener(transitionEvent, _ => {
        if (previous.parentNode) {
          previous.parentNode.removeChild(previous);
        }
        resolve();
      });
      requestAnimationFrame(_ => {
        previous.style.opacity = 0;
        previous.style.transform = 'translateY(80px)';
      });
    });
  }

  /**
   * returns a new toast html element
   */
  _createToast() {
    const toast = document.createElement('div');
    toast.id ='toast';
    toast.classList.add('toast');
    toast.style.opacity = 0;
    toast.style.transform = 'translateY(80px)';
    toast.style.willChange = 'transform opacity';
    toast.style.transition = 'all 300ms cubic-bezier(.33,.17,.85,1.1) 0ms';
    return toast;
  }

  /**
   * play closing animation and remove element from document
   */
  _cleanUp() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = false;
    }
    this.toast.addEventListener(transitionEvent, _ => {
      if (this.toast.parentNode) {
        this.toast.parentNode.removeChild(this.toast);
      }
    });
    requestAnimationFrame(_ => {
      this.toast.style.opacity = 0;
      this.toast.style.transform = 'translateY(80px)';
    });
  }

  /**
   * called after opening animation
   * sets up closing animation
   */
  _transitionEnd() {
    this._timer = setTimeout(this._cleanUp, this._timeout);
    this.toast.removeEventListener(transitionEvent, this._transitionEnd);
  }
}
