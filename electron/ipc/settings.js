const Store=require('electron-store');
const store=new Store();
const os=require('os');
const DEFAULTS={mode:'simple',dailyBudget:5,weeklyBudget:20,monthlyBudget:80,autoApproveGlobal:false,defaultPreset:'long',ffmpegPath:'ffmpeg',outputDir:require('path').join(os.homedir(),'Videos','FORGE'),apiKeys:{claude:'',gemini:'',openai:'',pexels:'',pixabay:'',youtube:''}};
module.exports=(ipcMain)=>{
  ipcMain.handle('settings:get',()=>({...DEFAULTS,...store.get('settings',{})}));
  ipcMain.handle('settings:update',(_,d)=>{store.set('settings',{...store.get('settings',{}),...d});return store.get('settings');});
  ipcMain.handle('system:stats',async()=>({gpu:{utilization:0},cpu:{utilization:0,cores:os.cpus().length},ram:{used:os.totalmem()-os.freemem(),total:os.totalmem()}}));
  ipcMain.handle('system:apiUsage',()=>{const{getDb}=require('./db');return getDb().prepare("SELECT * FROM api_usage WHERE date=?").all(new Date().toISOString().split('T')[0]);});
};