/**
 * @module modules/logBan
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports logBan
 */


/**
 * checks database for a user with that id already in database
 * @param {Object} db mongodb database object
 * @param {Object} data data to be saved
 * 
 * @returns {Promise<Boolean>} true user exists, false = user not in database
 * 
 * @example <caption>Example usage of entryExists() function.</caption>
 * entryExists({mongo}, data).then(exist => {
 * // console.log(exist) = true
 * });
 */
function entryExists(db, data) {
  return new Promise((resolve, reject) => {
    db.collection("banned").findOne({
      id: data.id
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * inserts data to the database
 * 
 * @param {Object} db  mongodb database object
 * @param {Object} data data to be saved
 * 
 * @returns {Promise<Object>} mongdb response object
 * 
 * @example <caption>Example usage of insertPlayer() function.</caption>
 * insertPlayer({mongo}, data).then(res => {
 * // res = data + mongodb object ID
 * });
 */
function insertPlayer(db, data) {
  return new Promise((resolve, reject) => {
    db.collection("banned").insertOne(data, err => {
      if (err) {
        reject(err);
        return;
      } 
      db.collection("banned").findOne({
        id: data.id
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        } 
        resolve(res);
      });
    });
  });
}

/**
 * adds the banned use to the databse
 * 
 * @param {Object} db mongodb databsse object
 * @param {Object} data data to be saved
 */
function logBan(db, data) {
  return new Promise((resolve, reject) => {
    entryExists(db, data).then(exists => {
      if (!exists) {
        insertPlayer(db, data).then(resolve).catch(reject);
        return;
      }
      resolve();
    }).catch(reject);
  });
}

module.exports = logBan;