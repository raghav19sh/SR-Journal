import { supabase } from '@/lib/supabase';

export async function transcribeEntry(entryId:string){
  if(!supabase) throw new Error('Cloud is not configured.');
  const {data,error}=await supabase.functions.invoke('transcribe',{body:{entryId}});
  if(error) throw error;
  if(data?.error) throw new Error(data.error);
  return data.transcript as string;
}

export async function summarizeEntry(entryId:string,transcript:string){
  if(!supabase) throw new Error('Cloud is not configured.');
  const {data,error}=await supabase.functions.invoke('summarize',{body:{entryId,transcript}});
  if(error) throw error;
  if(data?.error) throw new Error(data.error);
  return data.summary as string;
}
