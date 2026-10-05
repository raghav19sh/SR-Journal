import { useEffect,useMemo,useState } from 'react';
import { ActivityIndicator,Pressable,StyleSheet,Text,View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from '@/components/Calendar';
import { listEntryDates } from '@/db/database';
import { formatMonthTitle,getCalendarGrid,shiftMonth,toDateKey } from '@/lib/calendar';

export default function JournalHome(){
 const db=useSQLiteContext();const [month,setMonth]=useState(()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),1);});const [entryDates,setEntryDates]=useState<string[]>([]);const [loading,setLoading]=useState(true);
 const days=useMemo(()=>getCalendarGrid(month),[month]);
 useEffect(()=>{let mounted=true;setLoading(true);listEntryDates(db,month).then(d=>{if(mounted){setEntryDates(d);setLoading(false);}}).catch(()=>mounted&&setLoading(false));return()=>{mounted=false};},[db,month]);
 const entrySet=useMemo(()=>new Set(entryDates),[entryDates]);const openDay=(date:Date)=>router.push({pathname:'/day',params:{date:toDateKey(date)}});
 return <SafeAreaView style={styles.safe}><View style={styles.container}>
  <View style={styles.top}><View><Text style={styles.eyebrow}>SR JOURNAL</Text><Text style={styles.title}>Your private life.</Text><Text style={styles.subtitle}>Recorded locally on this device.</Text></View><View style={styles.badge}><Text style={styles.dot}>●</Text><Text style={styles.badgeText}>LOCAL</Text></View></View>
  <View style={styles.monthRow}><Pressable onPress={()=>setMonth(shiftMonth(month,-1))} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable><Text style={styles.month}>{formatMonthTitle(month)}</Text><Pressable onPress={()=>setMonth(shiftMonth(month,1))} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable></View>
  {loading?<View style={styles.loading}><ActivityIndicator color="#E7B7C4"/></View>:<Calendar days={days} entryDates={entrySet} selectedDate={toDateKey(new Date())} onPressDay={openDay} month={month}/>}
  <View style={styles.legend}><View style={styles.legendDot}/><Text style={styles.legendText}>journal entry</Text></View>
  <Pressable style={styles.recordButton} onPress={()=>router.push('/record')}><View style={styles.recordDot}/><View><Text style={styles.recordTitle}>Record a memory</Text><Text style={styles.recordSubtitle}>Camera + microphone • stored locally</Text></View><Text style={styles.plus}>+</Text></Pressable>
 </View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#0B0D12'},container:{flex:1,paddingHorizontal:20,paddingTop:12},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28},eyebrow:{color:'#C98A9E',fontSize:11,fontWeight:'800',letterSpacing:2.2,marginBottom:7},title:{color:'#F6F2F3',fontSize:29,fontWeight:'700',letterSpacing:-0.8},subtitle:{color:'#8E929D',fontSize:13,marginTop:6},badge:{borderWidth:1,borderColor:'#282C35',borderRadius:16,paddingHorizontal:10,paddingVertical:7,flexDirection:'row',gap:6,alignItems:'center'},dot:{color:'#8DC8A1',fontSize:9},badgeText:{color:'#A9AFB9',fontSize:9,fontWeight:'800',letterSpacing:1},monthRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},month:{color:'#F6F2F3',fontSize:20,fontWeight:'700'},arrow:{width:38,height:38,borderRadius:19,backgroundColor:'#151820',alignItems:'center',justifyContent:'center'},arrowText:{color:'#D8D1D5',fontSize:28,lineHeight:30,fontWeight:'300'},loading:{height:340,alignItems:'center',justifyContent:'center'},legend:{flexDirection:'row',alignItems:'center',gap:7,marginTop:12},legendDot:{width:6,height:6,borderRadius:3,backgroundColor:'#C98A9E'},legendText:{color:'#777C87',fontSize:11},recordButton:{marginTop:'auto',marginBottom:10,backgroundColor:'#171A22',borderWidth:1,borderColor:'#292D38',borderRadius:18,minHeight:76,paddingHorizontal:17,flexDirection:'row',alignItems:'center',gap:13},recordDot:{width:13,height:13,borderRadius:7,backgroundColor:'#C84E68'},recordTitle:{color:'#F3EEF0',fontSize:15,fontWeight:'700'},recordSubtitle:{color:'#818692',fontSize:11,marginTop:4},plus:{marginLeft:'auto',color:'#DDA9B7',fontSize:27,fontWeight:'300'}});
