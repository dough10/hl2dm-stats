/**
 * @module modules/logUser
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports logUser
 */

/**
 * checks mongodb instance to see if entry exists  
 * @param {Object} db mongodb instance object
 * @param {Object} data data object to be saved to the database
 * 
 * @returns {Promise<Object>}
 * 
 * @example <caption>Example usage of entryExists() function.</caption>
 * entryExists(db, data).then(exists => {
 *   console.log(exists);
 * });
 */
function entryExists(db, data) {
  return new Promise((resolve, reject) => {
    try {
      db.collection("players").findOne({
        time: data.time
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
 * inserts object into mongodb instance
 * @param {Object} db mongodb instance object
 * @param {Object} data data object to be saved to the database
 * 
 * @returns {Promise<Object>} the saved entry
 * 
 * @example <caption>Example usage of insertPlayer() function.</caption>
 * insertPlayer(db, data);
 */
function insertPlayer(db, data) {
  return new Promise((resolve, reject) => {
    try {
      db.collection("players").insertOne(data, err => {
        if (err) {
          reject(err);
          return;
        } 
        db.collection("players").findOne({
          time: data.time
        }, (err, res) => {
          if (err) {
            reject(err);
            return;
          } 
          resolve(res);
        });
      }); 
    } catch(e) {
      reject(e);
    }
  });
}

/**
 * checks database to see if entry exists and if ti doesn't it will save the data
 * @param {Object} db mongodb instance object
 * @param {Object} data data object to be saved to the database
 * 
 * @returns {Promise<Void>}
 * 
 * @example <caption>Example usage of logUser() function.</caption>
 * logUser(db, data).then(_ => {
 *   
 * });
 */
function logUser(db, data) {
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

module.exports = logUser;