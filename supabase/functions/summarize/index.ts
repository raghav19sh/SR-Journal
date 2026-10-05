import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  try{
    const auth=req.headers.get('Authorization')??'';
    const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
    const {data:{user}}=await client.auth.getUser();
    if(!user) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
    const {entryId,transcript}=await req.json();
    if(!transcript) return new Response(JSON.stringify({error:'Transcript required'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
    const ai=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+Deno.env.get('OPENAI_API_KEY')!,'Content-Type':'application/json'},body:JSON.stringify({
      model:'gpt-4.1-mini',
      input:[{role:'system',content:'You summarize private journal memories. Be concise, factual, and gentle. Do not invent facts.'},{role:'user',content:'Create a short title and 3-bullet summary for this journal transcript:\n\n'+transcript}]
    })});
    if(!ai.ok) throw new Error('Summary provider failed: '+await ai.text());
    const result=await ai.json();
    const summary=result.output_text??'';
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('journal_ai_summaries').upsert({entry_id:entryId,user_id:user.id,summary,updated_at:new Date().toISOString()});
    return new Response(JSON.stringify({summary}),{headers:{...cors,'Content-Type':'application/json'}});
  }catch(error){
    return new Response(JSON.stringify({error:error instanceof Error?error.message:'Unknown error'}),{status:500,headers:{...cors,'Content-Type':'application/json'}});
  }
});
