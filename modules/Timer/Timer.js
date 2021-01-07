/**
 * @fileOverview Class for timing the duration of things
 * @module modules/Timer
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires colors
 */
const colors = require('colors'); 

class Timer {
  
  /**
   * @class
   * @param {String} title - name of the timer *optional*
   * @constructor
   * 
   * @returns {Void} nothing
   * 
   * @example <caption>Example usage of Timer Class.</caption>
   * var Timer = require('modules/Timer/Timer);
   * var t = new Timer('thing');
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
   * var Timer = require('modules/Timer/Timer);
   * var t = new Timer('thing');
   * // do stuff you want to see how long it will take
   * console.log(t.end());
   * // returns [0, 10, 15.347, 'thing']
   */
  end() {
    var ms = new Date().getTime() - this.startTime;
    var seconds = ms / 1000;
    var hours = parseInt( seconds / 3600 );
    seconds = seconds % 3600;
    var minutes = parseInt( seconds / 60 );
    seconds = Number((seconds % 60).toFixed(3));
    return [
      hours,
      minutes,
      seconds,
      this.title
    ];
  }
  
  /**
   * calls the end() method and formats into readable form
   * @returns {String} timer output
   * 
   * @example <caption>Example usage of endString() Function.</caption>
   * var Timer = require('modules/Timer/Timer);
   * var t = new Timer('thing');
   * // do stuff you want to see how long it will take
   * console.log(t.endString());
   * // returns 'thing - 0 hours 10 minutes 15.347 seconds'
   */
  endString() {
    var endTime = this.end();
    if (!title) {
      return `${endTime[0]} hours ${endTime[1]} minutes ${endTime[2]} seconds`.cyan;
    }
    return `${title} - ${endTime[0]} hours ${endTime[1]} minutes ${endTime[2]} seconds`.cyan;
  }
}

module.exports = Timer;
