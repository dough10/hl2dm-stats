
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