const fs = require('fs');
const path = require('path');
const util = require('util'); 
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const rimraf = require(path.resolve("./package/node_modules/rimraf"));

module.exports = (filePath, dstDir=null) => {

  return new Promise((resolve, reject) => {
    
    if (!dstDir) { dstDir = path.parse(filePath).dir; }
    
    var cmdline = ['e', path.resolve(filePath),'-tlzma','-aoa',`-o${path.resolve(dstDir)}`];

    fs.stat(path.resolve(filePath),async function(err,stat){
      if (err != null) {
        await util.promisify(exec)(`copy /B "${path.resolve(filePath.replace(".zip",".z*"))}" "${path.resolve(filePath)}"`,{windowsHide: true}).catch(()=>{});
      }

      let unzip = spawn(path.resolve(__dirname, "7za.exe"), cmdline , {stdio: ['pipe', 'pipe', 'pipe']});
      
      /*unzip.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
      });*/

      unzip.on('exit', (code) => {
 
            if (code == 0)
            { 
                resolve(path.join(dstDir,path.parse(filePath).name));      
            }
            else
            {
               let ext = path.parse(filePath).ext;
                
               util.promisify(rimraf)(filePath.replace(ext,"")+".*")
                .catch(()=>{})
                .finally(()=>{ 
                  reject(`Extraction failed with code ${code}`) 
                }) 
            }
        });
    
    
    });

  });
}