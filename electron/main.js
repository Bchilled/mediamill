const{app,BrowserWindow,ipcMain}=require('electron');
const path=require('path');
const isDev=!app.isPackaged;
let win;

function createWindow(){
  win=new BrowserWindow({
    width:1440,height:900,minWidth:1100,minHeight:700,
    frame:false,transparent:true,backgroundColor:'#00000000',
    roundedCorners:true,titleBarStyle:'hidden',
    webPreferences:{preload:path.join(__dirname,'preload.js'),nodeIntegration:false,contextIsolation:true},
    show:false,
  });
  isDev?win.loadURL('http://localhost:5173'):win.loadFile(path.join(__dirname,'../dist/index.html'));
  win.once('ready-to-show',()=>win.show());
}

app.whenReady().then(async()=>{
  // Run startup recovery before window opens
  await require('./startup')();

  createWindow();
  require('./ipc/window')(ipcMain,win);
  require('./ipc/db')(ipcMain);
  require('./ipc/channels')(ipcMain);
  require('./ipc/pipeline')(ipcMain);
  require('./ipc/agents')(ipcMain);
  require('./ipc/scheduler')(ipcMain);
  require('./ipc/settings')(ipcMain);
  require('./ipc/ideas')(ipcMain);
});

app.on('window-all-closed',()=>app.quit());
