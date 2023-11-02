<template>
  <button
    class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
    :class="`bg-${color} border-${color}`"
    type="button"
  >
    <span class="hidden lg:inline mr-2">{{ text }}</span>
    <font-awesome-icon :icon="iconName" />
  </button>
</template>

<script setup lang="ts">
defineProps({
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
</script>
