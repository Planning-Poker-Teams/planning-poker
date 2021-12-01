<template>
  <label :for="id" class="flex items-center cursor-pointer">
    <div class="relative">
      <input
        :id="id"
        class="hidden"
        type="checkbox"
        :checked="value"
        @change="onChange($event.target.checked)"
      />
      <div
        class="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner"
      ></div>
      <div
        class="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0"
      ></div>
    </div>
    <div class="ml-3 text-lg font-semi select-none text-gray-700">
      {{ label }}
    </div>
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['input'],
  setup(props, context) {
    const onChange = (value: boolean) => {
      context.emit('input', value);
    };

    return {
      onChange,
    };
  },
});
</script>

<style scoped>
.toggle__dot {
  top: -0.25rem;
  left: -0.25rem;

  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

input:checked ~ .toggle__dot {
  transform: translateX(100%);
  background-color: #1edf9f;
}
</style>
