<template>
  <div
    class="flex flex-col justify-center w-16 lg:w-20 h-24 lg:h-32 rounded-lg shadow cursor-pointer select-none"
    :class="selected ? 'bg-red-400 opacity-90' : 'bg-blue-400'"
  >
    <p class="absolute top-0 left-0 text-sm text-white px-1 font-mono">
      {{ value }}
    </p>
    <p class="text-white font-medium text-2xl text-center font-mono">
      {{ value }}
    </p>
    <p class="absolute bottom-0 right-0 transform rotate-180 text-sm text-white px-1 font-mono">
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

<style scoped>
.bg-red-400 {
  cursor: default;
}
</style>
