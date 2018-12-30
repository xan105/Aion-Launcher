const fs = require('fs');
const path = require('path');
const util = require('util'); 
const process = require('child_process');

module.exports = ()=> {
  return self.isElevated();
}
module.exports.Sync = ()=> {
  return self.isElevatedSync();
}

const command = `powershell "(whoami /all | select-string S-1-16-12288) -ne $null"`;
const options = {windowsHide: true};

var self = {
  cache : null,
  isElevatedSync : () => {
    if (self.cache === null) {
        try {
          let result = (process.execSync(command,options).includes("True")) ? true : false;
          self.cache = result;
          return result;
        }catch(e) {
          return false
        }
    } else {
      return self.cache;
    }
  },
  isElevated : async() => {
    if (self.cache === null) {
        try {
          let exec = await util.promisify(process.exec)(command,options);
          let result = (exec.stdout.includes("True")) ? true : false;
          self.cache = result;
          return result;
        }catch(e) {
          return false
        }    
    } else {
      return self.cache;
    }
  }
}