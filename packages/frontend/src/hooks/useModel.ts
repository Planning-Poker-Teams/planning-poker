import { computed } from 'vue';
export function useModel(props: { [key: string]: any }, emit: Function, name = 'modelValue') {
  return computed({
    get: () => props[name],
    set: value => emit(`update:${name}`, value),
  });
}
