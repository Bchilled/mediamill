const{exec,execFile}=require('child_process');
const path=require('path');
const fs=require('fs');
const{v4:uuid}=require('uuid');
const os=require('os');

function findFFmpeg(){
  // Check env (set by main.js from bundled resource)
  if(process.env.MEDIAMILL_FFMPEG&&require('fs').existsSync(process.env.MEDIAMILL_FFMPEG))return process.env.MEDIAMILL_FFMPEG;
  const{app}=require('electron');
  const userData=app.getPath('userData');
  const candidates=[
    require('path').join(userData,'ffmpeg.exe'),
    'ffmpeg',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
  ];
  for(const c of candidates){
    try{require('child_process').execSync(`"${c}" -version`,{stdio:'ignore'});return c;}catch(e){}
  }
  return null;
}

function runFFmpeg(args,ffmpegPath='ffmpeg'){
  return new Promise((resolve,reject)=>{
    const cmd=`"${ffmpegPath}" ${args} -y`;
    console.log('[FFmpeg]',cmd.slice(0,120));
    exec(cmd,{maxBuffer:50*1024*1024,timeout:300000},(err,stdout,stderr)=>{
      if(err)return reject(new Error('FFmpeg failed: '+stderr.slice(-500)));
      resolve({stdout,stderr});
    });
  });
}

// Convert image to video clip of given duration
async function imageToClip(imagePath,duration,outputPath,ffmpeg){
  await runFFmpeg(`-loop 1 -i "${imagePath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" "${outputPath}"`,ffmpeg);
  return outputPath;
}

// Trim video clip to duration
async function trimClip(inputPath,duration,outputPath,ffmpeg){
  await runFFmpeg(`-i "${inputPath}" -t ${duration} -c:v libx264 -c:a aac -pix_fmt yuv420p "${outputPath}"`,ffmpeg);
  return outputPath;
}

// Create title card image using FFmpeg drawtext
async function createTitleCard(text,duration,outputPath,ffmpeg){
  const safe=text.replace(/'/g,"\\'").replace(/:/g,'\\:');
  await runFFmpeg(`-f lavfi -i color=c=0x080810:s=1920x1080:d=${duration} -vf "drawtext=text='${safe}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5:boxborderw=20" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`,ffmpeg);
  return outputPath;
}

// Merge audio files into one
async function mergeAudio(audioFiles,outputPath,ffmpeg){
  if(audioFiles.length===0)throw new Error('No audio files');
  if(audioFiles.length===1){fs.copyFileSync(audioFiles[0],outputPath);return outputPath;}
  const listFile=path.join(os.tmpdir(),'concat_'+uuid()+'.txt');
  fs.writeFileSync(listFile,audioFiles.map(f=>`file '${f.replace(/\\/g,'/')}'`).join('\n'));
  await runFFmpeg(`-f concat -safe 0 -i "${listFile}" -c:a pcm_s16le "${outputPath}"`,ffmpeg);
  try{fs.unlinkSync(listFile);}catch(e){}
  return outputPath;
}

// Main composition function
async function composeVideo(script,audioFiles,assets,outputPath,settings){
  const ffmpeg=findFFmpeg();
  if(!ffmpeg)throw new Error('FFmpeg not found. Install FFmpeg and add to PATH: https://ffmpeg.org/download.html');

  const tmpDir=path.join(os.tmpdir(),'mediamill_'+uuid());
  fs.mkdirSync(tmpDir,{recursive:true});

  try{
    const clips=[];
    const segments=script.script||[];

    // Build asset map by segId
    const assetMap={};
    for(const a of assets){
      if(!assetMap[a.segId]&&a.localPath&&fs.existsSync(a.localPath))assetMap[a.segId]=a;
    }

    // Create a video clip for each segment
    for(let i=0;i<segments.length;i++){
      const seg=segments[i];
      const dur=seg.duration_seconds||10;
      const clipPath=path.join(tmpDir,`clip_${i}.mp4`);
      const asset=assetMap[seg.id];

      if(asset&&asset.type==='video'&&asset.localPath){
        await trimClip(asset.localPath,dur,clipPath,ffmpeg);
      }else if(asset&&asset.type==='image'&&asset.localPath){
        await imageToClip(asset.localPath,dur,clipPath,ffmpeg);
      }else{
        // Create title card as fallback
        const txt=seg.onscreen_text||seg.chapter_title||seg.type||'...';
        await createTitleCard(txt,dur,clipPath,ffmpeg);
      }
      clips.push(clipPath);
    }

    // Merge audio
    const audioFiles2=audioFiles.filter(a=>a.path&&fs.existsSync(a.path)).map(a=>a.path);
    let mergedAudio=null;
    if(audioFiles2.length>0){
      mergedAudio=path.join(tmpDir,'merged_audio.wav');
      await mergeAudio(audioFiles2,mergedAudio,ffmpeg);
    }

    // Concatenate all video clips
    const concatList=path.join(tmpDir,'concat.txt');
    fs.writeFileSync(concatList,clips.map(c=>`file '${c.replace(/\\/g,'/')}'`).join('\n'));
    const concatVideo=path.join(tmpDir,'concat.mp4');
    await runFFmpeg(`-f concat -safe 0 -i "${concatList}" -c:v libx264 -pix_fmt yuv420p "${concatVideo}"`,ffmpeg);

    // Mux video + audio
    if(mergedAudio&&fs.existsSync(mergedAudio)){
      await runFFmpeg(`-i "${concatVideo}" -i "${mergedAudio}" -c:v copy -c:a aac -shortest "${outputPath}"`,ffmpeg);
    }else{
      fs.copyFileSync(concatVideo,outputPath);
    }

    return outputPath;
  }finally{
    // Cleanup temp files
    try{fs.rmSync(tmpDir,{recursive:true,force:true});}catch(e){}
  }
}

module.exports={composeVideo,findFFmpeg};
