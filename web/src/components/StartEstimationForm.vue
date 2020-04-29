<template>
  <div class="h-full flex justify-center items-center bg-red-700x">
    <form @submit.prevent>
      <input
        class="m-2 p-2 text-2xl font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
        placeholder="Task name"
        v-model="newTaskName"
      />
      <button
        class="p-2 bg-gray-300 hover:bg-gray-100 text-2xl text-gray-700 py-2 px-4 border-4 border-gray-300 rounded"
        type="submit"
        @click="startEstimation()"
      >
        Start estimating
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class StartEstimationForm extends Vue {
  newTaskName = '';

  startEstimation() {
    this.$emit('start-estimation', this.newTaskName);
  }
}
</script>
