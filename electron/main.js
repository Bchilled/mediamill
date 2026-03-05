const{app,BrowserWindow,ipcMain}=require('electron');
const path=require('path');
const isDev=!app.isPackaged;
let win;

function createWindow(){
  win=new BrowserWindow({
    width:1440,height:900,minWidth:1100,minHeight:700,
    frame:false,transparent:true,backgroundColor:'#00000000',
    roundedCorners:true,titleBarStyle:'hidden',
    webPreferences:{
      preload:path.join(__dirname,'preload.js'),
      nodeIntegration:false,contextIsolation:true,
    },
    show:false,
  });
  isDev?win.loadURL('http://localhost:5173'):win.loadFile(path.join(__dirname,'../dist/index.html'));
  win.once('ready-to-show',()=>{
    win.show();
    if(!isDev)checkForUpdates();
  });
  if(isDev)win.webContents.openDevTools({mode:'detach'});
}

function checkForUpdates(){
  try{
    const{autoUpdater}=require('electron-updater');
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available',()=>win?.webContents.send('update-available'));
    autoUpdater.on('update-downloaded',()=>win?.webContents.send('update-downloaded'));
  }catch(e){console.log('[Updater] Not available in dev mode');}
}

async function ensureFFmpeg(){
  if(isDev)return;
  try{
    const fs=require('fs');
    const ffmpegDest=path.join(app.getPath('userData'),'ffmpeg.exe');
    if(!fs.existsSync(ffmpegDest)){
      const bundled=path.join(process.resourcesPath,'ffmpeg.exe');
      if(fs.existsSync(bundled)){fs.copyFileSync(bundled,ffmpegDest);console.log('[FFmpeg] Extracted');}
    }
    process.env.MEDIAMILL_FFMPEG=ffmpegDest;
  }catch(e){console.error('[FFmpeg] Extract failed',e.message);}
}

app.whenReady().then(async()=>{
  await ensureFFmpeg();
  await require('./startup')();

  // ── Register ALL IPC handlers BEFORE creating the window ──────────
  // This prevents "No handler registered" errors when renderer loads fast

  // Shell — first, with dedup guard
  const{shell}=require('electron');
  ipcMain.removeHandler('shell:openExternal');
  ipcMain.handle('shell:openExternal',async(_,url)=>{await shell.openExternal(url);return{ok:true};});

  // All IPC modules — window.js needs win so we pass a getter
  require('./ipc/db')(ipcMain);
  require('./ipc/channels')(ipcMain);
  require('./ipc/pipeline')(ipcMain);
  require('./ipc/ideas')(ipcMain);
  require('./ipc/youtube')(ipcMain);
  require('./ipc/agents')(ipcMain);
  require('./ipc/scheduler')(ipcMain);
  require('./ipc/settings')(ipcMain);

  // App update handler
  ipcMain.handle('app:installUpdate',()=>{
    try{require('electron-updater').autoUpdater.quitAndInstall();}catch(e){}
  });

  // Create window AFTER all handlers are registered
  createWindow();

  // Window IPC needs win reference — register after window created
  require('./ipc/window')(ipcMain,win);
});

app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
