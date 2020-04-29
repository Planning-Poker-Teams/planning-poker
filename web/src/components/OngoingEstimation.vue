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
      </div>
    </div>

    <!-- Cards -->
    <div
      class="row-span-2 flex flex-wrap px-8 pb-8 justify-center items-end overflow-scroll"
    >
      <div v-for="value in possibleEstimationValues" :key="value">
        <div
          class="flex flex-col justify-center w-20 h-32 m-1 rounded-lg shadow cursor-pointer select-none bg-blue-400"
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

  sendEstimation(value: string) {
    this.$emit('send-estimation', value);
  }
}
</script>
