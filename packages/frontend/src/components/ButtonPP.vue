<template>
  <button
    class="text-gray-700 m-2 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors duration-150 flex justify-center items-center flex-nowrap whitespace-nowrap"
    :class="buttonColorClass"
    type="button"
  >
    <span class="hidden lg:inline mr-2">{{ text }}</span>
    <font-awesome-icon :icon="iconName" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

const buttonColorClass = computed(() => {
  switch (props.color) {
    case 'gray-300':
      return 'bg-gray-300 hover:bg-gray-400';
    case 'codecentric-100':
      return 'bg-codecentric-100 hover:bg-codecentric-200';
    default:
      return 'bg-codecentric-100 hover:bg-codecentric-200';
  }
});
</script>
