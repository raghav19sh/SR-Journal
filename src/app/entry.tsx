import { useEffect,useState } from 'react';
import { Alert,Pressable,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';
import { router,useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView,useVideoPlayer } from 'expo-video';
import { deleteEntry,getEntry,JournalEntry,Mood,updateEntry } from '@/db/database';

const moods: Mood[]=['great','good','neutral','low','awful'];

export default function EntryScreen(){
 const {id}=useLocalSearchParams<{id:string}>();const db=useSQLiteContext();const [entry,setEntry]=useState<JournalEntry|null>(null);const [saving,setSaving]=useState(false);
 useEffect(()=>{if(id)getEntry(db,id).then(setEntry)},[db,id]);
 const player=useVideoPlayer(entry?.videoUri??null,p=>{p.loop=false});
 if(!entry)return <SafeAreaView style={styles.safe}><View style={styles.loading}><Text style={styles.loadingText}>Loading memory…</Text></View></SafeAreaView>;
 const save=async()=>{setSaving(true);try{await updateEntry(db,entry);const refreshed=await getEntry(db,entry.id);setEntry(refreshed);}finally{setSaving(false)}};
 const remove=()=>Alert.alert('Delete this memory?','The video and journal entry will be permanently removed from this device.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{await deleteEntry(db,entry);router.back()}}]);
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}>
   <View style={styles.header}><Pressable style={styles.back} onPress={()=>router.back()}><Text style={styles.backText}>‹</Text></Pressable><View style={{flex:1}}><Text style={styles.eyebrow}>PRIVATE MEMORY</Text><Text style={styles.title}>{new Date(entry.entryDate).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</Text></View><Pressable onPress={()=>setEntry({...entry,isFavorite:!entry.isFavorite})}><Text style={[styles.star,entry.isFavorite&&styles.starOn]}>★</Text></Pressable></View>
   <View style={styles.videoWrap}><VideoView player={player} style={styles.video} nativeControls contentFit="contain"/></View>
   <Text style={styles.label}>TITLE</Text><TextInput value={entry.title} onChangeText={title=>setEntry({...entry,title})} placeholder="Give this memory a title" placeholderTextColor="#666B76" style={styles.input}/>
   <Text style={styles.label}>NOTE</Text><TextInput value={entry.note} onChangeText={note=>setEntry({...entry,note})} placeholder="What do you want to remember?" placeholderTextColor="#666B76" multiline style={[styles.input,styles.note]}/>
   <Text style={styles.label}>MOOD</Text><View style={styles.moods}>{moods.map(m=><Pressable key={m} onPress={()=>setEntry({...entry,mood:entry.mood===m?null:m})} style={[styles.mood,entry.mood===m&&styles.moodActive]}><Text style={[styles.moodText,entry.mood===m&&styles.moodTextActive]}>{m}</Text></Pressable>)}</View>
   <Text style={styles.label}>TAGS</Text><TextInput value={entry.tags.join(', ')} onChangeText={v=>setEntry({...entry,tags:v.split(',').map(x=>x.trim()).filter(Boolean).slice(0,10)})} placeholder="travel, family, work" placeholderTextColor="#666B76" style={styles.input}/>
   {entry.transcript?<><Text style={styles.label}>TRANSCRIPT</Text><Text style={styles.transcript}>{entry.transcript}</Text></>:null}
   <Pressable style={styles.save} onPress={save}><Text style={styles.saveText}>{saving?'Saving…':'Save changes'}</Text></Pressable>
   <View style={styles.info}><Text style={styles.infoText}>Storage: this device only</Text><Text style={styles.private}>● Private</Text></View>
   <Pressable style={styles.delete} onPress={remove}><Text style={styles.deleteText}>Delete this memory</Text></Pressable>
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#0B0D12'},container:{padding:18,paddingBottom:30},header:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16},back:{width:40,height:40,borderRadius:20,backgroundColor:'#171A22',alignItems:'center',justifyContent:'center'},backText:{color:'#E7DCE0',fontSize:29,lineHeight:30},eyebrow:{color:'#C98A9E',fontSize:10,fontWeight:'800',letterSpacing:1.8},title:{color:'#F7F3F4',fontSize:17,fontWeight:'700',marginTop:3},star:{color:'#4A4E58',fontSize:25},starOn:{color:'#E1A9B7'},videoWrap:{height:330,backgroundColor:'#050609',borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'#282C35'},video:{flex:1},label:{color:'#666B77',fontSize:9,fontWeight:'800',letterSpacing:1.5,marginTop:18,marginBottom:7},input:{backgroundColor:'#151820',borderWidth:1,borderColor:'#292D38',borderRadius:12,color:'#F1ECEE',paddingHorizontal:13,paddingVertical:12,fontSize:14},note:{minHeight:100,textAlignVertical:'top'},moods:{flexDirection:'row',gap:7,flexWrap:'wrap'},mood:{borderWidth:1,borderColor:'#30343E',borderRadius:12,paddingHorizontal:12,paddingVertical:9},moodActive:{backgroundColor:'#C98A9E',borderColor:'#C98A9E'},moodText:{color:'#9297A1',fontSize:12,fontWeight:'700'},moodTextActive:{color:'#1B1216'},transcript:{color:'#C7C1C4',fontSize:13,lineHeight:20,backgroundColor:'#151820',padding:13,borderRadius:12},save:{backgroundColor:'#C98A9E',borderRadius:13,paddingVertical:14,alignItems:'center',marginTop:22},saveText:{color:'#1B1216',fontWeight:'800'},info:{flexDirection:'row',justifyContent:'space-between',paddingVertical:18},infoText:{color:'#7E838D',fontSize:12},private:{color:'#8DC8A1',fontSize:12},delete:{borderWidth:1,borderColor:'#4A2A33',borderRadius:13,paddingVertical:13,alignItems:'center'},deleteText:{color:'#D995A6',fontSize:13,fontWeight:'700'},loading:{flex:1,alignItems:'center',justifyContent:'center'},loadingText:{color:'#A2A6B0'}});