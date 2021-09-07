/**
 * @fileOverview print strings to console with time stamp
 * @module modules/printer
 * @exports print
 * 
 * @param {String} message text to be printed
 * 
 * @returns {Void} nothing
 * 
 * @example <caption>Example usage of print() function.</caption>
 * print('awesome site is online.'); = '12/30/2020, 8:52:16 PM - awesome site is online.'
 */
function print(message) {
  var now = new Date().toLocaleString();
  console.log(`${now.yellow} - ${message}`);
}

module.exports = print;
