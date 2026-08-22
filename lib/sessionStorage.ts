import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Auth storage for supabase-js. Native sessions go in SecureStore (not
 * AsyncStorage). Tokens can exceed SecureStore's ~2048 byte item limit, so
 * values are chunked. Web uses AsyncStorage because SecureStore is native-only.
 *
 * Never log values written here.
 */
const CHUNK_SIZE = 1800;

async function nativeGet(key: string): Promise<string | null> {
  const countRaw = await SecureStore.getItemAsync(`${key}.n`);
  if (!countRaw) {
    return SecureStore.getItemAsync(key);
  }
  const count = Number(countRaw);
  if (!Number.isFinite(count) || count < 1) return null;
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const part = await SecureStore.getItemAsync(`${key}.${i}`);
    if (part == null) return null;
    parts.push(part);
  }
  return parts.join('');
}

async function nativeSet(key: string, value: string): Promise<void> {
  await nativeRemove(key);
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  const count = Math.ceil(value.length / CHUNK_SIZE);
  await SecureStore.setItemAsync(`${key}.n`, String(count));
  for (let i = 0; i < count; i += 1) {
    await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }
}

async function nativeRemove(key: string): Promise<void> {
  const countRaw = await SecureStore.getItemAsync(`${key}.n`);
  await SecureStore.deleteItemAsync(key).catch(() => undefined);
  await SecureStore.deleteItemAsync(`${key}.n`).catch(() => undefined);
  const count = Number(countRaw);
  if (Number.isFinite(count) && count > 0) {
    for (let i = 0; i < count; i += 1) {
      await SecureStore.deleteItemAsync(`${key}.${i}`).catch(() => undefined);
    }
  }
}

export const authStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return nativeGet(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    return nativeSet(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    return nativeRemove(key);
  },
};
