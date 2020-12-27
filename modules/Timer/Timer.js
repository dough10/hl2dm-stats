/**
 * @module modules/Timer
 * @requires colors
 */

 /** colorize text */
const colors = require('colors'); 


/**
 * Class for timing the duration of things
 */
class Timer {
  /**
   * @class
   * @param {String} title - name of the timer *optional
   * @constructor
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
   */
  endString() {
    var endTime = this.end();
    return `${endTime[0]} hours ${endTime[1]} minutes ${endTime[2]} seconds`.cyan;
  }
}

module.exports = Timer;
