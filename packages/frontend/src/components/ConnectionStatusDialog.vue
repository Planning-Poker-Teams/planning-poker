<template>
  <div
    v-if="show"
    class="fixed z-10 inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="connection-status-dialog"
  >
    <div
      class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] border-codecentric-200"
      role="status"
    >
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: true,
  },
});
</script>
