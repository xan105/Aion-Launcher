"use strict";

module.exports.openWin = (window, file, options={}) => {
  return new Promise(resolve => {
      window.open(file, options, (win) => { resolve(win) });
  });
}