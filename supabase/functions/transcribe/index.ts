import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  try{
    const auth=req.headers.get('Authorization')??'';
    const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
    const {data:{user}}=await userClient.auth.getUser();
    if(!user) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
    const {entryId}=await req.json();
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const {data:entry,error:entryError}=await admin.from('journal_entries').select('id,video_path,user_id').eq('id',entryId).eq('user_id',user.id).single();
    if(entryError||!entry) return new Response(JSON.stringify({error:'Entry not found'}),{status:404,headers:{...cors,'Content-Type':'application/json'}});
    const {data:signed,error:signedError}=await admin.storage.from('journal-videos').createSignedUrl(entry.video_path,300);
    if(signedError) throw signedError;
    const media=await fetch(signed.signedUrl);
    const blob=await media.blob();
    const form=new FormData();
    form.append('file',blob,'journal.mp4');
    form.append('model','gpt-4o-mini-transcribe');
    const ai=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+Deno.env.get('OPENAI_API_KEY')!},body:form});
    if(!ai.ok) throw new Error('Transcription provider failed: '+await ai.text());
    const result=await ai.json();
    const transcript=result.text??'';
    await admin.from('journal_entries').update({transcript,updated_at:new Date().toISOString()}).eq('id',entryId).eq('user_id',user.id);
    return new Response(JSON.stringify({transcript}),{headers:{...cors,'Content-Type':'application/json'}});
  }catch(error){
    return new Response(JSON.stringify({error:error instanceof Error?error.message:'Unknown error'}),{status:500,headers:{...cors,'Content-Type':'application/json'}});
  }
});
