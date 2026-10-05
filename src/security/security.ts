import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DB_KEY = 'srj.sqlcipher.key.v1';
const LOCK_KEY = 'srj.app-lock.enabled.v1';

export async function getDatabaseKey() {
  let key = await SecureStore.getItemAsync(DB_KEY);
  if (!key) {
    const bytes = new Uint8Array(32);
    Crypto.getRandomValues(bytes);
    key = Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    await SecureStore.setItemAsync(DB_KEY,key,{keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  }
  return key;
}

export async function isAppLockEnabled() {
  const value = await SecureStore.getItemAsync(LOCK_KEY);
  return value !== 'false';
}

export async function setAppLockEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(LOCK_KEY,enabled ? 'true' : 'false',{keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
}
