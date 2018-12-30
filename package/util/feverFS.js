const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mkdirp = require(path.resolve("./package/node_modules/mkdirp"));
const rimraf = require(path.resolve("./package/node_modules/rimraf"));

const ffs = {
  sync : {},
  promises : {}
};

ffs.promises.mkdir = function (path, options={}) {
  return new Promise((resolve,reject) => {
      mkdirp(path, options, function (err) { 
            if (err) {
              return reject(err);
            } else {
              return resolve();
            }
      });
  });
}

ffs.sync.mkdir = function (path, options={}) {
  return mkdirp.sync(path, options);
}

ffs.promises.rmdir = function (path, options={}) {
  return new Promise((resolve,reject) => {
      rimraf(path, options, function (err) { 
            if (err) {
              return reject(err);
            } else {
              return resolve();
            }
      });
  });
}

ffs.sync.rmdir = function (path, options={}) {
  return rimraf.sync(path, options);
}

ffs.promises.hashFile = function(file, algorithm="sha1"){

  let sum = crypto.createHash(algorithm);
  let stream = fs.createReadStream(file);
  
  return new Promise((resolve, reject) => {
      stream
        .on('error', (error) => {
          return reject(error);
        })
        .on('data', (chunk) => {
          try 
          {
              sum.update(chunk);
          } catch (error) {
              return reject(error);
          }
        })
        .on('end', () => {
          return resolve(sum.digest('hex'));
        });
  });
  
}

ffs.sync.hashFile = function(file, algorithm="sha1"){
  let sum = crypto.createHash(algorithm);
  sum.update(fs.readFileSync(file));
  return sum.digest('hex');
}

ffs.promises.exists = function (path, isDir=false) {
   return new Promise((resolve) => {
      fs.stat(path, function(err,stats) {
          if (err) {
            return resolve(false);
          } else {
            let result = (isDir) ? stats.isDirectory() : stats.isFile();
            return resolve(result);
          }
      });
   });
}

ffs.sync.exists = function (path, isDir=false) {
  try {
    let stats = fs.statSync(path);
    let result = (isDir) ? stats.isDirectory() : stats.isFile();
    return result;
  }catch(err) {
    return false;
  }
}

ffs.promises.mv = function (oldPath, newPath) {
  return new Promise((resolve, reject) => {
     mkdirp(path.parse(newPath).dir, function (err) { 
            if (err) {
              return reject(err);
            } else { 
              fs.rename(oldPath, newPath, function(err){
                    if (err) {
                        fs.copyFile(oldPath, newPath, function(err) {
                            if (err) {
                              return reject(err);
                            } else {
                                fs.unlink(oldPath, function(err) {
                                  return resolve(newPath);
                                });
                            }
                        });  
                    } else {
                      return resolve(newPath);
                    }
              });
         }
     });
  })
}

ffs.sync.mv = function (oldPath, newPath) {
  mkdirp.sync(newPath);
  try {
    fs.renameSync(oldPath, newPath);
    return newPath;
  } catch(e) {
    fs.copyFileSync(oldPath, newPath);
    try {
      fs.unlinkSync(oldPath);
    }catch(e){}
    return newPath;
  }
}

ffs.promises.writeFile = function(file, data, options) {
  return new Promise((resolve,reject) => {
      mkdirp(path.parse(file).dir, function (err) { 
          if (err) {
            return reject(err);
          } else {
              fs.writeFile(file, data, options, function (err) {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(file);
                  }
              });    
         }
      });  
  });      
}

ffs.sync.writeFile = function(file, data, options) {
    mkdirp.sync(path.parse(file).dir);
    fs.writeFileSync(file, data, options);
    return file;
}

ffs.promises.copyFile = function(src, dest, flags) {
  return new Promise((resolve,reject) => {
      mkdirp(path.parse(dest).dir, function (err) { 
          if (err) {
            return reject(err);
          } else {
              fs.copyFile(src, dest, flags, function (err) {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve(file);
                  }
              })    
         }
      })  
  })      
}

ffs.sync.copyFile = function(src, dest, flags) {
    mkdirp.sync(path.parse(dest).dir);
    fs.copyFileSync(src, dest, flags);
    return file;
}

ffs.promises.readFile = function(file, options) {
  return new Promise((resolve,reject) => {
     fs.readFile(file, options, function (err,data) {
           if (err) {
               return reject(err);
           } else {
              return resolve(data);
          }
     });    
  });      
}

ffs.sync.readFile = fs.readFileSync;

ffs.promises.unlink = ffs.promises.rm = function(file) {
  return new Promise((resolve) => {
     fs.unlink(file, function (err) { return resolve() });    
  });      
}

ffs.sync.unlink = ffs.sync.rm = function(file) {
   try {
    fs.unlinkSync(file);
   }catch(e){}          
}

module.exports = ffs;