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
  zipLogs(lastMonth).then(zipDemos).then(saveTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running log file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(file => {
        console.log(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, filess) => {
        console.log(`${new Date()} - Running demo file clean up`);
        var howMany = filess.length - 16;
        numFiles = numFiles + filess.length;
        filess.forEach(file => {
          if (path.extname(file) === '.dem') {
            console.log(path.join(config.gameServerDir, file));
            howMany--;
            if (howMany <= 0) {
              console.log(`${new Date()} - Clean up complete. ${numFiles} files processed and backed up`);
              // parseLogs();
            }
          }
        });
      });
    });
  }).catch(e => {
    console.log(e.message);
  });
}

function saveTop(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${__dirname}/old-top`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var filename = `${__dirname}/old-top/${lastMonth}.json`;
    fs.writeFile(filename, JSON.stringify(top), e => {
      if (e) {
        reject();
      }
      if (!fs.existsSync(filename)){
        reject();
      }
      console.log(`${new Date()} - top player data saved as ${__dirname}/old-top/${lastMonth}.json`);
      resolve();
    });
  });
}

function zipLogs(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = './old-logs';
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    child_process.execSync(`zip -r ${__dirname}/old-logs/${lastMonth}.zip *`, {
      cwd: '/appdata/hl2dm/hl2mp/logs'
    });
    console.log(`${new Date()} - Logs saved to ${__dirname}/old-logs/${lastMonth}.zip`);
    resolve(lastMonth);
  });
}

function zipDemos(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = './old-demos';
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    child_process.execSync(`zip -r ${__dirname}/old-demos/${lastMonth}.zip * '*.dem'`, {
      cwd: '/appdata/hl2dm/hl2mp'
    });
    console.log(`${new Date()} - Demos saved to ${__dirname}/old-demos/${lastMonth}.zip`);
    resolve(lastMonth);
  })
}

cleanUp();
