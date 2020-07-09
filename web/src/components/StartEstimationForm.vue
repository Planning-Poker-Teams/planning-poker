<template>
  <form
    @submit.prevent
    class="w-full flex-1 flex flex-col justify-center items-center p-4"
  >
    <input
      class="p-2 mb-4 w-full lg:w-1/2 text-center text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
      placeholder="Task name"
      v-model="newTaskName"
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
      class="m-2 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
      type="button"
      v-if="showEstimateAgainButton"
      @click="startEstimation(previousTaskName)"
    >
      <font-awesome-icon icon="redo" />
      Estimate again for "{{ previousTaskName }}"
    </button>
  </form>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

@Component({
  components: { FontAwesomeIcon },
})
export default class StartEstimationForm extends Vue {
  newTaskName = '';

  get taskNameIsSet() {
    return this.newTaskName.length > 0;
  }

  get showEstimateAgainButton() {
    return this.$store.getters.resultByComplexity?.length > 1 ?? false;
  }

  get previousTaskName(): string | undefined {
    return this.$store.state.estimationResult?.taskName;
  }

  startEstimation(taskName: string) {
    this.$emit('start-estimation', taskName);
  }
}
</script>
