<template>
  <div
    class="bg-blue-400 flex flex-col justify-center w-16 lg:w-20 h-24 lg:h-32 rounded-lg shadow select-none"
    :class="selected ? 'opacity-90 cursor-default' : 'cursor-pointer'"
  >
    <p class="absolute top-0 left-0 text-sm text-white px-1 font-mono">
      {{ value }}
    </p>
    <p class="text-white font-medium text-2xl text-center font-mono">
      {{ value }}
    </p>
    <p class="absolute bottom-0 right-0 rotate-180 text-sm text-white px-1 font-mono">
      {{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  value: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
});
</script>
