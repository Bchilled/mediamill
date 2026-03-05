import React,{useState}from 'react';
import{useI18n,LANGUAGES}from '../../i18n';
import{CAPTION_LANGUAGES}from '../../i18n/translations';
import MediaPicker from './MediaPicker';

// Per-language subtitle entry
function LangRow({isDark,lang,status,onGenerate,onRemove,onUploadSrt,generating}){
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const border=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';

  const statusColor={generated:'#00E676',uploaded:'#00C8FF',burned:'#FF8040',error:'#EE2244'}[status]||muted;

  return(
    <div style={{display:'flex',gap:10,alignItems:'center',padding:'9px 12px',
      background:bg,border:'1px solid '+border,borderRadius:10,marginBottom:6}}>
      <span style={{fontSize:18,flexShrink:0}}>{CAPTION_LANGUAGES.find(l=>l.code===lang.code)&&lang.flag||'🌐'}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:text}}>{lang.name}</div>
        {status&&<div style={{fontSize:10,color:statusColor,fontWeight:600,textTransform:'capitalize',marginTop:1}}>{status}</div>}
      </div>
      <div style={{display:'flex',gap:6,flexShrink:0}}>
        {!status&&(
          <button onClick={onGenerate} disabled={generating}
            style={{fontSize:10,padding:'4px 10px',borderRadius:7,background:accent+'12',border:'1px solid '+accent+'30',color:accent,cursor:'pointer',opacity:generating?0.5:1}}>
            {generating?'⟳ AI…':'✨ Generate'}
          </button>
        )}
        {status==='generated'&&(
          <>
            <button onClick={()=>onUploadSrt('youtube')}
              style={{fontSize:10,padding:'4px 10px',borderRadius:7,background:'rgba(255,0,0,0.08)',border:'1px solid rgba(255,0,0,0.2)',color:'#FF4444',cursor:'pointer'}}>
              ▶ YouTube
            </button>
            <button onClick={()=>onUploadSrt('burn')}
              style={{fontSize:10,padding:'4px 10px',borderRadius:7,background:'rgba(255,128,0,0.08)',border:'1px solid rgba(255,128,0,0.2)',color:'#FF8040',cursor:'pointer'}}>
              🔥 Burn In
            </button>
          </>
        )}
        <button onClick={onRemove}
          style={{fontSize:10,padding:'4px 8px',borderRadius:7,background:'transparent',border:'1px solid '+border,color:muted,cursor:'pointer'}}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default function SubtitlesPanel({isDark,video}){
  const{t}=useI18n();
  const[open,setOpen]=useState(false);
  const[autoGen,setAutoGen]=useState(true);
  const[burnIn,setBurnIn]=useState(false);
  const[uploadYT,setUploadYT]=useState(true);
  const[selectedLangs,setSelectedLangs]=useState([
    {code:'en',name:'English',flag:'🇨🇦'},
  ]);
  const[subtitleStatus,setSubtitleStatus]=useState({});// {langCode: 'generated'|'uploaded'|'burned'|'error'}
  const[generating,setGenerating]=useState({});
  const[showLangPicker,setShowLangPicker]=useState(false);
  const[search,setSearch]=useState('');

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  const border=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  const totalDone=Object.values(subtitleStatus).filter(s=>s==='generated'||s==='uploaded').length;

  async function generateSubtitle(langCode){
    if(!video?.id)return;
    setGenerating(g=>({...g,[langCode]:true}));
    try{
      await window.forge.generateSubtitles(video.id,langCode);
      setSubtitleStatus(s=>({...s,[langCode]:'generated'}));
    }catch(e){
      setSubtitleStatus(s=>({...s,[langCode]:'error'}));
    }
    setGenerating(g=>({...g,[langCode]:false}));
  }

  async function generateAll(){
    for(const lang of selectedLangs){
      await generateSubtitle(lang.code);
    }
  }

  function addLanguage(lang){
    if(!selectedLangs.find(l=>l.code===lang.code)){
      setSelectedLangs(ls=>[...ls,{code:lang.code,name:lang.name,flag:'🌐'}]);
    }
    setShowLangPicker(false);setSearch('');
  }

  function removeLang(code){
    setSelectedLangs(ls=>ls.filter(l=>l.code!==code));
    setSubtitleStatus(s=>{const n={...s};delete n[code];return n;});
  }

  const filtered=CAPTION_LANGUAGES.filter(l=>
    !selectedLangs.find(s=>s.code===l.code)&&
    (l.name.toLowerCase().includes(search.toLowerCase())||l.code.toLowerCase().includes(search.toLowerCase()))
  );

  return(
    <div style={{background:bg,border:'1px solid '+border,borderRadius:14,marginBottom:12,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{padding:'13px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',
          borderBottom:open?'1px solid '+border:'none'}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:16}}>💬</span>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:text}}>{t('creator_subtitles')} & Captions</div>
            <div style={{fontSize:10,color:muted}}>Auto-generate, translate, burn-in, upload to YouTube — {selectedLangs.length} language{selectedLangs.length!==1?'s':''} configured</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {totalDone>0&&<span style={{fontSize:10,fontWeight:700,color:'#00E676',background:'rgba(0,230,118,0.1)',padding:'2px 8px',borderRadius:99}}>{totalDone} ready</span>}
          <span style={{fontSize:10,color:muted}}>{open?'▲':'▼'}</span>
        </div>
      </div>

      {open&&(
        <div style={{padding:'14px 18px'}}>

          {/* Options row */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
            {[
              {key:'autoGen',  label:'✨ AI Generate', val:autoGen,  set:setAutoGen,  hint:'Use Whisper/AI to transcribe and translate'},
              {key:'burnIn',   label:'🔥 Burn Into Video', val:burnIn, set:setBurnIn, hint:'Bake subtitles into the video file'},
              {key:'uploadYT', label:'▶ Upload to YouTube', val:uploadYT,set:setUploadYT,hint:'Add as closed captions on YouTube'},
            ].map(opt=>(
              <div key={opt.key} onClick={()=>opt.set(v=>!v)} title={opt.hint}
                style={{display:'flex',gap:6,alignItems:'center',padding:'6px 12px',borderRadius:9,cursor:'pointer',
                  background:opt.val?accent+'12':'transparent',
                  border:'1px solid '+(opt.val?accent+'40':border),
                  color:opt.val?accent:muted,fontSize:11,fontWeight:opt.val?700:400,transition:'all 0.15s'}}>
                <div style={{width:14,height:14,borderRadius:'50%',border:'2px solid '+(opt.val?accent:muted),
                  background:opt.val?accent:'transparent',transition:'all 0.15s',flexShrink:0}}/>
                {opt.label}
              </div>
            ))}
          </div>

          {/* Language list */}
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.1em'}}>Languages</div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={generateAll}
                  disabled={!video?.id||Object.keys(generating).some(k=>generating[k])}
                  className="btn btn-primary" style={{fontSize:10,padding:'4px 12px',opacity:!video?.id?0.4:1}}>
                  ✨ Generate All
                </button>
                <button onClick={()=>setShowLangPicker(s=>!s)}
                  className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:10,padding:'4px 10px'}}>
                  + Add Language
                </button>
              </div>
            </div>

            {selectedLangs.map(lang=>(
              <LangRow key={lang.code} isDark={isDark} lang={lang}
                status={subtitleStatus[lang.code]}
                generating={generating[lang.code]}
                onGenerate={()=>generateSubtitle(lang.code)}
                onRemove={()=>removeLang(lang.code)}
                onUploadSrt={(action)=>{
                  setSubtitleStatus(s=>({...s,[lang.code]:action==='burn'?'burned':'uploaded'}));
                }}/>
            ))}

            {/* Language picker dropdown */}
            {showLangPicker&&(
              <div style={{background:isDark?'rgba(12,12,24,0.97)':'rgba(255,255,255,0.97)',
                border:'1px solid '+border,borderRadius:12,padding:'10px',
                maxHeight:240,overflowY:'auto',marginTop:6,
                boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search languages…" autoFocus
                  style={{width:'100%',padding:'7px 10px',borderRadius:8,fontSize:12,marginBottom:8,boxSizing:'border-box',
                    background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
                    border:'1px solid '+border,color:text,outline:'none'}}/>
                {filtered.map(l=>(
                  <div key={l.code} onClick={()=>addLanguage(l)}
                    style={{padding:'7px 10px',borderRadius:8,cursor:'pointer',fontSize:12,color:text,
                      display:'flex',gap:8,alignItems:'center'}}
                    onMouseEnter={e=>e.currentTarget.style.background=accent+'12'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:11,color:muted,fontFamily:'monospace',minWidth:50}}>{l.code}</span>
                    {l.name}
                  </div>
                ))}
                {filtered.length===0&&<div style={{fontSize:11,color:muted,padding:'8px 10px'}}>No languages found</div>}
              </div>
            )}
          </div>

          {/* Upload existing SRT */}
          <div style={{borderTop:'1px solid '+border,paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:700,color:muted,marginBottom:8}}>Or upload your own subtitle files (.srt, .vtt, .ass)</div>
            <MediaPicker isDark={isDark} accept="document" compact
              label="Upload subtitle files"
              hint="Upload .srt or .vtt files — name them with the language code e.g. subtitles_fr.srt"
              onFiles={files=>{
                files.forEach(f=>{
                  // Auto-detect language from filename
                  const match=f.name.match(/_([a-z]{2}(-[A-Z]{2})?)\.(srt|vtt)/);
                  if(match){
                    const code=match[1];
                    const found=CAPTION_LANGUAGES.find(l=>l.code===code);
                    if(found&&!selectedLangs.find(l=>l.code===code)){
                      setSelectedLangs(ls=>[...ls,{code:found.code,name:found.name,flag:'🌐'}]);
                    }
                    setSubtitleStatus(s=>({...s,[code]:'generated'}));
                  }
                });
              }}/>
          </div>
        </div>
      )}
    </div>
  );
}
