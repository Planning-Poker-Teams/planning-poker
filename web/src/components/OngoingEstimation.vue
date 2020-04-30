<template>
  <div class="h-full grid grid-rows-3 bg-green-400x">
    <!-- Drop zone -->
    <div class="flex justify-center items-center">
      <div
        class="h-32 w-64 flex flex-col justify-center rounded border-4 border-gray-300 border-dashed"
      >
        <p class="text-2xl font-medium font-sans text-center text-gray-800">
          {{ taskName }}
        </p>
        <button
          class="m-2 p-2 bg-gray-300 hover:bg-gray-100 text-2xl text-gray-700 py-2 px-4 border-4 border-gray-300 rounded"
          type="submit"
          v-if="votingIsComplete"
          @click="requestResult"
        >
          Show result
        </button>
      </div>
    </div>

    <!-- Cards -->
    <div
      class="row-span-2 flex flex-wrap px-8 pb-8 justify-center items-end overflow-scroll"
    >
      <div v-for="value in possibleEstimationValues" :key="value">
        <div
          class="flex flex-col justify-center w-20 h-32 m-1 rounded-lg shadow cursor-pointer select-none"
          v-bind:class="
            value == selectedEstimation ? 'bg-red-400' : 'bg-blue-400'
          "
          @click="sendEstimation(value)"
        >
          <p class="text-white font-medium text-2xl text-center font-mono">
            {{ value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class OngoingEstimation extends Vue {
  @Prop() taskName!: string;
  selectedEstimation = '';

  possibleEstimationValues = [
    '0',
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '20',
    '40',
    '100',
    '???',
  ];

  get votingIsComplete() {
    return this.$store.getters.votingIsComplete;
  }

  sendEstimation(value: string) {
    this.selectedEstimation = value;
    this.$emit('send-estimation', value);
  }

  requestResult() {
    this.$emit('request-result');
  }
}
</script>
