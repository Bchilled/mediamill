import React,{useState,useRef}from 'react';

const ACCEPT={
  image:'image/*',
  video:'video/*',
  audio:'audio/*',
  document:'.pdf,.txt,.md,.srt,.vtt,.csv,.docx',
  any:'image/*,video/*,audio/*,.pdf,.txt,.md,.srt,.vtt',
};
const ICONS={image:'🖼',video:'🎬',audio:'🎙',document:'📄',any:'📁'};
const LABELS={image:'Images',video:'Video Clips',audio:'Audio / Voice',document:'Documents',any:'Files'};

function fileIcon(type=''){
  if(type.startsWith('image'))return'🖼';
  if(type.startsWith('video'))return'🎬';
  if(type.startsWith('audio'))return'🎙';
  return'📄';
}
function fmtSize(b){
  if(!b)return'';
  if(b<1024)return b+'B';
  if(b<1048576)return Math.round(b/1024)+'KB';
  return(b/1048576).toFixed(1)+'MB';
}

export default function MediaPicker({
  isDark, accept='any', multiple=true,
  label, hint, onFiles,
  compact=false, showPreview=true,
  existingFiles=[],
}){
  const[dragging,setDragging]=useState(false);
  const[files,setFiles]=useState(existingFiles);
  const[urlInput,setUrlInput]=useState('');
  const[showUrl,setShowUrl]=useState(false);
  const[importing,setImporting]=useState(false);
  const fileRef=useRef();

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const bg=isDark?'rgba(255,255,255,0.025)':'rgba(0,0,0,0.02)';
  const border=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.09)';

  function readFile(file){
    return new Promise(res=>{
      const r=new FileReader();
      r.onload=e=>res({name:file.name,path:file.path||file.name,dataUri:e.target.result,type:file.type,size:file.size});
      r.readAsDataURL(file);
    });
  }

  async function addFiles(list){
    const read=await Promise.all(Array.from(list).map(readFile));
    const merged=multiple?[...files,...read]:read;
    setFiles(merged);onFiles?.(merged);
  }

  async function openFolder(){
    try{
      const r=await window.forge.openFolderDialog(accept);
      if(r?.files?.length){const m=multiple?[...files,...r.files]:r.files;setFiles(m);onFiles?.(m);}
    }catch(e){console.error(e);}
  }

  async function importUrl(){
    if(!urlInput.trim())return;
    setImporting(true);
    try{
      const r=await window.forge.importFromUrl(urlInput.trim());
      if(r){const m=multiple?[...files,r]:[r];setFiles(m);onFiles?.(m);}
    }catch(e){alert('Could not import: '+e.message);}
    setUrlInput('');setShowUrl(false);setImporting(false);
  }

  function remove(i){const u=files.filter((_,x)=>x!==i);setFiles(u);onFiles?.(u);}

  if(compact) return(
    <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
      <button onClick={()=>fileRef.current?.click()}
        style={{fontSize:11,padding:'5px 11px',borderRadius:8,cursor:'pointer',background:bg,border:'1px solid '+border,color:muted}}>
        📁 Add {LABELS[accept]}
      </button>
      <button onClick={openFolder}
        style={{fontSize:11,padding:'5px 11px',borderRadius:8,cursor:'pointer',background:bg,border:'1px solid '+border,color:muted}}>
        📂 Browse Folder
      </button>
      {files.map((f,i)=>(
        <div key={i} style={{display:'flex',gap:4,alignItems:'center',padding:'3px 9px',borderRadius:7,background:accent+'10',border:'1px solid '+accent+'25',fontSize:10,color:accent}}>
          {fileIcon(f.type)} {f.name.length>20?f.name.slice(0,17)+'…':f.name}
          <button onClick={()=>remove(i)} style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:0,marginLeft:2,fontSize:10}}>✕</button>
        </div>
      ))}
      <input ref={fileRef} type="file" accept={ACCEPT[accept]} multiple={multiple} style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
    </div>
  );

  return(
    <div>
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
        style={{border:'2px dashed '+(dragging?accent+'80':border),borderRadius:14,
          background:dragging?accent+'06':bg,padding:'22px 18px',textAlign:'center',transition:'all 0.15s',cursor:'pointer'}}
        onClick={()=>fileRef.current?.click()}>
        <div style={{fontSize:36,marginBottom:8}}>{ICONS[accept]}</div>
        <div style={{fontSize:13,fontWeight:700,color:text,marginBottom:4}}>{label||`Drop ${LABELS[accept]} here`}</div>
        <div style={{fontSize:11,color:muted,marginBottom:14,lineHeight:1.5}}>{hint||'Drag files, browse your computer, scan a folder, or import from a URL or Google Drive link'}</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>fileRef.current?.click()} className="btn btn-primary" style={{fontSize:11,padding:'7px 14px'}}>📁 Browse Files</button>
          <button onClick={openFolder} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11,padding:'7px 14px'}}>📂 Scan Folder</button>
          <button onClick={()=>setShowUrl(s=>!s)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11,padding:'7px 14px'}}>🔗 From URL</button>
        </div>
        {showUrl&&(
          <div style={{marginTop:12,display:'flex',gap:8,maxWidth:460,margin:'12px auto 0'}} onClick={e=>e.stopPropagation()}>
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&importUrl()}
              placeholder="https://... video, image, audio, or Drive link"
              style={{flex:1,padding:'8px 12px',borderRadius:9,fontSize:12,
                background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
                border:'1px solid '+border,color:text,outline:'none'}}/>
            <button onClick={importUrl} disabled={importing||!urlInput.trim()} className="btn btn-primary"
              style={{fontSize:11,padding:'8px 14px',opacity:importing||!urlInput.trim()?0.4:1}}>
              {importing?'⟳':'Import'}
            </button>
          </div>
        )}
      </div>

      {showPreview&&files.length>0&&(
        <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
          {files.map((f,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'9px 12px',
              background:bg,border:'1px solid '+border,borderRadius:10}}>
              {f.type?.startsWith('image')&&f.dataUri
                ?<img src={f.dataUri} style={{width:44,height:44,objectFit:'cover',borderRadius:7,flexShrink:0}}/>
                :<div style={{width:44,height:44,borderRadius:7,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{fileIcon(f.type)}</div>
              }
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                <div style={{fontSize:10,color:muted}}>{f.type||'file'}{f.size?` · ${fmtSize(f.size)}`:''}</div>
                {f.path&&f.path!==f.name&&<div style={{fontSize:9,color:sub,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:1}}>{f.path}</div>}
              </div>
              <button onClick={()=>remove(i)}
                style={{padding:'4px 9px',borderRadius:7,background:'rgba(238,34,68,0.07)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',cursor:'pointer',fontSize:11,flexShrink:0}}>✕</button>
            </div>
          ))}
          {files.length>1&&(
            <button onClick={()=>{setFiles([]);onFiles?.([]);}}
              style={{fontSize:11,color:sub,background:'transparent',border:'none',cursor:'pointer',textAlign:'left',padding:'2px 4px'}}>
              Clear all {files.length} files
            </button>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept={ACCEPT[accept]} multiple={multiple} style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
    </div>
  );
}
