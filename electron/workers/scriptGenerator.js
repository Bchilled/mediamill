const https=require('https');
const{v4:uuid}=require('uuid');

async function callClaude(apiKey,systemPrompt,userPrompt,maxTokens=4096){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({
      model:'claude-opus-4-5',
      max_tokens:maxTokens,
      system:systemPrompt,
      messages:[{role:'user',content:userPrompt}]
    });
    const req=https.request({
      hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','Content-Length':Buffer.byteLength(body)},
    },res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{
        try{
          const d=JSON.parse(data);
          if(d.error)return reject(new Error(d.error.message));
          resolve(d.content?.[0]?.text||'');
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);
    req.write(body);req.end();
  });
}

async function callGemini(apiKey,prompt,maxTokens=4096){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens}});
    const path=`/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const req=https.request({hostname:'generativelanguage.googleapis.com',path,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{
        try{
          const d=JSON.parse(data);
          if(d.error)return reject(new Error(d.error.message));
          resolve(d.candidates?.[0]?.content?.parts?.[0]?.text||'');
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

function buildSystemPrompt(channel){
  return`You are a professional documentary/YouTube scriptwriter specializing in Canadian content.
Channel: "${channel.name}"
Topic focus: ${channel.style_prompt||channel.topic||'Canadian content'}
Format: ${channel.preset} (${channel.preset==='short'?'under 60 seconds':channel.preset==='mid'?'5-20 minutes':'20-90 minutes'})

Rules:
- Write for voice narration — natural, conversational, engaging
- Every claim must be factual and verifiable
- Canadian perspective and context always
- Bilingual country: acknowledge French and English Canada where relevant
- Structure: Hook → Context → Main content → Conclusion → CTA`;
}

async function generateScript(video,channel,settings){
  const apiKey=settings.apiKeys?.claude||settings.apiKeys?.gemini;
  if(!apiKey)throw new Error('No AI API key configured. Add Claude or Gemini key in Settings.');

  const targetWords=channel.preset==='short'?150:channel.preset==='mid'?1500:6000;
  const targetMin=channel.preset==='short'?1:channel.preset==='mid'?video.target_length||10:video.target_length||30;

  const prompt=`Write a complete YouTube script for this video:

Title: "${video.title}"
Description: "${video.description||''}"
Target length: ~${targetMin} minutes (~${targetWords} words)

Return a JSON object with this exact structure:
{
  "title_en": "Final English YouTube title (clickable, SEO-optimized, under 70 chars)",
  "title_fr": "French translation of title",
  "title_es": "Spanish translation of title",
  "description_en": "YouTube description in English (2-3 paragraphs, include timestamps placeholder, relevant hashtags)",
  "description_fr": "French YouTube description",
  "description_es": "Spanish YouTube description",
  "tags_en": ["tag1","tag2",...10-15 tags],
  "tags_fr": ["tag1fr",...],
  "tags_es": ["tag1es",...],
  "thumbnail_concept": "Describe the ideal thumbnail image in detail — what's shown, text overlay, colors, mood",
  "script": [
    {
      "id": "seg_1",
      "type": "hook|intro|main|transition|conclusion|cta",
      "narration": "The exact words the narrator speaks",
      "duration_seconds": 30,
      "broll": [
        {"query": "search term for stock footage", "duration": 5, "notes": "specific visual description"}
      ],
      "onscreen_text": "Text that appears on screen (or null)",
      "chapter_title": "Chapter name for YouTube (or null)"
    }
  ],
  "total_duration_seconds": 1800,
  "chapters": [
    {"time": "0:00", "title": "Introduction"},
    {"time": "2:30", "title": "Chapter name"}
  ]
}

IMPORTANT: Return ONLY the JSON. No markdown, no backticks, no explanation.`;

  let rawText='';
  try{
    if(settings.apiKeys?.claude){
      rawText=await callClaude(settings.apiKeys.claude,buildSystemPrompt(channel),prompt,8000);
    }else{
      rawText=await callGemini(settings.apiKeys.gemini,buildSystemPrompt(channel)+'\n\n'+prompt,8000);
    }
  }catch(e){
    // Fallback to other model
    if(settings.apiKeys?.gemini&&settings.apiKeys?.claude){
      rawText=await callGemini(settings.apiKeys.gemini,buildSystemPrompt(channel)+'\n\n'+prompt,8000);
    }else throw e;
  }

  // Parse JSON — strip any accidental markdown
  const cleaned=rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
  try{
    return JSON.parse(cleaned);
  }catch(e){
    // Try to extract JSON from response
    const match=cleaned.match(/\{[\s\S]*\}/);
    if(match)return JSON.parse(match[0]);
    throw new Error('AI returned invalid JSON. Raw: '+cleaned.slice(0,200));
  }
}

module.exports={generateScript};
