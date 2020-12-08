const colors = require('colors');                         // colorize text


/**
 * A class for timing duration of things
 */
class Timer {
  constructor() {
    this.startTime = new Date().getTime();
  }
  end() {
    var ms = new Date().getTime() - this.startTime;
    var seconds = ms / 1000;
    var hours = parseInt( seconds / 3600 );
    seconds = seconds % 3600;
    var minutes = parseInt( seconds / 60 );
    seconds = seconds % 60;
    return [
      hours,
      minutes,
      seconds
    ];
  }
  endString() {
    var endTime = this.end();
    return `${endTime[0]} hours ${endTime[1]} minutes ${endTime[2]} seconds`.cyan;
  }
}

module.exports = Timer;
