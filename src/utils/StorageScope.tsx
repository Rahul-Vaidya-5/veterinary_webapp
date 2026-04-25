import { createContext, useContext } from 'react';

/**
 * Provides a localStorage key prefix for storage isolation.
 * - '' (empty) → main doctor (no prefix, reads/writes the global keys)
 * - 'p_{partnerId}_' → partner doctor's private data
 *
 * Example: useStorageScope() + 'vc_appointments' gives the scoped key.
 */
const StorageScopeContext = createContext<string>('');

export const StorageScopeProvider = StorageScopeContext.Provider;

/** Returns the current storage prefix ('p_{id}_' for partner, '' for main doctor). */
export const useStorageScope = () => useContext(StorageScopeContext);
