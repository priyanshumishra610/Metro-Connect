import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

import { track } from '@/services/analytics';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'failed';

export interface UpdateState {
  status: UpdateStatus;
  isCritical: boolean;
  error: string | null;
}

const LAST_RELOAD_KEY = 'metroconnect.ota.lastReloadId';

function readCriticalFlag(manifest: { extra?: Record<string, unknown> } | null | undefined): boolean {
  if (!manifest) return false;
  const extra = manifest.extra;
  if (!extra) return false;
  if (extra.criticalUpdate === true) return true;
  const expoClient = extra.expoClient as { extra?: Record<string, unknown> } | undefined;
  return expoClient?.extra?.criticalUpdate === true;
}

function updateIdOf(manifest: { id?: string } | null | undefined): string | null {
  if (!manifest) return null;
  if (typeof manifest.id === 'string') return manifest.id;
  return null;
}

/**
 * OTA check is non-blocking. Normal updates download in the background and
 * apply on the next cold start. Critical updates (manifest extra.criticalUpdate)
 * surface a restart prompt. Reload is attempted at most once per update id.
 */
export async function checkForAppUpdate(): Promise<UpdateState> {
  if (__DEV__ || !Updates.isEnabled) {
    return { status: 'idle', isCritical: false, error: null };
  }

  try {
    track('update_checked');
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      return { status: 'idle', isCritical: false, error: null };
    }

    const isCritical = readCriticalFlag(result.manifest as { extra?: Record<string, unknown> });
    const id = updateIdOf(result.manifest as { id?: string });
    const lastReload = await AsyncStorage.getItem(LAST_RELOAD_KEY);
    if (id && lastReload === id) {
      return { status: 'failed', isCritical, error: 'reload_loop_guard' };
    }

    try {
      const downloaded = await Updates.fetchUpdateAsync();
      if (!downloaded.isNew) {
        return { status: 'idle', isCritical: false, error: null };
      }
      track('update_downloaded');
      return { status: 'ready', isCritical, error: null };
    } catch {
      track('update_failed', { reason: 'download' });
      return { status: 'failed', isCritical: false, error: 'download' };
    }
  } catch {
    track('update_failed', { reason: 'check' });
    return { status: 'failed', isCritical: false, error: 'check' };
  }
}

export async function applyDownloadedUpdate(): Promise<void> {
  if (__DEV__ || !Updates.isEnabled) return;
  const id = updateIdOf(Updates.manifest as { id?: string });
  if (id) await AsyncStorage.setItem(LAST_RELOAD_KEY, id);
  track('update_applied');
  await Updates.reloadAsync();
}

export function currentlyEmbeddedLaunch(): boolean {
  if (!Updates.isEnabled) return true;
  return Updates.isEmbeddedLaunch;
}
