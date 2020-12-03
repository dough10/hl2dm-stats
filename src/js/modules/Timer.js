
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
      var hours = parseInt(seconds / 3600);
      seconds = seconds % 3600;
      var minutes = parseInt(seconds / 60);
      seconds = seconds % 60;
      return [
        hours,
        minutes,
        seconds
      ];
    }
    endString() {
      var arr = this.end();
      return `${arr[0]} hours ${arr[1]} minutes ${arr[2]} seconds`;
    }
  }
}

export {Timer};