function audio(id,volume) {
  this.elem = document.getElementById(id);
  this.elem$ = $('#'+id); 
  this.volume = volume;
  this.pause = function() { this.elem.pause(); }
  this.play = function() { this.elem.play(); }
  this.toggleMute = function() 
  { 
    this.elem$.prop('muted', !this.elem$.prop('muted'));
    this.UpdateIcon(); 
  }
  this.currentState = function() { return this.elem$.prop('muted'); }
  this.MuteOn = function() { this.elem$.prop('muted', true); } 
  this.MuteOff = function() { this.elem$.prop('muted', false); }
  this.SetVolume = function() { this.elem.volume = volume; }
  this.SaveOnExit = function() { localStorage.mute = this.currentState() }
  this.RestoreOnStart = function()
  {
     if (localStorage.getItem("mute") === null){}
     else
     {
        if (localStorage.mute == "true") { 
          this.MuteOn();
          this.UpdateIcon();
        }
     } 
  }
  this.isPlaying = function()
  {
        return (this.elem.duration > 0 && !this.elem.paused && !this.elem$.prop('muted')) ? true : false;
  }
  this.UpdateIcon = function()
  {  
     var that = this; 
      
     (function($, window, document) {
         $(function() {
            
           if(that.isPlaying()) { 
              $("#win-sound").attr('data-state', 'on');
            }
            else { 
               $("#win-sound").attr('data-state', 'off');
            }

         });
      }(window.jQuery, window, document)); 
  }
  this.EventBindings = function()
  {
      var win = nw.Window.get();
      var state = null;
      var that = this;
      
      win.on('minimize', function() {
       
                        state = that.currentState();
       
                        if (!state){
                            that.toggleMute();
                            that.UpdateIcon();
                        }      
      });

      win.on('restore', function() {
                            if (!state){
                              that.toggleMute();
                              that.UpdateIcon();
                            }      
      }); 
      
      
      (function($, window, document) {
         $(function() {
            
            $("#win-sound").click(function() { 
              that.toggleMute();
              that.SaveOnExit();   
            });

         });
      }(window.jQuery, window, document));

  }
  this.SetVolume();
  this.RestoreOnStart();
  this.EventBindings();
}

const bgm = new audio('bgm',0.3);