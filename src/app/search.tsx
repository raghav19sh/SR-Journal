import { useEffect,useState } from 'react';
import { FlatList,Pressable,StyleSheet,Text,TextInput,View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { JournalEntry,searchEntries } from '@/db/database';

export default function SearchScreen(){
 const db=useSQLiteContext();const [query,setQuery]=useState('');const [results,setResults]=useState<JournalEntry[]>([]);
 useEffect(()=>{const t=setTimeout(()=>searchEntries(db,query).then(setResults),180);return()=>clearTimeout(t)},[db,query]);
 return <SafeAreaView style={styles.safe}><View style={styles.container}><View style={styles.header}><Pressable onPress={()=>router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Search journal</Text></View><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search titles, notes, tags, transcripts…" placeholderTextColor="#666B76" style={styles.input}/><FlatList data={results} keyExtractor={i=>i.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>{query?'No matching memories.':'Your searchable journal will appear here.'}</Text>} renderItem={({item})=><Pressable style={styles.card} onPress={()=>router.push({pathname:'/entry',params:{id:item.id}})}><Text style={styles.cardTitle}>{item.title||'Untitled memory'}</Text><Text style={styles.meta}>{new Date(item.entryDate).toLocaleDateString()} {item.mood?'• '+item.mood:''}</Text><Text style={styles.note} numberOfLines={2}>{item.note||item.tags.join(' • ')||'Video journal'}</Text></Pressable>}/></View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#0B0D12'},container:{flex:1,padding:18},header:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:18},back:{color:'#E7DCE0',fontSize:32},title:{color:'#F7F3F4',fontSize:22,fontWeight:'700'},input:{backgroundColor:'#151820',borderWidth:1,borderColor:'#292D38',borderRadius:13,color:'#F2EDEF',padding:13},list:{gap:10,paddingTop:14,paddingBottom:30},card:{backgroundColor:'#151820',borderWidth:1,borderColor:'#292D38',borderRadius:15,padding:15},cardTitle:{color:'#F2EDEF',fontSize:15,fontWeight:'700'},meta:{color:'#8D929C',fontSize:10,marginTop:5},note:{color:'#AEB2BA',fontSize:12,lineHeight:18,marginTop:8},empty:{color:'#7E838D',textAlign:'center',marginTop:40}});
