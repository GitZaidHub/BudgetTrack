import { useState, useEffect } from 'react';

/**
 * Like useState, but reads its initial value from localStorage and
 * writes back to it on every change. Falls back to `defaultValue`
 * if nothing is stored yet, or if the stored value is corrupted.
 */
const usePersistedState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can throw in rare cases (quota exceeded, private
      // browsing restrictions in some browsers) — failing silently
      // here just means the preference won't persist, not a crash.
    }
  }, [key, value]);

  return [value, setValue];
};

export default usePersistedState;