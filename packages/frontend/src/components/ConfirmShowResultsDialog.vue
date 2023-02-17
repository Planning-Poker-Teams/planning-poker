<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
  >
    <div class="mx-auto p-5 border w-2/4 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <p class="text-lg leading-6 font-medium text-gray-900">
          Not everyone has has voted yet. Are you sure?
        </p>
        <div class="w-5/6 mx-auto items-center px-4 py-3">
          <button
            class="mr-1 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="confirm"
          >
            OK
          </button>
          <button
            class="ml-1 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits(['on_confirm', 'on_cancel']);

const confirm = () => emits('on_confirm');
const cancel = () => emits('on_cancel');
</script>
