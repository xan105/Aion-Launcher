const http = require('http');
const https = require('https');
const urlParser = require('url');

module.exports = (jsonUrl,timeout = 3000) => {
  return new Promise((resolve, reject) => {

    let url = urlParser.parse(jsonUrl);
    url.headers = { 
      'Content-Type': 'application/json',
      'User-Agent': 'Chrome/',
      'Accept': 'application/vnd.github.v3+json' //github
    };

    const lib = (url.protocol === "https:") ? https : http;
    let request = lib.get(url, (response) => {
    
      if (response.statusCode >= 200 && response.statusCode < 300) { 

        let data = [];
        response.on('data', (chunk) => {
             data.push(chunk);
        });
        response.on('end', () => {
             
             let json = data.join('');
             
             try {
                let result = JSON.parse(json);
                resolve(result);
             } catch(err) {
                reject(err);
             }
             
        });
        response.on('error', function(err) {
             reject(err);
             request.abort();
        });
      
      } else {
         reject(response.statusCode);
         request.abort();
      }
      
      
   });
   request.setTimeout(timeout, () => {
        request.abort();
   });
   request.on('error', (err) =>  {
        reject(err);
        request.abort();
   });
  
  });  
}