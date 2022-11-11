<template>
  <form class="w-full flex-1 flex flex-col justify-center items-center p-4" @submit.prevent>
    <input
      v-model="newTaskName"
      class="p-2 mb-4 w-full lg:w-1/2 text-center text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
      placeholder="Task name"
    />
    <Button type="submit" :disabled="!taskNameIsSet" @click="startEstimation(newTaskName)">
      <font-awesome-icon icon="play" />
      Start estimating
    </Button>
    <Button v-if="showEstimateAgainButton" type="button" @click="startEstimation(previousTaskName)">
      <font-awesome-icon icon="redo" />
      Estimate again for "{{ previousTaskName }}"
    </Button>
  </form>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, ref } from 'vue';
import { Store, useStore } from 'vuex';
import { State } from '../store/types';
import Button from './Button.vue';

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
