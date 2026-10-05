import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { isAppLockEnabled } from '@/security/security';

export function AppLock({ children }: { children: React.ReactNode }) {
  const [state,setState]=useState<'checking'|'locked'|'unlocked'>('checking');

  const authenticate=async()=>{
    try {
      const enabled=await isAppLockEnabled();
      if(!enabled){setState('unlocked');return;}
      const hasHardware=await LocalAuthentication.hasHardwareAsync();
      const enrolled=await LocalAuthentication.isEnrolledAsync();
      if(!hasHardware || !enrolled){setState('unlocked');return;}
      const result=await LocalAuthentication.authenticateAsync({
        promptMessage:'Unlock SR Journal',
        promptDescription:'Your journal stays protected on this device.',
        biometricsSecurityLevel:'strong',
        disableDeviceFallback:false
      });
      setState(result.success?'unlocked':'locked');
    } catch { setState('locked'); }
  };

  useEffect(()=>{authenticate();},[]);

  if(state==='unlocked') return <>{children}</>;
  return <View style={styles.screen}>
    <Text style={styles.eyebrow}>SR JOURNAL</Text>
    <Text style={styles.title}>Private by default.</Text>
    <Text style={styles.body}>Unlock to access your journal.</Text>
    {state==='checking' ? <ActivityIndicator color="#C98A9E"/> :
      <Pressable style={styles.button} onPress={authenticate}><Text style={styles.buttonText}>Unlock</Text></Pressable>}
  </View>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#0B0D12',alignItems:'center',justifyContent:'center',padding:24},eyebrow:{color:'#C98A9E',fontSize:11,fontWeight:'800',letterSpacing:2.2},title:{color:'#F7F3F4',fontSize:28,fontWeight:'700',marginTop:12},body:{color:'#8F949E',fontSize:14,marginTop:8,marginBottom:24},button:{backgroundColor:'#C98A9E',paddingHorizontal:28,paddingVertical:13,borderRadius:14},buttonText:{color:'#1B1216',fontWeight:'800'}});