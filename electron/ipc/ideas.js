const{getDb,run,all,get,saveDb}=require('./db');
const{v4:uuid}=require('uuid');

module.exports=(ipcMain)=>{
  ipcMain.handle('ideas:getAll',async(_,channelId,filters={})=>{
    await getDb();
    let sql='SELECT * FROM ideas WHERE channel_id=?';
    const params=[channelId];
    if(filters.status){sql+=' AND status=?';params.push(filters.status);}
    return all(sql+' ORDER BY priority DESC, created_at DESC',params);
  });

  ipcMain.handle('ideas:create',async(_,d)=>{
    await getDb();
    const id=uuid();
    run(`INSERT INTO ideas(id,channel_id,title,description,sources,tags,priority,status,target_length,origin)VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [id,d.channel_id,d.title,d.description||'',JSON.stringify(d.sources||[]),JSON.stringify(d.tags||[]),d.priority||0,'idea',d.target_length||null,d.origin||'manual']);
    return get('SELECT * FROM ideas WHERE id=?',[id]);
  });

  ipcMain.handle('ideas:update',async(_,id,d)=>{
    await getDb();
    const fields=Object.keys(d).map(k=>k+'=?').join(',');
    run(`UPDATE ideas SET ${fields},updated_at=datetime('now') WHERE id=?`,[...Object.values(d),id]);
    return get('SELECT * FROM ideas WHERE id=?',[id]);
  });

  ipcMain.handle('ideas:delete',async(_,id)=>{
    await getDb();run('DELETE FROM ideas WHERE id=?',[id]);return{ok:true};
  });

  ipcMain.handle('ideas:approve',async(_,ideaId)=>{
    await getDb();
    const idea=get('SELECT * FROM ideas WHERE id=?',[ideaId]);
    if(!idea)throw new Error('Idea not found');
    const ch=get('SELECT * FROM channels WHERE id=?',[idea.channel_id]);
    const videoId=uuid();
    run(`INSERT INTO videos(id,channel_id,title,description,preset,target_length,status,stage,idea_id)VALUES(?,?,?,?,?,?,'pending','ingest',?)`,
      [videoId,idea.channel_id,idea.title,idea.description,ch?.preset||'long',idea.target_length,ideaId]);
    run(`UPDATE ideas SET status='approved',updated_at=datetime('now') WHERE id=?`,[ideaId]);
    if(ch?.auto_approve){run(`UPDATE videos SET status='processing',updated_at=datetime('now') WHERE id=?`,[videoId]);}
    return{ok:true,videoId};
  });

  ipcMain.handle('ideas:reject',async(_,id)=>{
    await getDb();run(`UPDATE ideas SET status='rejected',updated_at=datetime('now') WHERE id=?`,[id]);return{ok:true};
  });

  ipcMain.handle('ideas:scan',async(_,channelId)=>{
    await getDb();
    const ch=get('SELECT * FROM channels WHERE id=?',[channelId]);
    if(!ch)throw new Error('Channel not found');
    // Run scanner async — don't block UI
    setImmediate(async()=>{
      try{
        const{scan}=require('../workers/ideaScanner');
        const ideas=await scan(ch);
        for(const idea of ideas){
          // Skip dupes by title
          const existing=get('SELECT id FROM ideas WHERE channel_id=? AND title=?',[channelId,idea.title]);
          if(existing)continue;
          const id=uuid();
          run(`INSERT INTO ideas(id,channel_id,title,description,sources,tags,priority,status,target_length,origin)VALUES(?,?,?,?,?,?,?,?,?,?)`,
            [id,channelId,idea.title,idea.description||'',JSON.stringify(idea.sources||[]),JSON.stringify(idea.tags||[]),0,'idea',idea.target_length||null,idea.origin||'ai_scan']);
        }
      }catch(e){console.error('[IdeaScanner]',e.message);}
    });
    return{ok:true};
  });
};
