
function entryExists(db, data) {
  return new Promise((resolve, reject) => {
    db.collection("players").findOne({
      time: data.time
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

function insertPlayer(db, data) {
  return new Promise((resolve, reject) => {
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
  });
}


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