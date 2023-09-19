<template>
  <div
    class="w-full min-h-16 flex justify-center items-center relative overflow-hidden"
  >
    <div class="w:3/5 flex-1 text-xl m-5 font-sans">
      <span class="font-bold">{{ taskName }} - </span>
      <span class="">{{ taskStatus }}</span>
    </div>

    <div
      id="controlArea"
      class="absolute top-0 right-0 w-5/12 flex justify-end"
    >
      <button
        class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-codecentric-100 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
        type="button"
        @click="console.log('TODO')"
      >
        <span class="hidden lg:inline mr-2">New Task</span>
        <font-awesome-icon icon="fa-plus" />
      </button>

      <button
        class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-codecentric-100 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
        type="button"
        @click="console.log('TODO')"
      >
        <span class="hidden lg:inline mr-2">Restart</span>
        <font-awesome-icon icon="fa-undo" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, toRef } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();

const props = defineProps({
  taskName: {
    type: String,
    required: true,
  },
  taskStatus: {
    type: String,
    required: true,
  },
});

defineExpose({});
</script>
