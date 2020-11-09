import * as ripples from './ripples.js';
import {transitionEvent} from './whichtransistion.js';
import {qs} from './helpers.js';
export {Toast};

/**
 * Overflow Toasts.
 * when more thrn one toast happens in a short period of time overflow will be pushed here
 */
const _toastCache = [];

/**
 * checkes overflow for messages and displays them after the last has finished
 */
setInterval(_ => {
  if (!_toastCache.length) {
    return;
  }
  if (qs('#toast')) {
    return;
  }
  new Toast(
    _toastCache[0][0],
    _toastCache[0][1],
    _toastCache[0][2],
    _toastCache[0][3]
  );
  _toastCache.splice(0,1);
}, 500);

/**
 * display a toast message
 *
 * @param {String} message - text to be displayed in the toast
 * @param {Number} _timeout - in seconds  || defualt 5 seconds  ** optional
 * @param {String} link - url to go to when toast is clicked
 * @param {String} linkText - yellow text
 */
class Toast {
  constructor(message, _timeout, link, linkText) {
    // push toast to cache if current toast exist
    if (qs('#toast')) {
      _toastCache.push([
        message,
        _timeout,
        link,
        linkText
      ]);
      return;
    }
    // bind this to internal functions
    this._transitionEnd = this._transitionEnd.bind(this);
    this._cleanUp = this._cleanUp.bind(this);
    this._clicked = this._clicked.bind(this);
    // create the toast
    this._timer = false;
    this._timeout = _timeout * 1000 || 4500;
    this.link = link;
    this.linkText = linkText;
    this.toast = this._createToast();
    this.toast.addEventListener(transitionEvent, this._transitionEnd, true);
    this.toast.addEventListener('click', this._clicked, true);
    if (this.link && this.linkText) {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'space-between';
      wrapper.style.alignItems = 'center';
      wrapper.style.overflow = 'none';
      var mText = document.createElement('div');
      mText.textContent = message;
      var lText = document.createElement('div');
      lText.textContent = linkText;
      lText.classList.add('yellow-text');
      wrapper.appendChild(mText);
      wrapper.appendChild(lText);
      this.toast.appendChild(wrapper);
    } else {
      this.toast.textContent = message;
    }
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
   * event handler for toast click
   */
  _clicked() {
    if (this.link) {
      window.location.href = this.link;
    }
    this._cleanUp();
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
