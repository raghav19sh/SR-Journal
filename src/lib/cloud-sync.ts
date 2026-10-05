import * as FileSystem from 'expo-file-system/legacy';
import { createEntry,getAllEntries,getEntry,JournalEntry } from '@/db/database';
import { supabase } from '@/lib/supabase';

export async function syncJournal(db:any):Promise<{uploaded:number;downloaded:number}>{
  if(!supabase) throw new Error('Cloud backup is not configured.');
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error('Sign in before syncing.');
  const local=await getAllEntries(db);
  const {data:remote,error}=await supabase.from('journal_entries').select('*');
  if(error) throw error;
  let uploaded=0,downloaded=0;
  const remoteById=new Map((remote??[]).map((r:any)=>[r.id,r]));
  for(const entry of local){
    const r=remoteById.get(entry.id) as any;
    if(!r||new Date(entry.updatedAt).getTime()>=new Date(r.updated_at).getTime()){
      const path=user.id+'/'+entry.id+'.mp4';
      const bytes=await (await fetch(entry.videoUri)).arrayBuffer();
      const upload=await supabase.storage.from('journal-videos').upload(path,bytes,{contentType:'video/mp4',upsert:true});
      if(upload.error) throw upload.error;
      const {error:e}=await supabase.from('journal_entries').upsert({
        id:entry.id,user_id:user.id,entry_date:entry.entryDate,title:entry.title,note:entry.note,tags:entry.tags,mood:entry.mood,
        transcript:entry.transcript,is_favorite:entry.isFavorite,updated_at:entry.updatedAt,video_path:path
      });
      if(e) throw e;
      uploaded++;
    }
  }
  for(const r of remote??[]){
    const localEntry=await getEntry(db,r.id);
    if(localEntry) continue;
    const {data:urlData,error}=await supabase.storage.from('journal-videos').createSignedUrl(r.video_path,300);
    if(error) throw error;
    const dir=(FileSystem.documentDirectory??'')+'journal/';
    const destination=dir+r.id+'.mp4';
    await FileSystem.makeDirectoryAsync(dir,{intermediates:true});
    await FileSystem.downloadAsync(urlData.signedUrl,destination);
    await createEntry(db,{id:r.id,entryDate:r.entry_date,videoUri:destination,durationSeconds:null,title:r.title??'',note:r.note??'',tags:r.tags??[],mood:r.mood??null,transcript:r.transcript??'',isFavorite:Boolean(r.is_favorite),updatedAt:r.updated_at});
    downloaded++;
  }
  return {uploaded,downloaded};
}
