const https=require('https');
const http=require('http');
const{v4:uuid}=require('uuid');

function fetch(url,opts={}){
  return new Promise((res,rej)=>{
    try{
      const lib=url.startsWith('https')?https:http;
      const req=lib.get(url,{
        headers:{'User-Agent':'Mozilla/5.0 MediaMill/1.0','Accept':'application/json,text/html,*/*',...(opts.headers||{})},
        timeout:12000,
      },resp=>{
        if(resp.statusCode>=300&&resp.statusCode<400&&resp.headers.location){
          return fetch(resp.headers.location,opts).then(res).catch(rej);
        }
        let data='';
        resp.on('data',c=>data+=c);
        resp.on('end',()=>res({status:resp.statusCode,body:data}));
      });
      req.on('error',rej);
      req.on('timeout',()=>{req.destroy();rej(new Error('Timeout'));});
    }catch(e){rej(e);}
  });
}

function parseRSS(xml){
  const items=[];
  const itemRe=/<item>([\s\S]*?)<\/item>/g;
  let m;
  while((m=itemRe.exec(xml))!==null){
    const b=m[1];
    const title=(/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(b)||/<title>(.*?)<\/title>/.exec(b)||[])[1]||'';
    const desc=(/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(b)||/<description>(.*?)<\/description>/.exec(b)||[])[1]||'';
    const link=(/<link>(.*?)<\/link>/.exec(b)||[])[1]||'';
    if(title)items.push({
      title:title.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'),
      description:desc.replace(/<[^>]+>/g,'').trim().slice(0,400),
      link:link.trim(),origin:'ai_news',
    });
  }
  return items;
}

// Extract keywords from channel topic
function extractKeywords(topic){
  const stopwords=new Set(['and','the','of','to','in','a','an','is','for','with','on','at','by','from','as','into','about','or','but','not','this','that','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','its','it','their','they','we','our','you','your']);
  return topic.toLowerCase().split(/\s+/).filter(w=>w.length>3&&!stopwords.has(w)).slice(0,8);
}

// Score relevance of an idea to channel topic
function relevanceScore(text,keywords){
  const t=text.toLowerCase();
  return keywords.reduce((score,kw)=>score+(t.includes(kw)?1:0),0);
}

async function fetchNewsRSS(topic,keywords){
  const sources=[
    {url:'https://rss.cbc.ca/lineup/canada.rss',name:'CBC Canada'},
    {url:'https://rss.cbc.ca/lineup/politics.rss',name:'CBC Politics'},
    {url:'https://globalnews.ca/feed/',name:'Global News'},
    {url:'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/',name:'Globe and Mail'},
    {url:'https://torontosun.com/category/news/national/feed',name:'Toronto Sun'},
  ];
  const ideas=[];
  for(const src of sources){
    try{
      const r=await fetch(src.url);
      if(r.status!==200)continue;
      const items=parseRSS(r.body);
      for(const item of items){
        const score=relevanceScore(item.title+' '+item.description,keywords);
        if(score>0||keywords.includes('canada')||keywords.includes('canadian')){
          ideas.push({...item,sources:[{url:item.link,name:src.name}],tags:['news','canada'],_score:score});
        }
      }
    }catch(e){}
  }
  return ideas;
}

async function fetchReddit(topic,keywords){
  const subs=['canada','CanadaPolitics','canadahistory','onguardforthee','canadanews','Quebec','ontario','britishcolumbia'];
  const ideas=[];
  for(const sub of subs){
    try{
      const r=await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`,{headers:{'User-Agent':'MediaMill:v1.0'}});
      if(r.status!==200)continue;
      const d=JSON.parse(r.body);
      const posts=(d.data?.children||[]).map(c=>c.data).filter(p=>!p.stickied&&p.score>50);
      for(const p of posts){
        const score=relevanceScore(p.title+' '+(p.selftext||''),keywords);
        if(score>0){
          ideas.push({
            title:p.title,
            description:(p.selftext||'').slice(0,400)||p.url,
            link:'https://reddit.com'+p.permalink,
            origin:'ai_reddit',tags:['reddit',sub],
            sources:[{url:'https://reddit.com'+p.permalink,name:'r/'+sub}],
            _score:score+Math.log(p.score+1),
          });
        }
      }
    }catch(e){}
  }
  return ideas;
}

async function fetchWikipedia(keywords){
  const ideas=[];
  // Search Wikipedia for each keyword
  for(const kw of keywords.slice(0,4)){
    try{
      const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kw+'_Canada')}`);
      if(r.status===200){
        const d=JSON.parse(r.body);
        if(d.extract&&d.extract.length>100){
          ideas.push({title:d.title,description:d.extract.slice(0,400),link:d.content_urls?.desktop?.page||'',origin:'ai_wiki',tags:['wikipedia','history'],sources:[{url:d.content_urls?.desktop?.page||'',name:'Wikipedia'}],_score:2});
        }
      }
    }catch(e){}
    try{
      // Also try search API
      const r=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent('Canadian '+kw)}&limit=3&format=json`);
      const d=JSON.parse(r.body);
      const titles=d[1]||[];const descs=d[2]||[];const urls=d[3]||[];
      titles.forEach((t,i)=>{
        if(t&&descs[i])ideas.push({title:t,description:descs[i],link:urls[i]||'',origin:'ai_wiki',tags:['wikipedia'],sources:[{url:urls[i]||'',name:'Wikipedia'}],_score:1});
      });
    }catch(e){}
  }
  return ideas;
}

async function scan(channel){
  const topic=channel.style_prompt||channel.name||'Canada';
  const keywords=extractKeywords(topic);
  // Always include canada/canadian
  if(!keywords.includes('canada'))keywords.push('canada');

  console.log(`[IdeaScanner] Scanning for: "${topic}" | keywords: ${keywords.join(', ')}`);

  const[news,reddit,wiki]=await Promise.all([
    fetchNewsRSS(topic,keywords),
    fetchReddit(topic,keywords),
    fetchWikipedia(keywords),
  ]);

  const all=[...news,...reddit,...wiki];

  // Sort by relevance score, dedupe by title
  const seen=new Set();
  return all
    .sort((a,b)=>(b._score||0)-(a._score||0))
    .filter(idea=>{
      const key=idea.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40);
      if(seen.has(key))return false;
      seen.add(key);
      return idea.title.length>10;
    })
    .slice(0,25)
    .map(({_score,...idea})=>idea);
}

module.exports={scan};
