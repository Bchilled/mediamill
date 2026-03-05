import React,{useState,useEffect}from 'react';

export default function LogoPicker({channelName,topic,isDark,onSelect,selected}){
  const[logos,setLogos]=useState([]);
  const[loading,setLoading]=useState(false);
  const[generated,setGenerated]=useState(false);

  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const accent='#7C6EFA';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';

  async function generate(){
    if(!channelName)return;
    setLoading(true);
    try{
      const results=await window.forge.generateChannelLogos(channelName,topic||'');
      setLogos(results);
      setGenerated(true);
      if(results.length>0&&!selected)onSelect(results[0]);
    }catch(e){console.error(e);}
    setLoading(false);
  }

  // Auto-generate when name is ready
  useEffect(()=>{
    if(channelName&&channelName.length>2&&!generated&&!loading){
      generate();
    }
  },[channelName]);

  return(
    <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:sub,marginBottom:2}}>Channel Logo</div>
          <div style={{fontSize:11,color:muted}}>Used as your YouTube profile photo</div>
        </div>
        <button onClick={generate} disabled={loading||!channelName}
          className={isDark?'btn btn-ghost':'btn btn-ghost-light'}
          style={{fontSize:11,padding:'5px 12px',opacity:loading||!channelName?0.5:1}}>
          {loading?'⟳ Generating…':'↻ Regenerate'}
        </button>
      </div>

      {!generated&&!loading&&(
        <div style={{textAlign:'center',padding:'20px 0',color:sub,fontSize:12}}>
          {channelName?'Generating logos…':'Enter channel name above to generate logos'}
        </div>
      )}

      {loading&&(
        <div style={{display:'flex',gap:10,justifyContent:'center',padding:'12px 0'}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:80,height:80,borderRadius:12,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',
              animation:'pulse 1.2s ease-in-out infinite',animationDelay:i*0.2+'s'}}/>
          ))}
        </div>
      )}

      {logos.length>0&&!loading&&(
        <div>
          <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:12}}>
            {logos.map((logo,i)=>(
              <div key={i} onClick={()=>onSelect(logo)}
                style={{
                  width:80,height:80,borderRadius:'50%',overflow:'hidden',cursor:'pointer',
                  border:'3px solid '+(selected?.path===logo.path?accent:'transparent'),
                  boxShadow:selected?.path===logo.path?`0 0 0 2px ${accent}40,0 4px 16px rgba(0,0,0,0.4)`:'0 2px 8px rgba(0,0,0,0.3)',
                  transition:'all 0.15s',flexShrink:0,
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                <img src={logo.dataUri} alt={`Logo option ${i+1}`}
                  style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            ))}
          </div>

          {selected&&(
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:isDark?'rgba(124,110,250,0.06)':'rgba(68,0,204,0.05)',borderRadius:9,border:'1px solid '+(isDark?'rgba(124,110,250,0.15)':'rgba(68,0,204,0.12)')}}>
              <img src={selected.dataUri} alt="Selected logo"
                style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'2px solid '+accent}}/>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:text}}>Logo selected</div>
                <div style={{fontSize:10,color:muted}}>
                  {selected.source==='dalle3'?'AI generated (DALL-E 3)':selected.source==='stability'?'AI generated (Stability AI)':'Auto-generated'}
                  {' · '}Click another to change
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {logos.length>0&&(
        <div style={{fontSize:10,color:sub,marginTop:10,textAlign:'center'}}>
          {logos[0]?.source==='fallback'
            ?'Add OpenAI or Stability AI key in Settings for AI-generated logos'
            :'Generated with AI · Click ↻ Regenerate for more options'}
        </div>
      )}
    </div>
  );
}
