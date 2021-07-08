/**
 * @fileOverview returns month name
 * @module modules/monthName
 * @exports monthName
 * 
 * @param {Number} month - month number 0 - 11
 * 
 * @returns {String} month name
 * 
 * @example <caption>Example usage of monthName() function.</caption>
 * monthName(2); = March
 */
function monthName(month) {
    if (typeof month !== 'number') {
      month = Number(month);
    }
    switch (month) {
      case 0:
        return 'January';
      case 1:
        return 'Febuary';
      case 2:
        return 'March';
      case 3:
        return 'April';
      case 4:
        return 'May';
      case 5:
        return 'June';
      case 6:
        return 'July';
      case 7:
        return 'August';
      case 8:
        return 'September';
      case 9:
        return 'October';
      case 10:
        return 'November';
      case 11:
        return 'December';
    }
  }

  module.exports = monthName;
  