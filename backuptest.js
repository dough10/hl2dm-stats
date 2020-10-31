const path = require('path');
const fs = require('fs');
const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');
const child_process = require("child_process");
var top = {data: 'is here'};
const schedule = require('node-schedule');


function cleanUp() {
  console.count('cleanup count')
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var start = new Date().getTime();
  zipLogs(lastMonth).then(zipDemos).then(saveTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running log file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(file => {
        // fs.unlinkSync(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, filess) => {
        console.log(`${new Date()} - Running demo file clean up`);
        var howMany = filess.length - 16;
        numFiles = numFiles + filess.length;
        filess.forEach(file => {
          if (path.extname(file) === '.dem') {
            // fs.unlinkSync(path.join(config.gameServerDir, file));
            howMany--;
            if (howMany <= 0) {
              var end = new Date().getTime();
              var ms = end - start;
              var seconds = ms / 1000;
              var hours = parseInt( seconds / 3600 );
              seconds = seconds % 3600;
              var minutes = parseInt( seconds / 60 );
              seconds = seconds % 60;
              console.log(`${new Date()} - Clean up complete. ${numFiles} files processed and backed up.`);
              console.log(`${new Date()} - Backup process took ${hours} hours ${minutes} minutes  ${seconds.toFixed(2)} seconds to complete`)
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
    fs.writeFile(filename, JSON.stringify([
      top
      // weaponstats
      // total players
    ]), e => {
      if (e) {
        reject();
      }
      if (!fs.existsSync(filename)){
        reject();
      }
      console.log(`${new Date()} - top player data saved to ${__dirname}/old-top/${lastMonth}.json`);
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

var j = schedule.scheduleJob('20 19 30 * *', cleanUp);
