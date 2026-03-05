const https=require('https');
const http=require('http');
const fs=require('fs');
const path=require('path');
const{shell,BrowserWindow}=require('electron');
const url=require('url');

// OAuth config — user must create a Google Cloud project and OAuth2 credentials
// Type: Desktop App. Download the client_secret JSON and paste client_id/secret in settings.
const SCOPES='https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';
const REDIRECT_PORT=42813;
const REDIRECT_URI=`http://localhost:${REDIRECT_PORT}`;

function post(hostname,path,data,headers={}){
  return new Promise((resolve,reject)=>{
    const body=typeof data==='string'?data:new URLSearchParams(data).toString();
    const req=https.request({hostname,path,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),...headers}},res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{resolve(JSON.parse(d));}catch(e){resolve(d);}});
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

function getJson(urlStr,headers={}){
  return new Promise((resolve,reject)=>{
    const u=new url.URL(urlStr);
    const lib=u.protocol==='https:'?https:http;
    lib.get({hostname:u.hostname,path:u.pathname+u.search,headers},res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{resolve(JSON.parse(d));}catch(e){resolve({});} });
    }).on('error',reject);
  });
}

// Start local server to catch OAuth redirect
function waitForOAuthCode(){
  return new Promise((resolve,reject)=>{
    const server=http.createServer((req,res)=>{
      const u=new url.URL(req.url,'http://localhost');
      const code=u.searchParams.get('code');
      const error=u.searchParams.get('error');
      res.writeHead(200,{'Content-Type':'text/html'});
      if(code){
        res.end('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2 style="color:#4CAF50">✓ Authorized!</h2><p>You can close this window and return to MediaMill.</p></body></html>');
        server.close();
        resolve(code);
      }else{
        res.end('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2 style="color:#f44336">✗ Authorization failed</h2><p>'+error+'</p></body></html>');
        server.close();
        reject(new Error('OAuth denied: '+error));
      }
    });
    server.listen(REDIRECT_PORT,()=>console.log('[YouTube OAuth] Listening on',REDIRECT_PORT));
    server.on('error',reject);
    setTimeout(()=>{server.close();reject(new Error('OAuth timeout'));},120000);
  });
}

async function getAuthUrl(clientId){
  const params=new URLSearchParams({
    client_id:clientId,redirect_uri:REDIRECT_URI,
    response_type:'code',scope:SCOPES,
    access_type:'offline',prompt:'consent',
  });
  return`https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCode(code,clientId,clientSecret){
  const result=await post('oauth2.googleapis.com','/token',{
    code,client_id:clientId,client_secret:clientSecret,
    redirect_uri:REDIRECT_URI,grant_type:'authorization_code',
  });
  if(result.error)throw new Error('Token exchange failed: '+result.error_description);
  return result;// {access_token, refresh_token, expires_in}
}

async function refreshToken(refreshToken,clientId,clientSecret){
  const result=await post('oauth2.googleapis.com','/token',{
    refresh_token:refreshToken,client_id:clientId,client_secret:clientSecret,
    grant_type:'refresh_token',
  });
  if(result.error)throw new Error('Token refresh failed: '+result.error_description);
  return result;
}

// Resumable upload for large video files
async function uploadVideo(videoPath,metadata,accessToken){
  const fileSize=fs.statSync(videoPath).size;
  const metaBody=JSON.stringify({
    snippet:{
      title:metadata.title,
      description:metadata.description,
      tags:metadata.tags||[],
      categoryId:'25',// News & Politics — most relevant for Canadian content
      defaultLanguage:metadata.language||'en',
    },
    status:{
      privacyStatus:metadata.privacy||'private',// Start private, user can change
      selfDeclaredMadeForKids:false,
    },
  });

  // Step 1: Initiate resumable upload
  const initResult=await new Promise((resolve,reject)=>{
    const req=https.request({
      hostname:'www.googleapis.com',
      path:'/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      method:'POST',
      headers:{
        'Authorization':'Bearer '+accessToken,
        'Content-Type':'application/json; charset=UTF-8',
        'Content-Length':Buffer.byteLength(metaBody),
        'X-Upload-Content-Type':'video/mp4',
        'X-Upload-Content-Length':fileSize,
      },
    },res=>{
      if(res.statusCode!==200&&res.statusCode!==201)return reject(new Error('Upload init failed: '+res.statusCode));
      resolve(res.headers.location);
    });
    req.on('error',reject);req.write(metaBody);req.end();
  });

  if(!initResult)throw new Error('No upload URI returned');

  // Step 2: Upload file in chunks
  return new Promise((resolve,reject)=>{
    const uploadUrl=new url.URL(initResult);
    const stream=fs.createReadStream(videoPath);
    const req=https.request({
      hostname:uploadUrl.hostname,
      path:uploadUrl.pathname+uploadUrl.search,
      method:'PUT',
      headers:{
        'Content-Type':'video/mp4',
        'Content-Length':fileSize,
      },
    },res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{
        try{
          const d=JSON.parse(data);
          if(d.id)resolve(d);
          else reject(new Error('Upload failed: '+JSON.stringify(d)));
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);
    stream.pipe(req);
  });
}

// Get channel analytics
async function getAnalytics(channelId,accessToken,startDate,endDate){
  const params=new URLSearchParams({
    ids:'channel=='+channelId,
    startDate:startDate||new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10),
    endDate:endDate||new Date().toISOString().slice(0,10),
    metrics:'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares,estimatedRevenue',
    dimensions:'day',
    sort:'day',
  });
  return getJson(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`,{
    'Authorization':'Bearer '+accessToken,
  });
}

async function getVideoStats(videoIds,accessToken){
  const ids=Array.isArray(videoIds)?videoIds.join(','):videoIds;
  return getJson(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}`,{
    'Authorization':'Bearer '+accessToken,
  });
}

module.exports={getAuthUrl,exchangeCode,refreshToken,uploadVideo,getAnalytics,getVideoStats,waitForOAuthCode};
