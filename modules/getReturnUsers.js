/**
 * returns a list of  return users from the date givin
 * 
 * @param {Number} date - the date of this month to get user list for
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
