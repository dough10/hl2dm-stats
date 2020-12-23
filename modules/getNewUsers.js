/**
 * returns a list of  new users from the date givin
 * 
 * @param {Number} date - the date of this month to get user list for
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
    db.collection("players").find({
      date: date || now.getDate(),
      year: now.getFullYear(),
      month: now.getMonth(),
      new: true
    }).toArray((err, res) => {
      if (err) {
        reject(err);
        return;
      }
      var arr = [];
      for (var i = 0; i < res.length; i++) {
        arr.push(res[i].name);
      }
      resolve(arr);
    });
  });
}

module.exports = getNewUsers;