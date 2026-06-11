<template>
  <div
    class="relative overflow-hidden flex flex-col justify-center w-16 lg:w-20 h-24 lg:h-32 rounded-lg shadow select-none box-border border-4"
    :class="
      selected
        ? 'bg-codecentric-100 border-gray-800 cursor-default'
        : 'bg-blue-400 border-blue-400 cursor-pointer'
    "
    :title="selected ? selectedTitle : undefined"
  >
    <p class="absolute top-0 left-0 text-sm leading-none p-1 font-mono" :class="cardTextColor">
      {{ value }}
    </p>
    <p class="font-medium text-2xl text-center font-mono" :class="cardTextColor">
      {{ value }}
    </p>
    <p
      class="absolute bottom-0 right-0 rotate-180 text-sm leading-none p-1 font-mono"
      :class="cardTextColor"
    >
      {{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
  selectedTitle: {
    type: String,
    default: 'Your current selection',
  },
});

const cardTextColor = computed(() => (props.selected ? 'text-gray-800' : 'text-white'));
</script>
