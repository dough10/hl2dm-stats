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
    if (!db) reject();
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
 * get player data from login database if some info is not present
 * @param {Object} db 
 * @param {Object} data 
 * 
 * @return {Promise<Object>} player info
 */
function getDetails(db, data) {
  return new Promise((resolve, reject) => {
    try {
      if (!db) reject();
      db.collection("players").findOne({
        id: data.id
      }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } catch(e) {
      reject(e);
    }
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
    if (!db) reject();
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
 * 
 * @param {Object} db mongodb databsse object
 * @param {Object} data data to be saved
 */
function makeEntry(db, data) {
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

/**
 * adds the banned use to the databse
 * 
 * @param {Object} db mongodb databsse object
 * @param {Object} data data to be saved
 */
function logBan(db, data) {
  return new Promise((resolve, reject) => {
    if (!data.name) {
      getDetails(db, data).then(u => {
        if (!u) {
          makeEntry(db, data).then(resolve).catch(reject);
          return;
        }
        delete u.time;
        delete u.date;
        delete u.month;
        delete u.year;
        delete u.new;
        delete u._id;
        makeEntry(db, u).then(resolve).catch(reject);
      });
      return;
    }
    makeEntry(db, data).then(resolve).catch(reject);
  });
}

module.exports = logBan;