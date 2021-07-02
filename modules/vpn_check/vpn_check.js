#! /usr/bin/env node
const fs = require('fs'); 
const readline = require('readline');
const child_process = require("child_process");
var args = process.argv.slice(2);

function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function downloadIPs() {
  return new Promise(resolve => {
    try {
      child_process.execSync(`wget https://raw.githubusercontent.com/ejrv/VPNs/master/vpn-ipv4.txt`, {
        cwd: __dirname
      });
      resolve();
    } catch(e) {
      resolve();
      // throw e.message;
    }
  });
}

function processIPs() {
  return new Promise(resolve => {
    const addresses = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(`${__dirname}/ip.txt`),
      crlfDelay: Infinity
    });
  
    rl.on('line', address =>{
      addresses.push(address);
    });
    rl.on('close', _ => resolve(addresses));
  });
}

if (args.length === 0) {
  console.log('@ least one argument is required');
  return;
}
downloadIPs().then(processIPs).then(list => {
  obj = {};
  args.forEach(arg => {
    if (!validateIPaddress(arg)) {
      return;
    }
    obj[arg] = list.includes(arg);
  });
  console.log(JSON.stringify(obj));
});
