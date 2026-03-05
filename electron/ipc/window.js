const path=require('path');

module.exports=(ipcMain,win)=>{
  ipcMain.handle('window:minimize',()=>{
    const{getDb,get}=require('./db');
    try{
      const rows=require('./db').all('SELECT key,value FROM settings');
      const s={};rows.forEach(r=>{try{s[r.key]=JSON.parse(r.value);}catch(e){s[r.key]=r.value;}});
      if(s.minimizeToTray){win.hide();return;}
    }catch(e){}
    win.minimize();
  });
  ipcMain.handle('window:maximize',()=>win.isMaximized()?win.unmaximize():win.maximize());
  ipcMain.handle('window:close',()=>{
    try{
      const rows=require('./db').all('SELECT key,value FROM settings');
      const s={};rows.forEach(r=>{try{s[r.key]=JSON.parse(r.value);}catch(e){s[r.key]=r.value;}});
      if(s.minimizeToTray){win.hide();return;}
    }catch(e){}
    win.close();
  });
  ipcMain.handle('window:hide',()=>win.hide());
  ipcMain.handle('window:show',()=>{win.show();win.focus();});
  ipcMain.handle('window:isVisible',()=>win.isVisible());

  // System tray setup
  const{Tray,Menu,nativeImage,app}=require('electron');
  let tray=null;
  function ensureTray(){
    if(tray)return;
    try{
      // Use a blank 16x16 icon — works on all platforms
      const img=nativeImage.createEmpty();
      tray=new Tray(img);
      tray.setToolTip('MediaMill');
      tray.on('click',()=>{win.show();win.focus();});
      tray.setContextMenu(Menu.buildFromTemplate([
        {label:'Open MediaMill',click:()=>{win.show();win.focus();}},
        {type:'separator'},
        {label:'Quit',click:()=>{tray.destroy();app.quit();}},
      ]));
    }catch(e){console.warn('[Tray] Could not create tray:',e.message);}
  }

  ipcMain.handle('tray:enable',()=>ensureTray());
  ipcMain.handle('tray:disable',()=>{if(tray){tray.destroy();tray=null;}});

  // Login/startup
  ipcMain.handle('autostart:set',(_,enable)=>{
    try{
      app.setLoginItemSettings({openAtLogin:enable,openAsHidden:true});
      return{ok:true};
    }catch(e){return{ok:false,error:e.message};}
  });
  ipcMain.handle('autostart:get',()=>{
    try{return app.getLoginItemSettings().openAtLogin;}
    catch(e){return false;}
  });
};
