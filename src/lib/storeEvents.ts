import { useSyncExternalStore } from 'react';

let version = 0;
const listeners = new Set<() => void>();

export function emitStoreChange(): void {
  version += 1;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getVersion(): number {
  return version;
}

/**
 * Subscribes the component to all store mutations.
 * Returns a monotonically increasing version number; call store getters
 * after subscribing to read fresh data.
 */
export function useStoreData(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}
