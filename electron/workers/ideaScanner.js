const https=require('https');
const http=require('http');
const{v4:uuid}=require('uuid');

// Fetch URL helper
function fetch(url,opts={}){
  return new Promise((res,rej)=>{
    const lib=url.startsWith('https')?https:http;
    const req=lib.get(url,{
      headers:{'User-Agent':'Mozilla/5.0 MediaMill/1.0','Accept':'application/json,text/html,*/*',...(opts.headers||{})},
      timeout:10000,
    },resp=>{
      if(resp.statusCode>=300&&resp.statusCode<400&&resp.headers.location){
        return fetch(resp.headers.location,opts).then(res).catch(rej);
      }
      let data='';
      resp.on('data',c=>data+=c);
      resp.on('end',()=>res({status:resp.statusCode,body:data,headers:resp.headers}));
    });
    req.on('error',rej);
    req.on('timeout',()=>rej(new Error('Timeout')));
  });
}

// Parse RSS feed
function parseRSS(xml){
  const items=[];
  const itemRe=/<item>([\s\S]*?)<\/item>/g;
  let m;
  while((m=itemRe.exec(xml))!==null){
    const block=m[1];
    const title=(/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block)||/<title>(.*?)<\/title>/.exec(block)||[])[1]||'';
    const desc=(/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(block)||/<description>(.*?)<\/description>/.exec(block)||[])[1]||'';
    const link=(/<link>(.*?)<\/link>/.exec(block)||[])[1]||'';
    const pubDate=(/<pubDate>(.*?)<\/pubDate>/.exec(block)||[])[1]||'';
    if(title)items.push({title:title.trim(),description:desc.replace(/<[^>]+>/g,'').trim().slice(0,300),link:link.trim(),pubDate,origin:'ai_news'});
  }
  return items;
}

// Canadian news RSS sources
const NEWS_SOURCES=[
  {url:'https://rss.cbc.ca/lineup/canada.rss',name:'CBC Canada'},
  {url:'https://globalnews.ca/feed/',name:'Global News'},
  {url:'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/',name:'Globe and Mail'},
  {url:'https://torontosun.com/category/news/national/feed',name:'Toronto Sun'},
  {url:'https://www.cp24.com/rss/ctv-news/ctv-news-canada-1.822529',name:'CP24'},
];

// Wikipedia random Canadian article
async function getWikiIdea(topic='Canada'){
  try{
    const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/random/summary`);
    const d=JSON.parse(r.body);
    if(d.extract&&(d.extract.includes('Canada')||d.extract.includes('Canadian')||d.title.includes('Canada'))){
      return{title:d.title,description:d.extract.slice(0,400),link:d.content_urls?.desktop?.page||'',origin:'ai_wiki',tags:['wikipedia','canadian history']};
    }
  }catch(e){}
  return null;
}

// Fetch Canadian subreddits (JSON API, no auth needed)
async function getRedditIdeas(subreddit='canada'){
  try{
    const r=await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,{headers:{'User-Agent':'MediaMill:1.0'}});
    const d=JSON.parse(r.body);
    return(d.data?.children||[]).map(c=>c.data).filter(p=>!p.stickied&&p.score>100).map(p=>({
      title:p.title,description:p.selftext?.slice(0,300)||p.url||'',
      link:'https://reddit.com'+p.permalink,origin:'ai_reddit',tags:['reddit',subreddit],
    }));
  }catch(e){return[];}
}

// Main scan function
async function scan(channel){
  const ideas=[];
  const channelKeywords=(channel.style_prompt||channel.name||'Canada').toLowerCase();

  // 1. News RSS
  for(const src of NEWS_SOURCES){
    try{
      const r=await fetch(src.url);
      const items=parseRSS(r.body).slice(0,5);
      ideas.push(...items.map(i=>({...i,sources:[{url:i.link,name:src.name}],tags:['news','canada']})));
    }catch(e){}
  }

  // 2. Reddit
  const reddits=['canada','CanadaPolitics','canadahistory','onguardforthee'];
  for(const sub of reddits){
    const posts=await getRedditIdeas(sub);
    ideas.push(...posts.slice(0,3));
  }

  // 3. Wikipedia (3 attempts)
  for(let i=0;i<3;i++){
    const w=await getWikiIdea();
    if(w)ideas.push(w);
  }

  // Deduplicate by title similarity
  const seen=new Set();
  return ideas.filter(idea=>{
    const key=idea.title.toLowerCase().slice(0,30);
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  }).slice(0,20);
}

module.exports={scan};
