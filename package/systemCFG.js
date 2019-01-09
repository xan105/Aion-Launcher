const fs = require('fs');
const path = require('path');
const mkdirp = require(path.resolve("./package/node_modules/mkdirp"));

const specialChar = {
  newLineCReturn : "\x0D\x0A",
  newLine : "\x0A",
  comment : "\x2D\x2D" 
}

const charTable_maxRange = parseInt("FF",16);

const encoding = "latin1";

module.exports.read = function(file) {
 return new Promise((resolve,reject) => {
      fs.readFile(file,encoding, (err,data) => {
        if (err) { 
          return reject(err) 
        }
        else {
          return resolve(parse(data));
        }
      });
  });
}

module.exports.write = function(file,data) {
  return new Promise((resolve,reject) => {
    let result = parse(data,true);
    mkdirp(path.parse(file).dir, function (err) { 
          if (err) {
            return reject(err);
          } else {
              fs.writeFile(file, result, encoding, function (err) {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve();
                  }
              });    
         }
      });   
  });
}


function parse(data,textarea = false) {

   let lineDelimiter = (textarea) ? specialChar.newLine : specialChar.newLineCReturn;
   let returnLine = (textarea) ? specialChar.newLineCReturn : specialChar.newLine;
   
   let line = data.split(lineDelimiter);
   line.pop();
          
   for (i in line) {

       if (line[i].startsWith(specialChar.comment)) {
           line[i] = line[i]+returnLine;
       } else {
           line[i] = convert(line[i])+returnLine;
       }
   }
         
   return line.join("");

}

function convert(string) {

  let buf = Buffer.from(string,encoding);

  let hexa_string = [];
  
  for (charCode of buf) {
  
    let xor = charTable_maxRange ^ charCode;
    
    let hex = xor.toString(16);
    if (hex.length % 2) {
      hex = '0' + hex;
    }
      
    hexa_string.push(hex);

  
  }

  return Buffer.from(hexa_string.join(""),"hex").toString(encoding);
  
}


