"use strict";

const os = require('os');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const tempDir = os.tmpdir() || process.env.TEMP;
const ffs = require(path.resolve("./package/util/feverFS.js"));
const nwjs = require(path.resolve("./package/util/nw.js"));
const download = require(path.resolve("./package/util/download.js"));
const getRemoteJson = require(path.resolve("./package/util/getRemoteJson.js")); 
const semverCompare = require(path.resolve("./package/util/versionCompare.js")).semver; 

var updater = {
  hasUpdate : false,
  exit : function() {
    let self = nw.Window.get();
    self.hide();
    self.close(true);
  },
  onStart : async function() {
    try {
    
      let version = {
       local : nw.App.manifest.version
      };
      
      $('#version').text(version.local);
    
      let github = await getRemoteJson(nw.App.manifest.selfUpdate.github).catch(()=>{ return {} });
      
      version.remote = github.tag_name || "0.0.0";
      
      this.hasUpdate = semverCompare(version.local,version.remote);
      
      if (this.hasUpdate) {
        try {
          let url = github.assets.find( asset => asset.name === nw.App.manifest.selfUpdate.name).browser_download_url;
          $(".lds-roller","#status").hide();
          $(".loadingBar","#status").show();
          let file = await download(url,tempDir,this.print);
          if (await ffs.promises.exists(file)) {
            this.upgrade(file);
          } else {
            throw "File doesn't exist.";
          }
          return this.exit();
        }catch(err) {}
      }

      let next = await nwjs.openWin(nw.Window, nw.App.manifest.view.app, nw.App.manifest.window); 
      next.on('loaded', () => { this.exit() });
    
    }catch(err) {
      alert(`Failed to initialize main view:\n${err}`);
      this.exit();
    }
  },
  upgrade : function(file) {
    const args = ["/SILENT","/SP-","/NOCANCEL","/NORESTART","/CLOSEAPPLICATIONS"];
    spawn(`"${file}"`, args, {stdio:[ 'ignore', 'ignore', 'ignore' ], shell: true, windowsHide: true, detached: true, windowsVerbatimArguments: true}).unref();
  },
  progress : {
    load : $(".loadingBar", "#status"),
    meter : $(".loadingBar .meter", "#status"),
    number : function (x){
        
        const metric = ["kB/s","MB/s","GB/s"];
    
        if (!x && x!= 0) return null;

        let result = {
          number : null,
          metric : metric[0]
        }
        
        if (x >= 1000000) { 
          x = (x / 1000000);
          result.metric = metric[2];
        }
        else if (x >= 1000) { 
          x = (x / 1000)  
          result.metric = metric[1];
        }
        
        result.number = x.toLocaleString(undefined, {maximumFractionDigits: 1});
        
        return result;
      }
    },
    print : function (percent,speed) {
      
      let current = {
        progress: percent || 0,
        speed: updater.progress.number(speed) || null,
      };

      if (current.progress >= 0 && current.progress <= 100) { 
        updater.progress.load.attr('data-percent', current.progress);  
        updater.progress.meter.css('width',`${current.progress}%`);
      } 
        
      if (current.speed) { 
        updater.progress.load.attr('data-speed', `${current.speed.number} ${current.speed.metric}`);
      } else {
        updater.progress.load.attr('data-speed', "null");
      } 
    }
};


(function($, window, document) {
  $(function() {
       updater.onStart().catch((e)=>{ process.exit(1); });
  });
}(window.jQuery, window, document));  