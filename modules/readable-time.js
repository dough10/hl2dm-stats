module.exports = function timeString(ms) {
  if (isNaN(ms)) {
    return `?? hours ?? minutes ?? seconds`;
  }
  var seconds = ms / 1000;
  var hours = parseInt( seconds / 3600 );
  seconds = seconds % 3600;
  var minutes = parseInt( seconds / 60 );
  seconds = seconds % 60;
  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
}