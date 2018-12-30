const crypto = require('crypto');

const ENCRYPTION_KEY = "Hqj!c@Q?Nq4$-ZFjXPHVeB=Dgw22JQjB"; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function credentials(elem)
{
    this.username = null;
    this.password = null;
    this.GetCredentials = () => {
    
      let usr = $(`${elem} input[type="text"]`).val();
      let pwd = $(`${elem} input[type="password"]`).val();
      let keep = $(`${elem} input[type="checkbox"]`).prop("checked");
     
      if ($.trim(usr.length) > 0 && $.trim(pwd.length) > 0) {
        this.username = clean(usr);
        this.password = clean(pwd);
        
        (keep) ? this.SaveCredentials() : this.DeleteCredentials();
        
        return {user: this.username, password: this.password};
      } 
      
    }
    this.SaveCredentials = () => { 
      if (this.username && this.username.length > 0 && this.password && this.password.length > 0 ) {
        localStorage.user = encrypt(clean(this.username));
        localStorage.password = encrypt(clean(this.password));
      }
    }
    this.DeleteCredentials = () => {  
      try {
        localStorage.removeItem("user"); 
        localStorage.removeItem("password"); 
      }catch(e){}
    }
    this.RestoreOnStart = () => {
    
       if (localStorage.getItem("user") !== null)
       {
          if (localStorage.user.length > 0) { 
              this.username = clean(decrypt(localStorage.user));
              if (this.username && this.username.length > 0) {
                $(`${elem} input[type="text"]`).val(this.username);
                $(`${elem} input[type="checkbox"]`).prop('checked', true);
              }
              if (localStorage.getItem("password") !== null)
              {   
                 if (localStorage.password.length > 0) { 
                      this.password = clean(decrypt(localStorage.password));
                      if (this.password && this.password.length > 0 ) {
                        $(`${elem} input[type="password"]`).val(this.password);
                      }
                 }
                    
              }   
          }
       }
    }
   this.RestoreOnStart();


}

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAutoPadding(true);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function clean(str) {
    str = str.toString();
    return str.replace(/<\/?[^>]+>/gi, '').replace(/\.[^/.]+$/, "").replace(/\s/g, "");
}

const userAccount = new credentials(".box.login");