export function safeGet(storage: Storage, key: string): string | null {
  try { return storage.getItem(key) } catch { return null }
}

export function safeSet(storage: Storage, key: string, value: string): void {
  try { storage.setItem(key, value) } catch { /* storage may be blocked/private */ }
}

export function safeRemove(storage: Storage, key: string): void {
  try { storage.removeItem(key) } catch { /* storage may be blocked/private */ }
}
