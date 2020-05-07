<template>
  <form @submit.prevent class="flex-1 flex flex-col justify-center items-center p-4">
    <input
      class="p-2 mb-4 w-full max-w-lg text-center text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
      placeholder="Task name"
      v-model="newTaskName"
    />
    <button
      class="px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
      type="submit"
      :disabled="!taskNameIsSet"
      @click="startEstimation()"
    >Start estimating</button>
  </form>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class StartEstimationForm extends Vue {
  newTaskName = '';

  get taskNameIsSet() {
    return this.newTaskName.length > 0;
  }

  startEstimation() {
    this.$emit('start-estimation', this.newTaskName);
  }
}
</script>
