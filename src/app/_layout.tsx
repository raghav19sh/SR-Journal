import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '@/db/database';

export default function RootLayout() {
  return <SQLiteProvider databaseName="sr-journal.db" onInit={initDatabase}><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0D12' } }} /></SQLiteProvider>;
}
