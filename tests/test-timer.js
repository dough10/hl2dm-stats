const Timer = require('../modules/Timer.js');

var times = [
  1, 5, 10, 100, 200, 400, 800, 1600, 3200, 6400, 12800
];


function minutes(min) {
  return (min * 1000) * 60;
}
console.log('starting');
for(var i = 0; i < times.length; i++) {
  var t = new Timer();
  setTimeout(_ => {
    console.log(t.endString());
  }, minutes(times[i]));
}