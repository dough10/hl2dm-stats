import * as ripples from './ripples.js';
import {transitionEvent} from './whichtransistion.js';
import {qs} from './helpers.js';
export {Toast};

const _toastCache = [];

setInterval(_ => {
  if (!_toastCache.length) {
    return;
  }
  if (qs('#toast')) {
    return;
  }
  new Toast(_toastCache[0][0], _toastCache[0][1]);
  _toastCache.splice(0,1);
}, 500);

/**
 * display a toast message
 *
 * @param {String} message
 * @param {Number} timeout in seconds  || defualt 5 seconds  ** optional
 */
class Toast {
  constructor(message, _timeout) {
    // push toast to cache if current toast exist
    if (qs('#toast')) {
      _toastCache.push([
        message,
        _timeout
      ]);
      return;
    }
    // bind this to internal functions
    this._transitionEnd = this._transitionEnd.bind(this);
    this._cleanUp = this._cleanUp.bind(this);
    // create the toast
    this._timer = false;
    this._timeout = _timeout * 1000 || 4500;
    this.toast = this._createToast();
    this.toast.addEventListener(transitionEvent, this._transitionEnd, true);
    this.toast.addEventListener('click', this._cleanUp, true);
    this.toast.textContent = message;
    qs('body').appendChild(this.toast);
    ripples.attachButtonRipple(this.toast);
    setTimeout(_ => requestAnimationFrame(_ => {
      this.toast.style.opacity = 1;
      this.toast.style.transform = 'translateY(0px)';
    }), 50);

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
    toast.style.willChange = 'auto';
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
