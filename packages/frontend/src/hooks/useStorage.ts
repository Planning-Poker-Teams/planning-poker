import {computed} from 'vue';
export function useStorage(key: string) {
  return computed({
    get: () => {
      const value = localStorage.getItem(key);
      if (value === null) return '';
      return JSON.parse(value);
    },
    set: value => {
      localStorage.setItem(key, JSON.stringify(value));
    },
  });
}
