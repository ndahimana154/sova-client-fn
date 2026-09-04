import { profileApi } from './profileApi'

const KEY = 'sova-video-autoplay-next'

/** Signed-out viewers keep the choice in this browser; signed-in ones in their profile. */
export function readLocalAutoPlayNext(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function writeLocalAutoPlayNext(value: boolean): void {
  try {
    localStorage.setItem(KEY, String(value))
  } catch {
    // A private window can refuse storage; the preference just will not persist.
  }
}

export async function saveAutoPlayNext(value: boolean, authenticated: boolean): Promise<void> {
  writeLocalAutoPlayNext(value)
  if (!authenticated) return
  await profileApi.update({ autoPlayNext: value }).catch(() => undefined)
}
