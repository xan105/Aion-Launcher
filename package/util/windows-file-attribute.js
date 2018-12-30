const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const util = require('util'); 

module.exports = attrib = (target, attributes) => {

  const validAttribute = ["R","A","S","H","O","I","X","V","P","U","B"];
  /*

  Add or remove file/dir attribute

    +   add.
    -   remove.
    
    R   Read-Only.
    A   Archive.
    S   System File.
    H   Hidden.
    O   Offline.
    I   Not Content Indexed.
    X   No scrub file attribute.
    V   Integrity attribute.
    P   Pinned.
    U   Unpinned.
    B   SMR blob.  

  */

  return new Promise((resolve, reject) => {
    
      target = path.resolve(target);
      attributes = iterable(attributes);

      for (attribute of attributes) {
      
        if (!validAttribute.some(attr => (attribute === `+${attr}`) || (attribute === `-${attr}`)) ) {
          return reject("Invalid attribute");
        }
      
      }

      fs.stat(target, async function(err,stat){
        if (err != null) 
        {
          return reject("Target not found!");
        }
        else 
        {
          try
          {
            await util.promisify(exec)(`attrib ${attributes.join(" ")} "${target}"`,{windowsHide: true});
            resolve(); 
          }
          catch(e)
          {
            reject(e);
          }  
        }
        
      });

    });
}

module.exports.getCurrent = currentAttrib = (target) => {
  
  return new Promise((resolve, reject) => {

    target = path.resolve(target);
    
    fs.stat(target, async function(err,stat){
          if (err != null) 
          {
            return reject("Target not found!");
          }
          else 
          {
            try 
            {
              let output = await util.promisify(exec)(`attrib "${target}"`,{windowsHide: true});
              resolve(output.stdout.replace(target,"").replace(/\s/g,'').split(""));
            }
            catch(e) 
            {
              reject(e);
            }
          }
    });     

  });
}

module.exports.has = hasAttrib = async (target,attributes) => {

   try {
   
    attributes = iterable(attributes);
    
    let result = [];
    let current = await currentAttrib(target);
    
    for (attribute of attributes) { result.push(current.includes(attribute)); }

    return !result.includes(false); 
  
  } 
  catch(e) {
      throw e;
  }

}

module.exports.isHidden = async (target) => {

  try {
    return await hasAttrib(target,"H");
  }
  catch(e) {
    throw e;
  }

}

module.exports.isReadOnly = async (target) => {

  try {
    return await hasAttrib(target,"R");
  }
  catch(e) {
    throw e;
  }

}

module.exports.setReadOnly = async (target) => { 
  
  try {

    let current = await currentAttrib(target);
    
    if (current.includes("R")){ return; }
    
    if (current.includes("H")) { await attrib(target,"-H"); }

    await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["+R"]));
 
  }
  catch(e){
    throw e;
  }


}

module.exports.removeReadOnly = async (target) => { 
  
  try {

    let current = await currentAttrib(target);
    
    if (!current.includes("R")){ return; }
    else {
      current.splice(current.indexOf("R"), 1 );
    }
    
    if (current.includes("H")) { await attrib(target,"-H"); }

    await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["-R"]));
    
  }
  catch(e){
    throw e;
  }


}

module.exports.setHidden = async (target) => { 
  
  try {

    let current = await currentAttrib(target);
    
    if (current.includes("H")){ return; }

    await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["+H"]));
 
  }
  catch(e){
    throw e;
  }


}

module.exports.removeHidden = async (target) => { 
  
  try {

    let current = await currentAttrib(target);
    
    if (!current.includes("H")){ return; }
    else {
      current.splice(current.indexOf("H"), 1 );
    }

    await attrib(target,current.map(function(attr) { return '+' + attr; } ).concat(["-H"]));
    
  }
  catch(e){
    throw e;
  }


}

function iterable(obj) {

  if (!Array.isArray(obj)) 
  { 
    return [obj]; 
  }
  else {
    return obj;
  }

}