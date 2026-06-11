import { computed } from 'vue';
export function useStorage(key: string) {
  const storage =
    typeof localStorage !== 'undefined' &&
    typeof localStorage.getItem === 'function' &&
    typeof localStorage.setItem === 'function'
      ? localStorage
      : undefined;

  return computed({
    get: () => {
      const value = storage?.getItem(key);
      if (value === null) return '';
      if (typeof value === 'undefined') return '';
      return JSON.parse(value);
    },
    set: value => {
      storage?.setItem(key, JSON.stringify(value));
    },
  });
}
