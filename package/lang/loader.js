const fs = require('fs');
var path = require('path');
const util = require('util');
const glob = require(path.resolve("./package/node_modules/glob"));

var l10n = {
  folder : "./package/lang/l10n",
  available: [],
  lang : null,
  onStart : async function(){
  
    let lang = localStorage.userLang || navigator.language || navigator.userLanguage || "en";

    try {

      let files = await util.promisify(glob)("*.json", { cwd: path.resolve(this.folder), nodir: true, absolute: false });
          
      for (file of files) {
        let result = file.replace(".json","").toLowerCase();
        this.available.push(result);
      }      
      
      lang = lang.slice(0,2);     
      
      if (!this.available.some( l10n => lang === l10n)) {
        lang = "en";
      }

    }catch(e) {
      lang = "en";
    }
    
    this.load(lang);

  },
  load : async function(lang){

    try {
      
      lang = lang.toLowerCase();
    
      if (this.available.some( l10n => lang === l10n)) {
        var template = JSON.parse(await util.promisify(fs.readFile)(path.join(this.folder,lang+".json"), {encoding: "utf8"}));
        localStorage.userLang = this.lang = lang;  
        
      } else {
        throw "unavailable lang";
      }
    } catch(e) {
      throw e;
    }
    
   var self = this; 
    
   (function($, window, document) {
      $(function() {
             
            let selector = $("#settings .option li:nth-child(2) select");
            selector.empty(); 
            for (language of self.available) {
            
              if (self.lang === language) {
                selector.append(`<option value="${language}" selected></option>`);
              }else {
                selector.append(`<option value="${language}"></option>`); 
              }
            }
            
            selector = $("#menu ul:not(.social)");
            selector.find("li:nth-child(1) a").text(self.clean(template.menu.website));
            selector.find("li:nth-child(2) a").text(self.clean(template.menu.shop));
            selector.find("li:nth-child(3) a").text(self.clean(template.menu.forum));
            selector = $("#home .upper .stats");
            selector.find(".steam span:first-child").text(self.clean(template.stats.steam));
            selector.find(".server span:first-child").text(self.clean(template.stats.login)); 
            selector.find(".steam .playerInGame").text(self.clean(template.stats.wait));
            selector.find(".server .wait").text(self.clean(template.stats.wait));
            selector.find(".server .online").text(self.clean(template.stats.online));
            selector.find(".server .offline").text(self.clean(template.stats.offline));
            selector.find(".server .error").text(self.clean(template.stats.error));
            selector = $("#home .middle");
            selector.find(".box .title").text(self.clean(template.announce));
            selector.find(".frame .bottom .status .loading .message").text(self.clean(template.status.checking));
            selector.find(".frame .bottom .status .loading .takingTooLong").text(self.clean(template.status.tooLong));
            selector = $("#home .middle .frame .bottom .loadingBar");
            selector.find(".title .action .init").text(self.clean(template.loadingBar.title.init));
            selector.find(".title .action .dl").text(self.clean(template.loadingBar.title.dl));
            selector.find(".title .action .patch").text(self.clean(template.loadingBar.title.patch));
            selector.find(".title .action .end").text(self.clean(template.loadingBar.title.end));
            selector.find(".message .action .init").text(self.clean(template.loadingBar.message.init));
            selector.find(".message .action .dl span:first-child").text(self.clean(template.loadingBar.message.dl));
            selector.find(".message .action .patch").text(self.clean(template.loadingBar.message.patch));
            selector.find(".message .action .end").text(self.clean(template.loadingBar.message.end));           
            selector = $("#home .middle .login");
            selector.find("h1").text(self.clean(template.login.title));
            selector.find("form input[type='text']").attr("placeholder",self.clean(template.login.username));
            selector.find("form input[type='password']").attr("placeholder",self.clean(template.login.password));
            selector.find("form .option label").text(self.clean(template.login.remember));
            selector.find("p span").text(self.clean(template.login.newUser));
            selector.find("p a").text(self.clean(template.login.signup));
            $("#btn-launch .play").text(self.clean(template.button.play));
            $("#btn-launch .update").text(self.clean(template.button.update));
            selector = $("#settings .option");
            selector.find("li:first-child").text(self.clean(template.settings.title));
            selector.find("li:nth-child(2) .left").text(self.clean(template.settings.lang.name));
            selector.find("li:nth-child(2) .right select option[value='en']").text(self.clean(template.settings.lang.en));
            selector.find("li:nth-child(2) .right select option[value='fr']").text(self.clean(template.settings.lang.fr));
            selector.find("li:nth-child(2) .right select option[value='de']").text(self.clean(template.settings.lang.de));
            selector.find("li:nth-child(3) .left").text(self.clean(template.settings.game_lang.name));
            selector.find("li:nth-child(3) .right select option[value='eng']").text(self.clean(template.settings.game_lang.eng));
            selector.find("li:nth-child(3) .right select option[value='fra']").text(self.clean(template.settings.game_lang.fra));
            selector.find("li:nth-child(3) .right select option[value='deu']").text(self.clean(template.settings.game_lang.deu));
            selector.find("li:nth-child(3) .right select option[value='esn']").text(self.clean(template.settings.game_lang.esn));
            selector.find("li:nth-child(3) .right select option[value='ita']").text(self.clean(template.settings.game_lang.ita));
            selector.find("li:nth-child(3) .right select option[value='plk']").text(self.clean(template.settings.game_lang.plk));
            selector.find("li:nth-child(4) .left").text(self.clean(template.settings.voicePack.name));
            selector.find("li:nth-child(4) .right select option[value='true']").text(self.clean(template.settings.voicePack["true"]));
            selector.find("li:nth-child(4) .right select option[value='false']").text(self.clean(template.settings.voicePack["false"]));
            selector.find("li:nth-child(5) .left").text(self.clean(template.settings.run64.name));
            selector.find("li:nth-child(5) .right select option[value='true']").text(self.clean(template.settings.run64["true"]));
            selector.find("li:nth-child(5) .right select option[value='false']").text(self.clean(template.settings.run64["false"]));
            selector.find("li:nth-child(6) .left").text(self.clean(template.settings.fastStart));
            selector.find("li:nth-child(6) .right select option[value='true']").text(self.clean(template.settings.misc.enabled["true"]));
            selector.find("li:nth-child(6) .right select option[value='false']").text(self.clean(template.settings.misc.enabled["false"]));
            selector.find("li:nth-child(7) .left").text(self.clean(template.settings.igshop));
            selector.find("li:nth-child(7) .right select option[value='true']").text(self.clean(template.settings.misc.show["true"]));
            selector.find("li:nth-child(7) .right select option[value='false']").text(self.clean(template.settings.misc.show["false"]));
            selector.find("li:nth-child(8) .left").text(self.clean(template.settings.igads));
            selector.find("li:nth-child(8) .right select option[value='true']").text(self.clean(template.settings.misc.show["true"]));
            selector.find("li:nth-child(8) .right select option[value='false']").text(self.clean(template.settings.misc.show["false"]));          
            selector.find("li:nth-child(9) .left").text(self.clean(template.settings.forcewin7));
            selector.find("li:nth-child(9) .right select option[value='true']").text(self.clean(template.settings.misc.enabled["true"]));
            selector.find("li:nth-child(9) .right select option[value='false']").text(self.clean(template.settings.misc.enabled["false"]));
            $("#btn-settings-cancel").text(self.clean(template.button.cancel));
            $("#btn-settings-save").text(self.clean(template.button.save));         
            $("#settings .bonus li:first-child").text(self.clean(template.settings.bonus.title));
            $("#settings .bonus li:nth-child(2) .left").text(self.clean(template.settings.bonus.critfont));
            $("#btn-criticalFont .install").text(self.clean(template.settings.misc.installed["true"]));
            $("#btn-criticalFont .remove").text(self.clean(template.settings.misc.installed["false"]));
            selector = $("#settings .advance");
            selector.find("li:first-child").text(self.clean(template.settings.advance.title));
            selector.find("li:nth-child(2) .left").text(self.clean(template.settings.advance.dir));
            selector.find("li:nth-child(2) .right label span:not(.uac)").text(self.clean(template.button.change));
            selector.find("li:nth-child(3) .left").text(self.clean(template.settings.advance.dl_dir));
            selector.find("li:nth-child(3) .right label").text(self.clean(template.button.change));
            selector.find("li:nth-child(4) .left").text(self.clean(template.settings.advance.editor));
            $("#btn-editor").text(self.clean(template.button.open));
            $("#btn-editor-cancel").text(self.clean(template.button.cancel));
            $("#btn-editor-save").text(self.clean(template.button.save));   
            selector = $("#settings-systemcfg-editor .editor .buttons .disclaimer");
            selector.find("span:eq(0)").text(self.clean(template.settings.advance.disclaimer.ln1));
            selector.find("span:eq(1)").text(self.clean(template.settings.advance.disclaimer.ln2));
            $("#modal .header span").text(self.clean(template.error.title));
            selector = $("#modal .content .error0");
            selector.find(".ln:eq(0)").text(self.clean(template.error["0"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["0"].ln2));
            selector.find(".ln:eq(2)").text(self.clean(template.error["0"].ln3));
            selector = $("#modal .content .error1");
            selector.find(".ln:eq(0)").text(self.clean(template.error["1"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["1"].ln2));
            selector.find(".ln:eq(2)").text(self.clean(template.error["1"].ln3));
            selector = $("#modal .content .error2");
            selector.find(".ln:eq(0)").text(self.clean(template.error["2"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["2"].ln2));
            selector.find(".ln:eq(2)").text(self.clean(template.error["2"].ln3));
            selector = $("#modal .content .error3");
            selector.find(".ln:eq(0)").text(self.clean(template.error["3"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["3"].ln2));
            selector.find(".ln:eq(2)").text(self.clean(template.error["3"].ln3));
            selector = $("#modal .content .error4");
            selector.find(".ln:eq(0)").text(self.clean(template.error["4"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["4"].ln2));
            selector.find(".ln:eq(2)").text(self.clean(template.error["4"].ln3));
            selector = $("#modal .content .error5");
            selector.find(".ln:eq(0)").text(self.clean(template.error["5"].ln1));
            selector.find(".ln:eq(1)").text(self.clean(template.error["5"].ln2));
            $("#error-dialog-exit").text(self.clean(template.button.acknowledge));
            
      });
   }(window.jQuery, window, document));  

      
  }, 
  clean: (str) => {
    str = str.toString();
    return str.replace(/<\/?[^>]+>/gi, '').replace(/\.[^/.]+$/, "");  
  }
  
}

l10n.onStart();