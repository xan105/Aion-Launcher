const fs = require('fs');
const path = require('path');
const util = require('util');
const download = require(path.resolve("./package/util/download.js"));

const fileUrl = "https://github.com/xan105/Aion-Japanese-Voice-Pack/raw/master/font/JP%20Hit%20Font/dist/hit_number.pak";

module.exports =  {
      isInstalled : (root,l10n)=>{
        return fileExists(join(root,l10n));
      },
      install : (root,l10n)=>{
          return download(fileUrl,path.parse(join(root,l10n)).dir); 
      },
      remove : (root,l10n)=>{
          return util.promisify(fs.unlink)(join(root,l10n));
      }
}

function join(root,l10n) {
   return path.join(`${root}`,`l10n/${l10n.toUpperCase()}/textures/ui/hit_number.pak`);
}

async function fileExists(path) {
  try {
    await util.promisify(fs.stat)(path);
    return true
  }
  catch(e) {
    return false
  }

}