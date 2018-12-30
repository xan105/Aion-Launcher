const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const mkdirp = require(path.resolve("./package/node_modules/mkdirp"));
const lock = new (require(path.resolve("./package/node_modules/rwlock")))();
const win32 = require(path.resolve("./package/util/win32.js"));

module.exports = Logger;

function Logger(option={}) {
    
    this.firstWrite = true;
    
    this.option = {
        toConsole: option.toConsole || false,
        toFile: option.toFile || true,
        fileroot: option.fileroot || path.join(win32.path.localappdata,"AION-LIVE/log"),
        filename: option.filename || "debug.log",
    };
    
}

Logger.prototype.log = function (event){

    if (this.option.toConsole) {
       try{

          if (event === Object(event)) {
            console.log(timeStamp());
            console.log(util.inspect(event, false, null)) 
          }
          else {
            console.log(timeStamp()+event);
          }
          
          
       }catch(e) { console.error(e); }
    }
   
    if (this.option.toFile) {
    
         let dir = path.resolve(this.option.fileroot);
         let logFile = path.join(dir,this.option.filename);
         
         let flag = (this.firstWrite) ? {'flag':'w'} : {'flag':'a'};
         this.firstWrite = false;
        
         lock.writeLock(function (release) {
             mkdirp(dir, function (err) {
                  if (err) {
                    console.error(err);
                    release();
                  }
                  else {

                      fs.writeFile(logFile, timeStamp() + event.toString() + os.EOL, flag, function(err){
                                  if (err) { 
                                    console.error(err);
                                  }
                                  release();
                      }); 
                  }
             });
         });     
    }
 
};

function timeStamp() {

  let date = new Date();
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let seconds = "0" + date.getSeconds();
  let formattedTime = `(${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()})` + ' ['+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + '] ';
  
  return formattedTime;

}