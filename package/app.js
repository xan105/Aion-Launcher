"use strict";

var path = require('path');
const aion = new (require(path.resolve("./package/aion.js")));
const tcpp = require(path.resolve("./package/node_modules/tcp-ping"));
const isElevated = require(path.resolve("./package/util/isElevated.js"));
const bonus = require(path.resolve("./package/util/jp_criticalFont.js"));

var app = {
  hasUpdate : false,
  onStart : function(){
  
            isElevated().then((elevated)=>{
                if (!elevated && aion.aionDir.includes("C:\\Program Files")) {
                  this.error(1);
                }
             })
             .catch(()=>{})
             
            $("footer").text(nw.App.manifest.version);
             
            let status = $(".status .loading");
            $("#win-settings").css("pointer-events","none");
            status.show();
            aion.hasUpdate().then((result)=>{ 
              this.hasUpdate = result;  
              let elem = $("#btn-launch");
              (result) ? elem.alterClass("blue","orange") : elem.alterClass("orange","blue");
            })
            .catch(()=>{
              this.error(2);
            })
            .finally(()=>{
              status.hide();
              $("#btns").show();
              $("#win-settings").css("pointer-events","initial");
            }); 
            
            let locale = l10n.lang || aion.options.Aion.language.slice(0,2) || "en";
            $("html").attr("lang",`${locale.toLowerCase()}`);
            
            $("#menu ul:not(.social) li:nth-child(1) a").attr("href",`https://${locale}.aion.gamege.com/website/`);
            $("#menu ul:not(.social) li:nth-child(2) a").attr("href",`https://${locale}.aion.gameforge.com/shop/`);
            $("#menu ul:not(.social) li:nth-child(3) a").attr("href",`https://board.${locale}.aion.gameforge.com/`);

            $("#gameforge-news").attr("src",`https:\/\/${locale}.aion.gameforge.com/website/game/slider`);
            
            $.ajax({ 
              url: `https://${locale}.aion.gameforge.com/website/game/announcement/`,
              dataType: 'html',
              ContentType: 'text/html',
              type: 'GET',
              cache: false,
              timeout: 5000,
              beforeSend: ()=>{},
              success: (data) => { $( ".content", "#home" ).html( data ) },
              error: ()=>{},
              complete: ()=>{}
            });

            $.ajax({ 
              url: "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=261430",
              dataType: 'json',
              ContentType: 'application/json',
              type: 'GET',
              cache: false,
              timeout: 5000,
              beforeSend: ()=>{},
              success: (data) => { $( ".upper .stats .steam .playerInGame", "#home" ).text(data.response.player_count.toLocaleString(undefined)) },
              error: ()=>{},
              complete: ()=>{}
            });

            tcpp.ping({ address: '79.110.83.80', port: 2106, attempts: 3, timeout: 2000}, (err, data)=>{
                
                let elem = $("#home .upper .stats .server .status");
                
                if (err) {
                  elem.attr('data-status', 'error');
                }else{
                  let available = data.min !== undefined; 
                  
                  if (available) {
                    elem.attr('data-status', 'online');
                  } else {
                    elem.attr('data-status', 'offline');
                  }
                }
            });   
      
  },
  clickEvent : function() {
  
              const self = this;

              $("#error-dialog-exit").click(function(){
                $(this).css("pointer-events","none");
                  if( $("#modal").attr("data-alert") === "true" ) {
                    $("#modal")[0].close();
                  } else {
                    $("#win-close").trigger( "click" );
                  }
                $(this).css("pointer-events","initial");
              });
                   
              $("#frame-reload").click(function(){
                $(this).css("pointer-events","none");
                  $('#gameforge-news').attr('src', $('#gameforge-news').attr('src'));
                $(this).css("pointer-events","initial");
              });

              $("#win-settings").click(function(){
                $(this).css("pointer-events","none");
                
                for (let option in aion.options.Aion) {
                    if ( $(`#option_${option} option[value="${aion.options.Aion[option]}"]`).length > 0 )
                    {
                        $(`#option_${option}`).val(aion.options.Aion[option].toString()).change();
                    }
                }
                
                bonus.isInstalled(aion.aionDir,aion.options.Aion.language)
                .then((installed)=>{
                  let elem = $("#btn-criticalFont");
                  (installed) ? elem.alterClass("blue","red") : elem.alterClass("red","blue"); 
                })
                .catch(()=>{});
                $("main").attr("data-view","settings");
                
                $(this).css("pointer-events","initial");
              });


              $("#btn-criticalFont").click(async function(){
                $(this).css("pointer-events","none");
                $(this).addClass("wait");
                
                try {
                  if ($(this).hasClass("red")) {
                    await bonus.remove(aion.aionDir,aion.options.Aion.language);
                    $("#btn-criticalFont").alterClass("red","blue"); 
                  } else {
                    await bonus.install(aion.aionDir,aion.options.Aion.language);
                    $("#btn-criticalFont").alterClass("blue","red");  
                  }
                }catch(e){
                  self.error(0,true);
                }

                $(this).removeClass("wait");
                $(this).css("pointer-events","initial");
              });



              $("#btn-settings-cancel").click(function(){
                $(this).css("pointer-events","none");
                  $("main").attr("data-view","main");
                $(this).css("pointer-events","initial");
              });

              $("#btn-settings-save").click(function(){
                $(this).css("pointer-events","none");
                
                $("#settings ul:not(.bonus) li:not(:first-child) .right").children("select.aion").each(function( index ) {
                
                      try {
                        if ($(this)[0].id !== "" && $(this).val() !== "") {
                          aion.options.Aion[$(this)[0].id.replace("option_","")] = ($(this).val() === "true") ? true : ($(this).val() === "false") ? false : $(this).val().toLowerCase();
                        }
                      }catch(e){}
                      
                });
                
                let locale = $("#settings .option li:nth-child(2) select").val() || "en";
                
                l10n.load(locale)
                .then(()=>{
                  return aion.writeOptionsToFile();
                })
                .then(()=>{
                  self.onStart();
                  $("main").attr("data-view","main");
                })
                .catch((e)=>{
                  self.error(0,true);
                })
                .finally(()=>{
                  $(this).css("pointer-events","initial");
                });
                
              });

              $("#btn-launch").click(async function(){
                $(this).css("pointer-events","none");
                
                if (self.hasUpdate) {
                   $(".loadingBar").show();
                   $("#btns").hide();
                   $("#win-settings").css("pointer-events","none");
                   try {
                     await aion.update(false,self.progress.print);
                     $("#btn-launch").alterClass("orange","blue");
                   } catch(e) {
                      if (e === "!Network") { 
                        self.error(4,true);
                      } 
                      else {
                        self.error(2,true);
                     }
                     $(".loadingBar").hide();
                     $("#btns").show();
                     $("#win-settings").css("pointer-events","initial");
                     return;
                   }
                   $(".loadingBar").hide();
                   $("#btns").show();
                   $("#win-settings").css("pointer-events","initial");
                }

                try {
                  await aion.run(userAccount.GetCredentials());
                  $("#win-close").trigger( "click" );
                }catch(e){
                  self.error(3);
                }
                $(this).css("pointer-events","initial");

              });

              $("#btn-repair").click(async function(){
                $(this).css("pointer-events","none");
                
                   $(".loadingBar").show();
                   $("#btns").hide();
                   $("#win-settings").css("pointer-events","none");
                   try {
                      await aion.update(true,self.progress.print);
                   } catch(e) {
                      if (e === "!Network") { 
                          self.error(4,true);
                        } 
                        else {
                          self.error(2,true);
                       }
                   }
                   $(".loadingBar").hide();
                   $("#btns").show();
                   $("#win-settings").css("pointer-events","initial");
                 
                $(this).css("pointer-events","initial");
              });

              $(".next","#settings").click(function(){
                   let sel = $(this).parent(".right").find("select")[0];
                   let i = sel.selectedIndex;
                   sel.options[++i%sel.options.length].selected = true;
              });

              $(".previous","#settings").click(function(){
                   let sel = $(this).parent(".right").find("select")[0];
                   let i = sel.selectedIndex;
                   if (i <= 0) { i = sel.options.length }
                   sel.options[--i%sel.options.length].selected = true;
              });  
        
       
  
  },
  progress : {
    load : $(".loadingBar"),
    meter : $(".loadingBar .meter"),
    totalSize: $(".loadingBar .message .action .dl .totalSize"),
    number : function (x, isSpeed = true ){
    
        const available_metric = {
          speed : ["kB/s","MB/s","GB/s"],
          size : ["Ko","Mo","Go"]
        };    
                          
        if (isSpeed) {
          if (!x && x!= 0) return null;
        } else {
          if (!x) return null;
        }
        
        let metric = (isSpeed) ? available_metric.speed : available_metric.size;
        
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
        } else if (!isSpeed) {
          x = Math.floor(x);
        }
        
        result.number = x.toLocaleString(undefined, {maximumFractionDigits: 1});

        return result;
      },
    print : function(data={}){
      
      let current = {
        step: data.step || 0,
        progress: data.progress || 0,
        speed: app.progress.number(data.speed) || null,
        totalSize : app.progress.number(data.totalSize,false) || null
      };
      
      app.progress.load.attr('data-step', current.step);
      if (current.progress >= 0 && current.progress <= 100) { 
        app.progress.load.attr('data-percent', current.progress);  
        app.progress.meter.css('width',`${current.progress}%`);
      }
      if (current.speed) { 
        app.progress.load.attr('data-speed', `${current.speed.number} ${current.speed.metric}`);
      } else {
        app.progress.load.attr('data-speed', "null");
      }
      if (current.totalSize !== null) {
          app.progress.totalSize.text(`${current.totalSize.number} ${current.totalSize.metric}`);
      } else {
          app.progress.totalSize.text("");
      }
      
    }
  },
  error: function(errorIndex, alert = false){

    let elem = $("#modal");
    try {
      elem.attr('data-error', parseInt(errorIndex)); 
      (alert === true) ? elem.attr('data-alert', "true") : elem.attr('data-alert', "false");
      elem[0].showModal();
    }catch(e){
      elem.attr('data-error', 0); 
      elem[0].showModal();
    } 
  }
};


(function($, window, document) {
  $(function() {
         app.onStart();
         app.clickEvent();
  });
}(window.jQuery, window, document));         