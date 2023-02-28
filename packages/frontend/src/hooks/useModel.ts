import { computed } from 'vue';
// eslint-disable-next-line @typescript-eslint/ban-types
export function useModel(props: { [key: string]: unknown }, emit: Function, name = 'modelValue') {
  return computed({
    get: () => props[name],
    set: value => emit(`update:${name}`, value),
  });
}
