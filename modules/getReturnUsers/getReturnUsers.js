/**
 * @fileOverview returns a list of  new users from the date givin
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports getReturnUsers
 * 
 * @param {Object} mongodb database connection object
 * @param {Number} date - the date of this month to get user list for
 * 
 * @returns {Promise<Array>} list of returning users on the give day
 * 
 * @example <caption>Example usage of getReturnusers() Functions.</caption>
 * getReturnUsers(mongodb, 13).then(list => {
 *  // console.log(list);  = returning users on the 13th 
 * });
 */
function getReturnUsers(db, date) {
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
      new: false
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

module.exports = getReturnUsers;
