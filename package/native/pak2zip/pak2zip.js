const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const mkdirp = require(path.resolve("./package/node_modules/mkdirp"));

module.exports = (pak,zip) => {

  const errorMessage = ["Error:","Unknow ","Bad signature:"];

  return new Promise((resolve, reject) => {
  
    if (!pak || pak === "" || !zip || zip === "") { return reject("Unvalid parameter(s)") }
    
    pak = path.resolve(pak);
    zip = path.resolve(zip);
    
    mkdirp(path.parse(zip).dir, (err) => {
    
        if (err) { return reject(err); }
    
        let cmdline = [`${pak.replace(/\\\\/g,"\\")}`,`${zip.replace(/\\\\/g,"\\")}`];

        let decrypt = spawn(path.resolve(__dirname, "dist/pak2zip.exe "), cmdline , {stdio: ['pipe', 'pipe', 'pipe']});

          decrypt.stdout.on('data', (data) => {
          
            if (errorMessage.some(error => data.includes(error))){ 
              fs.unlink(zip, (err)=>{ return reject(`${data}`) });
            }
            
          });
         
          decrypt.stderr.on('data', (data) => {
          
            return reject(`${data}`);
          
          });     

          decrypt.on('exit', (code) => {
     
                if (code == 0)
                { 
                   return resolve(zip);      
                }
                else
                {
                   return reject(`Process failed with code ${code}`);
                }
            });
        
    });
    
  });
  
}