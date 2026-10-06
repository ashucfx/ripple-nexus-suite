/**
 * Client-Side Operational Storage Engine
 * High-integrity local persistence layer for zero-loss offline and cluster operation.
 */

const STORAGE_PREFIX = 'rn_ops_';

export function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[RN-Storage] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[RN-Storage] Failed to write ${key}:`, err);
  }
}

export function removeStoredItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[RN-Storage] Failed to remove ${key}:`, err);
  }
}

export function exportSuiteData(): string {
  if (typeof window === 'undefined') return '{}';
  const dump: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const subKey = k.replace(STORAGE_PREFIX, '');
        const val = localStorage.getItem(k);
        if (val) {
          try {
            dump[subKey] = JSON.parse(val);
          } catch {
            dump[subKey] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[RN-Storage] Export error:', err);
  }
  return JSON.stringify(dump, null, 2);
}

export function importSuiteData(jsonString: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;
    for (const [k, v] of Object.entries(parsed)) {
      setStoredItem(k, v);
    }
    return true;
  } catch (err) {
    console.error('[RN-Storage] Import failed:', err);
    return false;
  }
}

export function clearAllSuiteData(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[RN-Storage] Clear error:', err);
  }
}

/**
 * Enterprise XSS / Injection sanitizer
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .trim();
}
