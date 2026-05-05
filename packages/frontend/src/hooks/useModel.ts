import { computed } from 'vue';

export function useModel(
  props: { [key: string]: unknown },
  emit: (event: string, value: unknown) => void,
  name = 'modelValue'
) {
  return computed({
    get: () => props[name],
    set: value => emit(`update:${name}`, value),
  });
}
