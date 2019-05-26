const path = require('path');
const fs = require('fs');
const util = require('util');
const spawn = require('child_process').spawn;
const net = require('net');
const urlParser = require('url');
const request = require(path.resolve("./package/node_modules/axios"));
request.defaults.adapter = require(path.resolve("./package/node_modules/axios/lib/adapters/http"));
request.defaults.headers.common["User-Agent"] = "Chrome/";
const ini = require(path.resolve("./package/node_modules/ini"));
const glob = require(path.resolve("./package/node_modules/glob"));
const steamVDF = require(path.resolve("./package/node_modules/@node-steam/vdf"));
const ffs = require(path.resolve("./package/util/feverFS.js"));
const win32 = require(path.resolve("./package/util/win32.js"));
const download = require(path.resolve("./package/util/download.js"));
const unzip = require(path.resolve("./package/native/un7z/un7z.js"));
const mkdirp = require(path.resolve("./package/node_modules/mkdirp"));
const lock = new (require(path.resolve("./package/node_modules/rwlock")))();
const windows_file_attribute = require(path.resolve("./package/util/windows-file-attribute"));
const parseTorrent = require(path.resolve("./package/node_modules/parse-torrent"));
const regedit = require(path.resolve("./package/native/regedit/regedit.js"));
const pak2zip = require(path.resolve("./package/native/pak2zip/pak2zip.js"));
const zip = require(path.resolve("./package/node_modules/adm-zip"));
const systemCFG = require(path.resolve("./package/systemCFG.js"));

const folder = {
    download: path.join(win32.path.localappdata,"AION-LIVE/download"),
    tmp: path.join(win32.path.temp,"AION-LIVE"),
    defaultDir: path.join(win32.path.localappdata,"AION-LIVE")
}

const debug = new (require(path.resolve("./package/util/log.js")))({
  toConsole: true,
  toFile: true,
  filename: "aion.log"
});

const urls = {
  eu : {
    base : "http://dl.aion.gameforge.com/aion/AION-LIVE/",
    fileInfo : (version) => {
      return `${urls.eu.base}/${version}/Patch/FileInfoMap_AION-LIVE_${version}.dat.zip`;
    },
    torrent : (version) => {
      return `${urls.eu.base}/${version}/Patch/Full_AION-LIVE_${version}.torrent.zip`;
    }
  },
  jp : {
    base : "http://aionrepository.ncsoft.jp/AION_JP/",
    fileInfo : (version) => {
      return `${urls.jp.base}/${version}/Patch/FileInfoMap_AION_JP_${version}.dat.zip`;
    },
    torrent : (version) => {
      return `${urls.jp.base}/${version}/Patch/Full_AION_JP_${version}.torrent.zip`;
    }
  },
  na : {
    base : "http://aion.patcher.ncsoft.com/AION/",
    fileInfo : (version) => {
      return `${urls.na.base}/${version}/Patch/FileInfoMap_AION_${version}.dat.zip`;
    },
    torrent : (version) => {
      return `${urls.na.base}/${version}/Patch/Full_AION_${version}.torrent.zip`;
    }
  }  
};

module.exports = aion;

function aion(optionFile = path.join(folder.defaultDir,"options.ini")) { 
    
  debug.log("STARTING");
    
  const lang = ["eng","fra","deu","esn","ita","plk"];

  this.aionDir = getAionDirSync();
  this.optionFile = path.resolve(optionFile);
  
  this.installedLanguage = [];
  try {
    glob.sync("*/", { cwd: path.join(this.aionDir,"l10n") }).forEach((language)=>{
    
      language = language.replace("/","").toLowerCase();
      
      if (lang.some(l10n => language == l10n)) {
        this.installedLanguage.push(language);
      }
    });
  }catch(e) {
    debug.log(e);
  }

  try {
    this.options = ini.parse(fs.readFileSync(this.optionFile, 'utf8'));

    debug.log(`options from '${this.optionFile}' loaded!`);

    if (this.options.Aion.language) {
      this.options.Aion.language = this.options.Aion.language.toLowerCase(); 
    }
    
    if (!lang.some(l10n => this.options.Aion.language == l10n)) {
          this.options.Aion.language = (this.installedLanguage.length === 1) ? this.installedLanguage[0] : "eng";
    }
    
    if (typeof this.options.Aion.voicepack !== "boolean"){
      this.options.Aion.voicepack = false;
    }
    
    if (typeof this.options.Aion.run64 !== "boolean"){
      this.options.Aion.run64 = true;
    }
    
    if (typeof this.options.Aion.fastStartUp !== "boolean"){
      this.options.Aion.fastStartUp = true;
    }
    
    if (typeof this.options.Aion.ingame_shop !== "boolean"){
      this.options.Aion.ingame_shop = true;
    }
    
    if (typeof this.options.Aion.ads !== "boolean"){
      this.options.Aion.ads = false;
    }
    
    if (typeof this.options.Aion.forcewin7 !== "boolean"){
      this.options.Aion.forcewin7 = true;
    } 
    
    if (this.options.path) {
      if (this.options.path.download) {
        folder.download = this.options.path.download; 
      }
    }

  }catch(e) {
    debug.log("No options file using default values");
    this.options = {
      Aion: {
        language: (this.installedLanguage.length === 1) ? this.installedLanguage[0] : "eng",
        voicepack: false,
        run64: true,
        fastStartUp: true,
        ingame_shop: true,
        ads: false,
        forcewin7: true
      }
    };
  }
  finally {
    this.writeOptionsToFile.call(this).catch((e)=>{debug.log(e)});
  }

  this.version = {
    local : GetLocalVersionSync.call(this,path.join(this.aionDir,"VersionInfo_AION-LIVE.ini")) || 200,
    remote : null,
    voicepack: {
      local : GetLocalVersionSync.call(this,path.join(folder.defaultDir,"VersionInfo_AION_JP.ini")) || 150,
      remote : null
    }
  }
  
  debug.log(`Aion ${this.version.local} installed in '${this.aionDir}'`);
  debug.log(`using '${this.options.Aion.language}' from installed lang: '${this.installedLanguage}' `);
  debug.log(`voice pack ${this.version.voicepack.local}`);
  debug.log(`download: '${folder.download}'`);
  debug.log(`temp: '${folder.tmp}'`);
  debug.log(`default: '${folder.defaultDir}'`);
  
}

function getAionDirSync() {

  let dir = regedit.RegQueryStringValue("HKLM","Software\\Gameforge\\AION-LIVE","BaseDir");
  
  if (ffs.sync.exists(dir,true)) { 
    return dir 
  }
  else {
     try {
     
        const steam_db_id = 261430;
        
        let steamDir = regedit.RegQueryStringValue("HKLM","Software\\Valve\\Steam","InstallPath"); 
        let data = fs.readFileSync(path.join(steamDir, "steamapps/libraryfolders.vdf"), "utf8");
           
        if (regedit.RegKeyExists("HKLM","Software\\Valve\\Steam\\apps") === 1) {
            
              let list = steamVDF.parse(data.toString());

              for ( let folder in list.LibraryFolders) {
              
                if (Number.isFinite(Number(folder))) {

                    let libraryDir = list.LibraryFolders[folder];
                    dir = path.join(libraryDir,"steamapps/common/AION/client");
                    
                    if (ffs.sync.exists(dir,true)) { 
                      return dir;
                    }
              
                }
              }
              dir = path.join(steamDir,"steamapps/common/AION/client");
              if (ffs.sync.exists(dir,true)) { return dir }
         }
     }
     catch(e) {
        debug.log(e);
     }
     
     dir = path.join(win32.path.programfiles,"Gameforge/NCLauncher/Download/AION-LIVE");
     if (ffs.sync.exists(dir,true)) { return dir }
        
     dir = path.join(folder.defaultDir,"client");
     if (ffs.sync.exists(dir,true)) { return dir }
     else {
       try {
         ffs.sync.mkdir(dir);
         this.changeAionDir(dir);//untested
         return dir
       }catch(e){
         debug.log(e);
       }
    }
  }
}

aion.prototype.changeAionDir = function(dir) {

  try {
    regedit.RegWriteStringValue("HKLM","Software\\Gameforge\\AION-LIVE","BaseDir",dir);
    regedit.RegDeleteKeyValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,"bin32/aion.bin"));
    regedit.RegDeleteKeyValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,"bin64/aion.bin"));
  }catch(e) {
    debug.log(e);
  }

}

function GetLocalVersionSync(file) {

  try {
  
    let version = ini.parse(fs.readFileSync(file, 'utf8'));
    return parseInt(version.VersionInfo.GlobalVersion);
  
  }catch(e) {
    return null;
  }

}

async function GetRemoteVersion(needlestack, cc = 2) {

  let version = (parseInt(needlestack) < 0) ? 0 : parseInt(needlestack);
  let url, status, error = 10;
  
  switch(cc) {
      case 2:
          url = urls.eu;
          break;
      case 4:
          url = urls.jp;
          break;
      default:
          throw `(Error) Unknown region index: ${cc}`;
  } 
  
  let firstQuery = true;
 
  debug.log(`realm ${cc} ping ?`);
  
  let urlping = urlParser.parse(url.base);
  
  let ping = await request.head(`${urlping.protocol}//${urlping.hostname}`);

  debug.log(`realm ${cc} > pong !`);
  
  debug.log(`scrapping version for realm ${cc}`);
  
    do {
        try {
          let req = await request.head(url.fileInfo(version), { validateStatus: (status) => {return true} });
          
          status = req.status;
          debug.log(`${cc} | ${version} - HTTP:${status}`);
          
          if (status == 200) { version = version + 1; error = 10; } 
          else {
          
            if (firstQuery) {   
                version = version + 1
                do {
                         try {
                           let req = await request.head(url.fileInfo(version), { validateStatus: (status) => {return true} }); 
                                  
                           status = req.status;
                           debug.log(`${cc} | ${version} - HTTP:${status}`);
                           version = version + 1;
                           error = 10;   
                         }catch(e){
                            debug.log(e);
                            error = error - 1;
                            if (error <= 0) {
                              throw "max retry reached";
                            }
                         }
                }  
                while ( status == 404);   
            } else { version = version - 1; } 
            
          }
          firstQuery = false;
        }catch(e){
          debug.log(e);
          error = error - 1;
          if (error <= 0) {
            throw "max retry reached";
          }
        }
    }
    while ( status == 200 );

    debug.log(`realm ${cc} last version is ${version}`);
    return version;
    
}

aion.prototype.writeOptionsToFile = function() {

  const self = this;
  
  return new Promise((resolve, reject) => {

    lock.writeLock((release) => {
          mkdirp(path.parse(self.optionFile).dir, function (err) {
             if (err) { 
               release();
               return reject(err); 
             }
             else {
              fs.writeFile(path.resolve(self.optionFile), ini.stringify(self.options), 'utf8', (err) => {
                release();
                if (err) {
                  return reject(err);
                } else {
                  return resolve();
                }
              });
             }
          })
    });

  });
}

aion.prototype.hasUpdate = async function() {

  try {

    let requestPromise = [];

    if (this.version.remote === null) {
      let req = GetRemoteVersion(this.version.local,2).then((version)=>{ this.version.remote = version});
      requestPromise.push(req);
    }

    if (this.options.Aion.voicepack) {
     if (this.version.voicepack.remote === null) {
        let req = GetRemoteVersion(this.version.voicepack.local,4).then((version)=>{ this.version.voicepack.remote  = version});
        requestPromise.push(req);
      } 
    }
    
    await Promise.all(requestPromise);
    
    if (!this.installedLanguage.some(l10n => this.options.Aion.language == l10n)) { debug.log("update => lang is not installed"); return true }
    if (this.version.remote > this.version.local) { debug.log("update => new version available"); return true }  
    if (this.options.Aion.voicepack) {
      if (this.version.voicepack.remote > this.version.voicepack.local) { debug.log("update => voice pack"); return true }
    }  

    debug.log("no update");
    return false;
    
  } catch(e) {
      debug.log(e);
      throw e;
  }

}


async function forcefaststart () { 
  
    const file = path.join(this.aionDir,"/Data/dump/config.ini");
  
    try {
    
      let config = ini.parse(await ffs.promises.readFile(file, 'utf8'));
      
      config.Game.ValidTableDump = 1;
      config.Game.NormalStop = 1;
      
      await ffs.promises.writeFile(file, ini.stringify(config));
    
    }catch(e) {
      
      if (e.code === "ENOENT") {
        debug.log(`${file} doesnt exist`);
      }
      else if (e.code === "EPERM") {
        debug.log(`${file} is read only`);
      }
      else {
        debug.log(e);
      }
      
    }
}

function getArgs() {

   const HOST = 'update.aion.gfsrv.net';
   const PORT = 27500;
   const timeout = 600;
   const hex = "0f0002000a0941494f4e2d4c495645";
   const filter = ["-64","-ingamebrowser","-nowebshop","-n20","-hidepromo","-aiontv"];

   return new Promise((resolve, reject) => {
   
   let client = new net.Socket();
   
      client.setTimeout(timeout, () => { 
        reject(`Timeout of ${timeout}ms reached.`); 
        client.destroy();  
      });
   
      client.connect(PORT, HOST, () => { client.write(hex,"hex") });
      
      client.once('connect', () => client.setTimeout(0));
      
      client.on('data', function(data){
        debug.log("Receiving args from Gameforge");
        
        let response = data.toString().match(/-[a-z0-9\:.]+/g);
        resolve( response.filter( param => !filter.some(el => el == param) ) );
        client.end();
        
      });

      client.on('error', function(err) {
         reject(err);
         client.end();
      });

   });
}

aion.prototype.run = async function(credentials = {user: null, password: null}) {
      
  const bin = {
    x86: "bin32/aion.bin",
    x64: "bin64/aion.bin"
  };
  
  const args_company = [`/SessKey:""`, `/CompanyID:"11"`, `/ChannelGroupIndex:"-1"`];
  
  let file = (this.options.Aion.run64 && win32.info.is64) ? path.join(this.aionDir,bin.x64) : path.join(this.aionDir,bin.x86);
  
  if (!await ffs.promises.exists(file)) { throw `${file} doesn't exist.` }
  
  let args;
  try {
    args = await getArgs();
  }catch(e) {
    debug.log(e);
    debug.log("args from default");
    args = [    `-ip:79.110.83.80`,
                `-noweb`,
                `-noauthgg`,
                `-st`, 
                `-charnamemenu`,  
                `-webshopevent:6`, 
                `-f2p`, 
                `-lbox`, 
                `-litelauncher`, 
                `-ncping`, 
                `-nosatab`,
                `-nobs`,
                `-60f2p`
           ];
  } 
        
  args = args.concat(args_company);
        
  args.push(`-litestep:9`);    
  
  args.push(`-lang:${this.options.Aion.language.toUpperCase()}`);                 

  if (this.options.Aion.run64 && win32.info.is64) {
    args.push(`-64`);
  }
  
  if (this.options.Aion.ingame_shop) { 
    args.push(`-ingamebrowser`); 
  } else { 
    args.push(`-nowebshop`); 
  }
  
  if (this.options.Aion.ads) { 
    args.push(`-n20`);
    args.push(`-aiontv`); 
  } else { 
    args.push(`-hidepromo`); 
  }
  
  if (credentials.user && credentials.password) {
    args.push(`-account:${credentials.user}`);
    args.push(`-password:${credentials.password}`);
  }
  
  if (this.options.Aion.forcewin7) {
    regedit.RegWriteStringValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,bin.x64),"~ WIN7RTM");
    regedit.RegWriteStringValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,bin.x86),"~ WIN7RTM");
  } else {
    regedit.RegDeleteKeyValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,bin.x64));
    regedit.RegDeleteKeyValue("HKCU","Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers",path.join(this.aionDir,bin.x86));
  }

  if (this.options.Aion.fastStartUp) {
    await forcefaststart.call(this);
  }
  
  spawn(`"${file}"`, args, {stdio:[ 'ignore', 'ignore', 'ignore' ], shell: true, windowsHide: true, detached: true, windowsVerbatimArguments: true}).unref();
 
}

async function compareHash(local_hash, file, force=false) {

 try {
    let filePath = path.join(this.aionDir,file.path);
  
    let stats = await util.promisify(fs.stat)(filePath);
  
   if (force) {
      
      debug.log("repair > forcing hash computation");
      return (file.sha1 !== await ffs.promises.hashFile(filePath)) ? true : false

   } else {
   
       if ( stats.size != file.size) {
          return true
       } else {
          let local = local_hash || await ffs.promises.hashFile(filePath);
          return (file.sha1 !== local) ? true : false
       }
   
   }
     
  }catch(e) {
    debug.log(`error '${e}' > pushed to update list`);
    return true 
  }

}

function parseInfoMap(data,convert=false) {

       let result = data.split("\r\n").map((row) => {
                       let column = row.split(":"); 
                       
                       if (convert) {
                       
                             let converted = column[0].replace("JPN",this.options.Aion.language.toUpperCase());
        
                             if (column[0].includes("L10N\\JPN\\Sounds")){
                                let filename = path.parse(converted).base;
                                converted = converted.replace(filename,"y"+filename);
                             }
                             
                             return { path: converted, voicepack: column[0], size : column[1], sha1 : column[2], litestep : column[3] }
                             
                       } else {
                       
                             return { path: column[0], size : column[1], sha1 : column[2], litestep : column[3] }
                             
                       }
       });
       
       result.pop(); //Remove last empty line
       
       return result;
}

aion.prototype.generateDownloadFileList = async function(repairMode, callbackProgress = ()=>{}){

  try {

    callbackProgress({step: 0});

    var manifest = await new Promise((resolve,reject) => {
      download(urls.eu.fileInfo(this.version.remote),folder.tmp)
      .then((file) => { return unzip(file) })
      .then((file) => { return ffs.promises.readFile(file,'utf16le') })
      .then((data) => { return data.slice(1); }) //Remove BOM
      .then((data) => { return parseInfoMap(data) })
      .then((data) => { 
          return data.filter((file) => { 
            if (file.path.includes(`l10n\\${this.options.Aion.language.toUpperCase()}`)) { return true }
            else { return !file.path.includes(`l10n`) }
          });
       })
      .then((data) => { resolve(data) })
      .catch((err) => { debug.log(e); reject(err) })  
    });
    
    var torrent = await new Promise((resolve,reject) => {
      download(urls.eu.torrent(this.version.remote),folder.tmp)
      .then((file) => { return unzip(file) })
      .then((file) => { return ffs.promises.readFile(file) })
      .then((data) => { return parseTorrent(data).files })
      .then((data) => { resolve(data) })
      .catch((err) => { debug.log(err); resolve() })  
    });
    
    var local_manifest = await new Promise((resolve,reject) => {
     ffs.promises.readFile(path.join(this.aionDir,"FileInfoMap_AION-LIVE.dat"),'utf16le')
     .then((data) => { return data.slice(1); }) //Remove BOM
     .then((data) => { return parseInfoMap(data) })
     .then((data) => { resolve(data) }) 
     .catch((err) => { debug.log(err); resolve(); })  
    });  
    
    if (this.options.Aion.voicepack) {
      
      var manifestJP = await new Promise((resolve,reject) => {
        download(urls.jp.fileInfo(this.version.voicepack.remote),folder.tmp)
        .then((file) => { return unzip(file) })
        .then((file) => { return ffs.promises.readFile(file,'utf16le') })
        .then((data) => { return data.slice(1); }) //Remove BOM
        .then((data) => { return parseInfoMap.call(this,data,true) })
        .then((data) => { 
            return data.filter((file) => { 
              if (file.path.includes(`L10N\\${this.options.Aion.language.toUpperCase()}\\Sounds`)) { return true }
            });
         })
        .then((data) => { resolve(data) })
        .catch((err) => { debug.log(e); reject(err) })  
      });
      
      var torrentJP = await new Promise((resolve,reject) => {
        download(urls.jp.torrent(this.version.voicepack.remote),folder.tmp)
        .then((file) => { return unzip(file) })
        .then((file) => { return ffs.promises.readFile(file) })
        .then((data) => { return parseTorrent(data).files })
        .then((data) => { 
              return data.filter((file) => { 
                if (file.path.includes(`L10N\\JPN\\Sounds`)) { return true }
              });
         })
        .then((data) => { resolve(data) })
        .catch((err) => { debug.log(err); resolve(); })  
      });
      
      var local_manifestJP = await new Promise((resolve,reject) => {
       ffs.promises.readFile(path.join(folder.defaultDir,"FileInfoMap_AION_JP.dat"),'utf16le')
       .then((data) => { return data.slice(1); }) //Remove BOM
       .then((data) => { return parseInfoMap.call(this,data,true) })
       .then((data) => { 
            return data.filter((file) => { 
              if (file.path.includes(`L10N\\${this.options.Aion.language.toUpperCase()}\\Sounds`)) { return true }
            });
        })
       .then((data) => { resolve(data) }) 
       .catch((err) => { debug.log(err); resolve(); })  
      });  

      manifest = manifest.concat(manifestJP);
      
      if (torrent && torrentJP) {
        torrent = torrent.concat(torrentJP);
      } else {
        debug.log("cant add torrent jp to torrent");
      }
      
      if (local_manifest && local_manifestJP) {
        local_manifest = local_manifest.concat(local_manifestJP);
      } else {
        debug.log("cant add local_manifest jp to local_manifest");
      }
      
    }      
            
    let result = [];
    let count = 1;
    for (file of manifest) {
      
          let local_hash;
          try {
            local_hash = local_manifest.find(el => el.path === file.path ).sha1;
            debug.log("local hash found for: "+file.path);
          }
          catch(e) {
            debug.log("No local hash found for: "+file.path);
            local_hash = null;
          }
    
               if (await compareHash.call(this,local_hash,file,repairMode)) { 
               
                    try {

                      
                      let match = file.voicepack || file.path;

                      let torrentInfo = torrent.find(el => el.path.replace('Patch\\Zip\\','').replace(path.parse(el.path).ext,"") === match );
                      
                      if (!torrentInfo.path.includes(".zip")) {
                        torrentInfo = torrent.filter(el => el.path.replace('Patch\\Zip\\','').replace(path.parse(el.path).ext,"") === match );
                        file.url = [];
                        file.zipSize = [];
                        for (multipart of torrentInfo) {
                          file.url.push(multipart.path);
                          file.zipSize.push(multipart.length);
                        }
                      }
                      else {
                        file.url = [torrentInfo.path] ;
                        file.zipSize = [torrentInfo.length] ;
                      }
                      file.zipSizeTotal = file.zipSize.reduce((a, b) => ( a + b ));

                    }
                    catch(e){ 
                      debug.log("error finding file data in torrent list: "+e) 
                      
                      file.url = [];
                      let filePath, fileURL, status;
                        
                      if (file.voicepack) { 
                          filePath = path.parse(file.voicepack);
                          fileURL = urls.jp.base + "/" + this.version.voicepack.remote + "/Patch/Zip/" + filePath.dir.replace(/\\/g,"/") + "/" + filePath.base;
                      } else {
                          filePath = path.parse(file.path);
                          fileURL = urls.eu.base + "/" + this.version.remote + "/Patch/Zip/" + filePath.dir.replace(/\\/g,"/") + "/" + filePath.base;
                      }
                        
                      let url = fileURL + ".zip";
                      let errorCount = 10;
                      do { 
                        try {
                          let req = await request.head(url, { validateStatus: (status) => {return true} });
                          status = req.status;
                          
                          if (status == 200) {
                            file.url.push(path.join("/Patch/Zip/"+filePath.dir,filePath.base + ".zip"));
                          } else {
                              let counter = 1;
                              do {
                                  try {
                                    if( parseInt(counter) < 10 ) { counter = "0" + counter; }
                                    let url = fileURL + `.z${counter}`;
                                    let req = await request.head(url, { validateStatus: (status) => {return true} }); 
                                    status = req.status;
                                    if (status == 200) { file.url.push("/Patch/Zip/"+path.join(filePath.dir,filePath.base + `.z${counter}`)); }
                                    counter = parseInt(counter) + 1;
                                  }catch(e){
                                    debug.log(e);
                                    error = error - 1;
                                    if (error <= 0) {
                                      throw "max retry reached";
                                    }
                                  } 
                              }while (status == 200);
                           }
                           file.zipSize = 0 ;
                           file.zipSizeTotal = 0;
                         }catch(e){
                            debug.log(e);
                            error = error - 1;
                            if (error <= 0) {
                              throw "max retry reached";
                            }                        
                         }
                       }while ( status != 200 );
                    }
                    result.push(file);
               } 
               
    let percent = Math.floor((count/manifest.length)*100);
    callbackProgress({step: 0, progress: percent});
    count = count + 1;
               
    }
             
    return result;

  }catch(e) { 
    await ffs.promises.rmdir(folder.tmp).catch(()=>{});
    debug.log(e);
    throw e;
  }

}


async function updateIniVersion() {
    
    let promises = [];
    
      promises[0] = (async () => {
    
          let iniFile = path.join(this.aionDir,"VersionInfo_AION-LIVE.ini");
          let version, flag;
          
            try {
               let data = await ffs.promises.readFile(iniFile , 'utf8');
               version = ini.parse(data);
               flag = "r+";
            } catch(e) {
              version = { VersionInfo : { 
                                GlobalVersion : 0,
                                DownloadIndex : 0,
                                LocalLevel : 0,
                                DownloadLevel : 0 }
                        };
              flag = "w";
            }
            
            version.VersionInfo.GlobalVersion = this.version.local = this.version.remote;

            await ffs.promises.writeFile(path.resolve(iniFile), ini.stringify(version), {encoding: "utf8", flag: flag}).catch((e)=>{ throw e; })
            await windows_file_attribute.setHidden(iniFile).catch(()=>{});
      
        })();
      
      if (this.options.Aion.voicepack) {
      
        promises[1] = (async () => {
        
            let iniFile = path.join(folder.defaultDir,"VersionInfo_AION_JP.ini");
            let version, flag;
            
              try {
                 let data = await ffs.promises.readFile(iniFile , 'utf8');
                 version = ini.parse(data);
                 flag = "r+";
              } catch(e) {
                version = { VersionInfo : { 
                                  GlobalVersion : 0,
                                  DownloadIndex : 0 }
                          };
                flag = "w";
              }
              
              version.VersionInfo.GlobalVersion = this.version.voicepack.local = this.version.voicepack.remote;

              await ffs.promises.writeFile(path.resolve(iniFile), ini.stringify(version), {encoding: "utf8", flag: flag}).catch((e)=>{ throw e; })
              await windows_file_attribute.setHidden(iniFile).catch(()=>{});
      
        })();
      
      }
      
      await Promise.all(promises)
      .then(()=>{debug.log("ini versionInfo updated.")})
      .catch((e)=>{debug.log(e); throw e});
  
}

async function updateLocalManifest() {

        let promises = [];

          promises[0] = (async () => {
            
            const filename = `FileInfoMap_AION-LIVE_${this.version.remote}.dat`;
            
            let file = path.join(folder.tmp,filename);
            let dest = path.join(this.aionDir,filename.replace(`_${this.version.remote}`,""));

            await windows_file_attribute.removeHidden(dest).catch(()=>{});
            await ffs.promises.copyFile(file, dest, {encoding: "utf8"}).catch((e)=>{ throw e })
            await windows_file_attribute.setHidden(dest).catch(()=>{});

          })();
        
        if (this.options.Aion.voicepack) {
        
          promises[1] = (async () => {
            
            const filename = `FileInfoMap_AION_JP_${this.version.voicepack.remote}.dat`;
            
            let file = path.join(folder.tmp,filename);
            let dest = path.join(folder.defaultDir,filename.replace(`_${this.version.voicepack.remote}`,""));

            await windows_file_attribute.removeHidden(dest).catch(()=>{});
            await ffs.promises.copyFile(file, dest, {encoding: "utf8"}).catch((e)=>{ throw e })
            await windows_file_attribute.setHidden(dest).catch(()=>{});

          })();
        
        }
       
       await Promise.all(promises)
       .then(()=>{debug.log("manifest cache updated.")})
       .catch((e)=>{debug.log(e); throw e});

}

aion.prototype.update = async function(repairMode,callbackProgress = ()=>{}) {

try { 

  var fileList = await this.generateDownloadFileList.call(this,repairMode,callbackProgress);
  
  callbackProgress({step: 1});

  if ( fileList.length > 0 ) {
  
      let unziped = [];

      let total_size = (fileList.reduce((a, b) => ({zipSizeTotal: a.zipSizeTotal + b.zipSizeTotal})).zipSizeTotal)/1000;
      let slice_size = (100/fileList.length);
      let count = 0;

      for (file of fileList) {
 
        let baseURL;
        if (file.voicepack) {
          baseURL = urls.jp.base + "/" + this.version.voicepack.remote;
        } else {
          baseURL = urls.eu.base + "/" + this.version.remote;
        }

        let progressPercent = Math.floor((count/fileList.length)*100);

        let filePath = file.voicepack || file.path;
        
        filePath = path.parse(filePath);

         let chunck_size = (slice_size / file.url.length);
         let chunk_count = 0; 
         
         if (file.url) {
           for (fileUrl of file.url) {
              
                  let url = baseURL + "/" + fileUrl.replace(/\\/g,"/");
                  if (file.voicepack) {
                    var dest = path.join(folder.download,"JP",this.version.voicepack.remote.toString(),filePath.dir);
                  } else {
                    var dest = path.join(folder.download,"EU",this.version.remote.toString(),filePath.dir);
                  }
                  
                  try {
                    var fileStat = await util.promisify(fs.stat)(path.join(dest,path.parse(fileUrl).base));
                  } catch(e) {
                    var fileStat = {size : 0};
                  }
                  
                  if (fileStat.size > 0 && fileStat.size === file.zipSize[chunk_count]) {
                    debug.log("file already exist and matching size > skipping"); 
                    let percent = progressPercent + Math.floor((slice_size/file.url.length)+chunck_size*chunk_count);
                    callbackProgress({step: 1, progress: percent, file: filePath.base, totalSize: total_size});
                  }
                  else {
                    debug.log("dowloading "+url);
                    await download(url,dest, function(itemPercent, speed, destFile){
                    let percent = progressPercent + Math.floor((((slice_size/100)/file.url.length)*itemPercent)+chunck_size*chunk_count);
                    callbackProgress({step: 1, progress: percent, speed: speed, file: filePath.base, totalSize: total_size});
                    });
                  }
                  chunk_count = chunk_count + 1;
            }

            if (file.voicepack) {
              unziped.push({path: path.join(dest,filePath.base + ".zip"), toDir: path.join(this.aionDir,path.parse(file.path).dir), voicepack : true });
            } else {
              unziped.push({path: path.join(dest,filePath.base + ".zip"), toDir: path.join(this.aionDir,filePath.dir) });
            }

         } else {
          throw "Requested file has no url !";
         }
         count = count + 1;
       }
         
         slice_size = (100/unziped.length);
         count = 1;
         
         
         
       callbackProgress({step: 2});
         
         
        for (file of unziped) {
         
          let percent = Math.floor((count/unziped.length)*100);
         
         try {
            if (file.voicepack){
            
              let extracted = await unzip(file.path);
              await ffs.promises.copyFile(extracted, path.join(file.toDir,"y"+path.parse(extracted).base));
            } else {
              await unzip(file.path,file.toDir);
            }
          }catch(e) {
            debug.log(e);
            throw "!Network";
          }
          
          callbackProgress({step: 2, progress: percent, file: path.parse(file.path).base});
          count = count + 1;
         }
  } else {
    debug.log("update but no files need updation ...");
  }
    
  callbackProgress({step: 3});

        count = 1;
        if (this.options.Aion.voicepack) {

          try {
             let files = await util.promisify(glob)("**/[y]*.pak", { cwd: path.join(this.aionDir,`l10n/${this.options.Aion.language.toUpperCase()}/sounds/voice`), nodir: true, absolute: true });

             let updatedList = fileList.filter( file => file.voicepack);
              
             for (file of files) {
                         let percent = Math.floor((count/files.length)*100);
                         
                         let filename = path.parse(file).name;
                         let destination = file.replace(filename,filename.replace("y","z"));

                         if (await ffs.promises.exists(destination)) {
                            debug.log("voicepack patch found");

                            if (updatedList.find( el => file.toString().toLowerCase().includes(el.path.toString().replace(/\\/g, '/').toLowerCase()) )){
                                debug.log("voicepack patch must be updated because source was updated");
                                await voicepackCreatePatch(file, destination);
                            }
                                        
                         } else {
                            debug.log("no voicepack patch found");
                            await voicepackCreatePatch(file, destination);
                         
                         }

                         callbackProgress({step: 3, progress: percent, file: path.parse(file).base});
                         count = count + 1;
             }
           }catch(e) {
            debug.log(e);
           }

        }
        else {
        
          try {
           let files = await util.promisify(glob)("**/[yz]*.pak", { cwd: path.join(this.aionDir,`l10n/${this.options.Aion.language.toUpperCase()}/sounds`), nodir: true, absolute: true });
                    
           for (file of files) {
                         let percent = Math.floor((count/files.length)*100);
                         await ffs.promises.unlink(path.resolve(file)).catch(()=>{});
                         callbackProgress({step: 3, progress: percent, file: path.parse(file).base});
                         count = count + 1;
           }
           await ffs.promises.unlink(path.join(folder.tmp,`FileInfoMap_AION_JP_${this.version.voicepack.remote}.dat`)).catch(()=>{});

          }catch(e) { debug.log(e); }
        }
        
        await Promise.all([
            updateIniVersion.call(this),
            updateLocalManifest.call(this)
        ]).catch((e)=>{
          debug.log(e);
          throw "!Network";
        });
        
        debug.log("ini and manifest done.");
        
        await Promise.all([
            ffs.promises.rmdir(folder.download),
            ffs.promises.rmdir(folder.tmp)
        ]).catch((e)=>{debug.log(e)});
        
        callbackProgress({step: 3, progress: 100});

  

  }catch(e) { 
    debug.log(e);
    await ffs.promises.rmdir(folder.tmp).catch(()=>{}); 
    throw e;

  }

}

async function voicepackCreatePatch(source, destination) {

  const map = [    
      {from: "_fdb", to: "_fdd"},
      {from: "_fdc", to: "_fdb"},
      {from: "_fdd", to: "_fdc"},
      {from: "_flb", to: "_fld"},
      {from: "_flc", to: "_flb"},
      {from: "_fld", to: "_flc"},
      {from: "_mdb", to: "_mdd"},
      {from: "_mdc", to: "_mdb"},
      {from: "_mdd", to: "_mdc"},
      {from: "_mlb", to: "_mld"},
      {from: "_mlc", to: "_mlb"},
      {from: "_mld", to: "_mlc"},
      {from: "f_b_", to: "f_d_"},
      {from: "f_c_", to: "f_b_"},
      {from: "f_d_", to: "f_c_"},
      {from: "m_b_", to: "m_d_"},
      {from: "m_c_", to: "m_b_"},
      {from: "m_d_", to: "m_c_"}
  ];

  try {

    if (await ffs.promises.exists(source)) {
  
      debug.log("creating voicepack patch: "+destination);
  
      let archive = new zip(await pak2zip(source,path.join(folder.tmp,path.parse(source).name)+".zip"));
      let newArchive = new zip();
      
      let archiveFileList = archive.getEntries();

      archiveFileList.forEach((entry)=> {

        let fileName = entry.entryName;
        let fileContent = archive.readFile(entry);
        
        for (patch of map) {
        
            if (fileName.includes(patch.from) ){
                 var newFileName = fileName.replace(patch.from,patch.to);
                 break;
            }
        }
        
        let name = newFileName || fileName;
        newArchive.addFile(name, fileContent, '', 0644 << 16);         
      });

      newArchive.writeZip(path.resolve(destination));
    
    } else {
      debug.log("voicepack patch source file 'y' is not there -> but should be !");
    }

  }catch(e) {
    debug.log(e);
  }

}

aion.prototype.hasSystemCFG = async function() {

  let file = path.join(this.aionDir,"\system.cfg");
  
  return await ffs.promises.exists(file);
  
}

aion.prototype.readSystemCFG = function() {

  let file = path.join(this.aionDir,"\system.cfg");
  
  return systemCFG.read(file);

}

aion.prototype.writeSystemCFG = async function(data) {

  let file = path.join(this.aionDir,"\system.cfg");
  
  await windows_file_attribute.removeReadOnly(file).catch(()=>{});
  try {
    await systemCFG.write(file,data);
  }catch(err) {
    debug.log(err);
  }
  await windows_file_attribute.setReadOnly(file).catch(()=>{});
}