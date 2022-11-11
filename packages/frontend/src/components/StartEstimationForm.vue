<template>
  <form class="w-full flex-1 flex flex-col justify-center items-center p-4" @submit.prevent>
    <input
      v-model="newTaskName"
      class="p-2 mb-4 w-full lg:w-1/2 text-center text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
      placeholder="Task name"
    />
    <button
      class="m-2 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
      type="submit"
      :disabled="!taskNameIsSet"
      @click="startEstimation(newTaskName)"
    >
      <font-awesome-icon icon="play" />
      Start estimating
    </button>
    <button
      v-if="showEstimateAgainButton"
      class="m-2 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
      type="button"
      @click="startEstimation(previousTaskName)"
    >
      <font-awesome-icon icon="redo" />
      Estimate again for "{{ previousTaskName }}"
    </button>
  </form>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, ref } from 'vue';
import { Store, useStore } from 'vuex';
import { State } from '../store/types';

const store: Store<State> = useStore();
const newTaskName = ref('');

const taskNameIsSet = computed(() => newTaskName.value.length > 0);
const showEstimateAgainButton = computed(() => store.getters.resultBySize?.length > 1 ?? false);
const previousTaskName = computed(() => {
  if (typeof store.state.estimationResult === 'undefined') {
    return '';
  }

  return store.state.estimationResult.taskName;
});
const emits = defineEmits(['start-estimation']);
const startEstimation = (taskName: string) => {
  emits('start-estimation', taskName);
};

defineExpose({
  newTaskName,
  taskNameIsSet,
  showEstimateAgainButton,
  previousTaskName,
  startEstimation,
});
</script>
