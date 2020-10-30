const path = require('path');
const fs = require('fs');
const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');
const child_process = require("child_process");
var top = {data: 'is here'};


function cleanUp() {
  console.count('cleanup-function')
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var folder = `${__dirname}/oldTop`;
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  zipLogsFiles(lastMonth).then(saveOldTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running log file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(file => {
        // console.log(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, filess) => {
        console.log(`${new Date()} - Running demo file clean up`);
        var howMany = filess.length;
        numFiles = numFiles + filess.length;
        filess.forEach(file => {
          if (path.extname(file) === '.dem') {
            console.log(path.join(config.gameServerDir, file));
            howMany--;
            console.log(howMany)
            if (howMany <= 16) {
              // console.log(`${new Date()} - Clean up complete. ${numFiles} files processed and backed up to ${__dirname}/oldLogs/${lastMonth}`);
              // parseLogs();
            }
          }
        });
      });
    });
  }).catch(e => {
    console.log(`${new Date()} - Error saving ${__dirname}/oldTop/${lastMonth}.json`, e.message);
  });
}

function saveOldTop(lastMonth) {
  return new Promise((resolve, reject) => {
    var filename = `${__dirname}/oldTop/${lastMonth}.json`;
    fs.writeFile(filename, JSON.stringify(top), e => {
      if (e) {
        reject();
      }
      if (!fs.existsSync(filename)){
        reject();
      }
      console.log(`${new Date()} - top player data saved as ${__dirname}/oldTop/${lastMonth}.json`);
      resolve();
    });
  });
}


function zipLogsFiles(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = './oldLogs';
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    if (!fs.existsSync(`${__dirname}/oldLogs/${lastMonth}`)){
      fs.mkdirSync(`${__dirname}/oldLogs/${lastMonth}`);
    }
    child_process.execSync(`zip -r ${__dirname}/oldLogs/${lastMonth}.zip *`, {
      cwd: '/appdata/hl2dm/hl2mp/logs'
    });
    resolve(lastMonth);
  });
}

cleanUp();
