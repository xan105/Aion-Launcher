"use strict";

( async() => {

    //if (process.versions['nw-flavor'] === "sdk") { throw "This is not meant for a SDK build." }

    const path = require('path');
    const nwjs = require(path.resolve("./package/util/nw.js"));
  
    if ( !nw.App.manifest.view.app ||
         !nw.App.manifest.view.updater || 
         !nw.App.manifest.window ||
         !nw.App.manifest.splash ||
         !nw.App.manifest.selfUpdate 
    ){ throw "Missing manifest element." }
  
    let file = {path: nw.App.manifest.view.app, options: nw.App.manifest.window };
    
    if (!nw.App.argv.some( param => param === "-noselfupdate") && nw.App.manifest.selfUpdate.enable) {
      file = {path: nw.App.manifest.view.updater, options: nw.App.manifest.splash};
    }

    await nwjs.openWin(nw.Window, file.path, file.options);

})().catch((err) => {
      alert(`Failed to initialize:\n${err}`);
      process.exit(1);
});