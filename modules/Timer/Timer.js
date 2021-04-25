/**
 * @fileOverview Class for timing the duration of things
 * @module modules/Timer
 * @author Jimmy Doughten <https://github.com/dough10>
 */

class Timer {
  
  /**
   * @class
   * @param {String} title - name of the timer *optional*
   * @constructor
   * 
   * @returns {Void} nothing
   * 
   * @example <caption>Example usage of Timer Class.</caption>
   * let Timer = require('modules/Timer/Timer);
   * let t = new Timer('thing');
   */
  constructor(title) {
    if (title && typeof title !== 'string') {
      throw new Error('title must be a string');
    }
    this.title = title;
    this.startTime = new Date().getTime();
  }

  /**
   * ends the timer
   * @returns {Array} [0]hours, [1]mins, [2]seconds, [3]title/name
   * 
   * @example <caption>Example usage of end() function.</caption>
   * let Timer = require('modules/Timer/Timer);
   * let t = new Timer('thing');
   * // do stuff you want to see how long it will take
   * console.log(t.end());
   * // returns [0, 10, 15.347, 'thing']
   */
  end() {
    var ms = new Date().getTime() - this.startTime;
    // console.log(ms);
    var seconds = ms / 1000;
    var days = Math.floor(seconds / 86400);
    seconds = seconds % 86400;
    var hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return [
      days,
      hours,
      minutes,
      Number((seconds).toFixed(3)),
      this.title
    ];
  }
  
  /**
   * calls the end() method and formats into readable form
   * @returns {String} timer output
   * 
   * @example <caption>Example usage of endString() Function.</caption>
   * let Timer = require('modules/Timer/Timer);
   * let t = new Timer('thing');
   * // do stuff you want to see how long it will take
   * console.log(t.endString());
   * // returns 'thing - 0 hours 10 minutes 15.347 seconds'
   */
  endString() {
    let endTime = this.end();
    // console.log(endTime)
    let str = '';
    if (endTime[0]) {
      str += `${endTime[0]} days `;
    }
    if (endTime[1]) {
      str += `${endTime[1]} hours `;
    }
    if (endTime[2]) {
      str += `${endTime[2]} minutes `;
    }
    str += `${endTime[3]} seconds`;
    if (!this.title) {
      return str;
    }
    return `${this.title} - ${str}`;
  }
}

module.exports = Timer;
