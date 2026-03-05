// Runs on app start — recovers from crashes, resumes stalled videos
const{getDb,run,all}=require('./ipc/db');

async function startup(){
  try{
    await getDb();

    // Reset any videos stuck mid-pipeline (app crashed)
    const stalled=all("SELECT * FROM videos WHERE status='processing'");
    for(const v of stalled){
      console.log('[Startup] Resetting stalled video:',v.id,v.stage);
      // Roll back one stage so it can be retried
      const prevStage={script:'ingest',assets:'script',voice:'assets',compose:'voice'}[v.stage]||'ingest';
      run("UPDATE videos SET status='pending',stage=?,updated_at=datetime('now') WHERE id=?",[prevStage,v.id]);
    }
    if(stalled.length>0)console.log(`[Startup] Reset ${stalled.length} stalled videos`);

    console.log('[Startup] DB ready');
  }catch(e){
    console.error('[Startup] Error:',e.message);
  }
}

module.exports=startup;
