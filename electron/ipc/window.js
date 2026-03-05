module.exports=(ipcMain,win)=>{
  ipcMain.handle('window:minimize',()=>win.minimize());
  ipcMain.handle('window:maximize',()=>win.isMaximized()?win.unmaximize():win.maximize());
  ipcMain.handle('window:close',()=>win.close());
};


// Shell handler — opens URLs in system browser, not Electron
const{shell:electronShell}=require('electron');
// registered separately since window.js receives ipcMain
