const win = nw.Window.get();

win.on('loaded', function() { 
    win.show();
    win.focus();
});

win.on('close', function() {
      this.hide(); 
      this.close(true);
});

win.on('minimize', function() {
});

win.on('restore', function() {
});

win.on('enter-fullscreen', function() {
      win.leaveFullscreen();
});

win.on('maximize', function() {
      win.unmaximize();
});

win.on('new-win-policy', function(frame, url, policy) {
      policy.ignore();
      nw.Shell.openExternal(url);
});

(function($, window, document) {
   $(function() {
   
    $("#win-close").click(function() { 
        win.close(); 
    });
           
    $("#win-minimize").click(function() { 
        win.minimize(); 
    });

   
   });
}(window.jQuery, window, document));