const{getDb,run,all}=require('./db');
const DEFAULTS=[
  {task_type:'ingest',agent:'gemini',model:'gemini-2.5-flash',enabled:1,fallback_agent:'claude',fallback_model:'claude-sonnet-4-6'},
  {task_type:'script',agent:'claude',model:'claude-sonnet-4-6',enabled:1,fallback_agent:'gemini',fallback_model:'gemini-2.5-pro'},
  {task_type:'assets',agent:'gemini',model:'gemini-2.5-flash',enabled:1,fallback_agent:'claude',fallback_model:'claude-sonnet-4-6'},
  {task_type:'thumbnail',agent:'claude',model:'claude-sonnet-4-6',enabled:1,fallback_agent:'gemini',fallback_model:'gemini-2.5-flash'},
  {task_type:'seo',agent:'claude',model:'claude-sonnet-4-6',enabled:1,fallback_agent:'gemini',fallback_model:'gemini-2.5-flash'},
  {task_type:'analytics',agent:'claude',model:'claude-opus-4-6',enabled:1,fallback_agent:'gemini',fallback_model:'gemini-2.5-pro'},
  {task_type:'validation',agent:'gemini',model:'gemini-2.5-flash',enabled:1,fallback_agent:'claude',fallback_model:'claude-sonnet-4-6'},
  {task_type:'scheduling',agent:'gemini',model:'gemini-2.5-flash',enabled:1,fallback_agent:'claude',fallback_model:'claude-sonnet-4-6'},
];
module.exports=(ipcMain)=>{
  ipcMain.handle('agents:getConfig',async()=>{
    await getDb();const rows=all('SELECT * FROM agent_config');
    if(!rows.length){DEFAULTS.forEach(c=>run('INSERT OR REPLACE INTO agent_config(task_type,agent,model,enabled,fallback_agent,fallback_model)VALUES(?,?,?,?,?,?)',[c.task_type,c.agent,c.model,c.enabled,c.fallback_agent,c.fallback_model]));return DEFAULTS;}
    return rows;
  });
  ipcMain.handle('agents:updateConfig',async(_,config)=>{
    await getDb();
    config.forEach(c=>run('INSERT OR REPLACE INTO agent_config(task_type,agent,model,enabled,fallback_agent,fallback_model)VALUES(?,?,?,?,?,?)',[c.task_type,c.agent,c.model,c.enabled?1:0,c.fallback_agent,c.fallback_model]));
    return{ok:true};
  });
};