#! /usr/bin/env node
const fs = require('fs'); 
const readline = require('readline');

function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

async function processIPs() {
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

module.exports = async ip => {
  return processIPs().then(list => {
    if (!validateIPaddress(ip)) {
      console.log(ip);
      return false;
    }
    return list.includes(ip);
  });
};
