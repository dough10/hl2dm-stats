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
  var zip = new JSZip();
  var folder = `${__dirname}/oldTop`;
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  copyLogsFiles(lastMonth).then(saveOldTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running log file clean up`);
      numFiles = numFiles + files.length;
      var howMany = files.length;
      files.forEach(file => {
        console.log(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, files) => {
        console.log(`${new Date()} - Running demo file clean up`);
        files.forEach(file => {
          numFiles = numFiles + files.length;
          if (path.extname(file) === '.dem') {
            console.log(path.join(config.gameServerDir, file));
            howMany--;
            if (howMany <= 0) {
              console.log(`${new Date()} - Clean up complete. ${numFiles} files processed and backed up to ${__dirname}/oldLogs/${lastMonth}`);
              // parseLogs();
            }
          }
        });
      });
    });
  }).catch(_ => {
    console.log(`${new Date()} - Error saving ${__dirname}/oldTop/${lastMonth}.json`);
  });
}

function saveOldTop() {
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


function copyLogsFiles(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = './oldLogs';
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    if (!fs.existsSync(`${__dirname}/oldLogs/${lastMonth}`)){
      fs.mkdirSync(`${__dirname}/oldLogs/${lastMonth}`);
    }
    child_process.execSync(`zip -r ${__dirname}/oldLogs/${lastMonth}.zip ${lastMonth}*`, {
      cwd: '/appdata/hl2dm/hl2mp/logs'
    });
    resolve();
  });
}

cleanUp();
