const{getDb,run,all,get}=require('./db');
const{v4:uuid}=require('uuid');
const{shell}=require('electron');

async function getSettings(){
  await getDb();
  const rows=all('SELECT key,value FROM settings');
  const s={apiKeys:{}};
  rows.forEach(r=>{try{const v=JSON.parse(r.value);if(r.key.startsWith('apiKey.')){s.apiKeys[r.key.replace('apiKey.','')]=v;}else{s[r.key]=v;}}catch(e){s[r.key]=r.value;}});
  return s;
}

function saveTokens(channelId,tokens){
  run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',['yt_tokens.'+channelId,JSON.stringify(tokens)]);
}

function loadTokens(channelId){
  const row=get('SELECT value FROM settings WHERE key=?',['yt_tokens.'+channelId]);
  return row?JSON.parse(row.value):null;
}

async function getValidToken(channelId,settings){
  const yt=require('../workers/youtubeUploader');
  let tokens=loadTokens(channelId);
  if(!tokens)throw new Error('YouTube not connected for this channel. Go to Channels → Connect YouTube.');
  const clientId=settings.apiKeys?.youtube_client_id;
  const clientSecret=settings.apiKeys?.youtube_client_secret;
  if(!clientId||!clientSecret)throw new Error('YouTube OAuth credentials not configured. Add client_id and client_secret in Settings → Publishing.');
  // Check if expired (expires_in seconds from issued_at)
  const issuedAt=tokens.issued_at||0;
  const expiresIn=tokens.expires_in||3600;
  if(Date.now()>issuedAt+(expiresIn-60)*1000){
    // Refresh
    const refreshed=await yt.refreshToken(tokens.refresh_token,clientId,clientSecret);
    tokens={...tokens,...refreshed,issued_at:Date.now()};
    saveTokens(channelId,tokens);
  }
  return tokens.access_token;
}

module.exports=(ipcMain)=>{
  // Start OAuth flow for a channel
  ipcMain.handle('youtube:connect',async(_,channelId)=>{
    await getDb();
    const settings=await getSettings();
    const clientId=settings.apiKeys?.youtube_client_id;
    if(!clientId)throw new Error('Add YouTube OAuth Client ID in Settings → Publishing first.');
    const yt=require('../workers/youtubeUploader');
    const authUrl=await yt.getAuthUrl(clientId);
    // Open browser + wait for redirect
    const codePromise=yt.waitForOAuthCode();
    shell.openExternal(authUrl);
    const code=await codePromise;
    const clientSecret=settings.apiKeys?.youtube_client_secret;
    const tokens=await yt.exchangeCode(code,clientId,clientSecret);
    tokens.issued_at=Date.now();
    saveTokens(channelId,tokens);
    return{ok:true};
  });

  ipcMain.handle('youtube:status',async(_,channelId)=>{
    await getDb();
    const tokens=loadTokens(channelId);
    return{connected:!!tokens,hasRefreshToken:!!(tokens?.refresh_token)};
  });

  ipcMain.handle('youtube:upload',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    if(!video)throw new Error('Video not found');
    if(!video.video_path)throw new Error('No composed video file. Run compose stage first.');
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    const settings=await getSettings();
    const accessToken=await getValidToken(video.channel_id,settings);
    const yt=require('../workers/youtubeUploader');
    const script=video.script?JSON.parse(video.script):{};
    // Upload with EN metadata (FR/ES can be added as localizations after)
    const result=await yt.uploadVideo(video.video_path,{
      title:(script.title_en||video.title||'Untitled Video').slice(0,100),
      description:script.description_en||video.description||'',
      tags:[...(script.tags_en||[]),...(script.tags_fr||[])].slice(0,500),
      language:'en',privacy:'private',// Safe default
    },accessToken);
    run("UPDATE videos SET youtube_id=?,status='published',published_at=datetime('now'),updated_at=datetime('now') WHERE id=?",[result.id,videoId]);
    // Log
    const id=uuid();
    run(`INSERT INTO tasks(id,type,video_id,channel_id,status,output_json,created_at,updated_at)VALUES(?,?,?,?,?,?,datetime('now'),datetime('now'))`,
      [id,'publish',videoId,video.channel_id,'completed',JSON.stringify({youtubeId:result.id,url:'https://youtube.com/watch?v='+result.id})]);
    return{ok:true,youtubeId:result.id,url:'https://youtube.com/watch?v='+result.id};
  });

  ipcMain.handle('youtube:analytics',async(_,channelId,days=30)=>{
    await getDb();
    const settings=await getSettings();
    const accessToken=await getValidToken(channelId,settings);
    const yt=require('../workers/youtubeUploader');
    // Get all published videos for this channel
    const videos=all("SELECT youtube_id FROM videos WHERE channel_id=? AND youtube_id IS NOT NULL",[channelId]);
    const[analytics,videoStats]=await Promise.all([
      yt.getAnalytics(channelId,accessToken),
      videos.length>0?yt.getVideoStats(videos.map(v=>v.youtube_id),accessToken):Promise.resolve({}),
    ]);
    return{analytics,videoStats,fetchedAt:new Date().toISOString()};
  });

  ipcMain.handle('youtube:disconnect',async(_,channelId)=>{
    await getDb();
    run('DELETE FROM settings WHERE key=?',['yt_tokens.'+channelId]);
    return{ok:true};
  });
};
