import * as Crypto from 'expo-crypto';

export async function makeId(): Promise<string> {
  const bytes = new Uint8Array(16);
  Crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
