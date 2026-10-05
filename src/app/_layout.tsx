import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '@/db/database';
import { getDatabaseKey } from '@/security/security';
import { AppLock } from '@/security/lock';

async function initSecureDatabase(db: Parameters<typeof initDatabase>[0]) {
  const key = await getDatabaseKey();
  await db.execAsync(`PRAGMA key = '${key}';`);
  await initDatabase(db);
}

export default function RootLayout() {
  return <SQLiteProvider databaseName="sr-journal-secure.db" onInit={initSecureDatabase}>
    <StatusBar style="light" />
    <AppLock>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0D12' } }} />
    </AppLock>
  </SQLiteProvider>;
}
