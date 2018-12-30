const os = require('os');
const path = require('path');

try {
  const regedit = require(path.resolve("./package/native/regedit/regedit.js"));
  
  module.exports = {
    path : {
      appdata: process.env.APPDATA || regedit.RegQueryStringValueAndExpand("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","AppData"),
      localappdata: process.env.LOCALAPPDATA || regedit.RegQueryStringValueAndExpand("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","Local AppData"),
      home: {
            root: os.homedir() || process.env.USERPROFILE,
            desktop: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","Desktop") || path.join(os.homedir() || process.env.USERPROFILE,"Desktop"),
            music: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","My Music") || path.join(os.homedir() || process.env.USERPROFILE,"My Music"),
            video: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","My Video") || path.join(os.homedir() || process.env.USERPROFILE,"My Video"),
            pictures: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","My Pictures") || path.join(os.homedir() || process.env.USERPROFILE,"My Pictures"),
            documents: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","Personal") || path.join(os.homedir() || process.env.USERPROFILE,"Personal"),
            download: regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","{7D83EE9B-2244-4E70-B1F5-5393042AF1E4}") || path.join(os.homedir() || process.env.USERPROFILE,"Download")
       },
       windir: process.env.windir,
       sysdrive: process.env.SystemDrive,
       programdata: process.env.ProgramData,
       programfiles: process.env.ProgramFiles,
       programfiles64: process.env.ProgramW6432,
       temp: os.tmpdir() || process.env.TEMP
    },
    info: {
     is64: os.arch() === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'),
     winVer: os.release().split("."),
     username: os.userInfo().username
    }
  }
} catch(e) {
  module.exports = {
    path : {
      appdata: process.env.APPDATA,
      localappdata: process.env.LOCALAPPDATA,
      home: {
            root: os.homedir() || process.env.USERPROFILE,
            desktop: path.join(os.homedir() || process.env.USERPROFILE,"Desktop"),
            music: path.join(os.homedir() || process.env.USERPROFILE,"My Music"),
            video: path.join(os.homedir() || process.env.USERPROFILE,"My Video"),
            pictures: path.join(os.homedir() || process.env.USERPROFILE,"My Pictures"),
            documents: path.join(os.homedir() || process.env.USERPROFILE,"Personal"),
            download: path.join(os.homedir() || process.env.USERPROFILE,"Download")
       },
       windir: process.env.windir,
       sysdrive: process.env.SystemDrive,
       programdata: process.env.ProgramData,
       programfiles: process.env.ProgramFiles,
       programfiles64: process.env.ProgramW6432,
       temp: os.tmpdir() || process.env.TEMP
    },
    info: {
     is64: os.arch() === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'),
     winVer: os.release().split("."),
     username: os.userInfo().username
    }
  }
}