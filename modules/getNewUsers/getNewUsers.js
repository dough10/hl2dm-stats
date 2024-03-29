/**
 * @fileOverview returns a list of  new users from the date givin
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports getNewUsers
 * 
 * @param {Object} mongodb database connection object
 * @param {Number} date - the date of this month to get user list for
 * 
 * @returns {Promise<Array>} list of new users on the give day
 * 
 * @example <caption>Example usage of getNewusers() Functions.</caption>
 * getNewUsers(mongodb, 13).then(list => {
 *  // console.log(list);  = new users on the 13th 
 * });
 */
function getNewUsers(db, date) {
  return new Promise((resolve, reject) => {
    var now = new Date();
    if (typeof date !== 'number') {
      date = Number(date);
    }
    if (date === 0) {
      date = undefined;
    }
    db.collection("players").distinct("name", {
      date: date || now.getDate(),
      year: now.getFullYear(),
      month: now.getMonth(),
      new: true
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

module.exports = getNewUsers;