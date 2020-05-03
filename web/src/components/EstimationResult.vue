<template>
  <div class="flex flex-col pt-4 justify-center items-center">
    <h1 class="text-sans text-xl font-medium">
      {{ taskName }}
    </h1>
    <div class="flex flex-row flex-wrap justify-center items-center">
      <bar-chart
        class="m-2 p-2 max-w-md rounded bg-gray-200 border"
        v-bind:estimation-data="chartData"
      />
      <img
        class="m-2 object-contain h-32 rounded"
        alt="Consensus cats!"
        v-if="showConsensusCats"
        :src="catUrl"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import BarChart from '@/components/BarChart.vue';
import { Estimate } from '../store/types';

@Component({
  components: { BarChart },
})
export default class EstimationResult extends Vue {
  get taskName() {
    return this.$store.state.estimationResult.taskName;
  }

  get showConsensusCats(): boolean {
    return this.$store.state.room?.showCats && this.chartData.length == 1;
  }

  get catUrl(): string {
    return `https://thecatapi.com/api/images/get?format=src&type=gif&nocache=${new Date().toISOString()}`;
  }

  get chartData(): { value: string; names: string[] }[] {
    const data = this.$store.state.estimationResult.estimates.reduce(
      (
        accumulator: { value: string; names: string[] }[],
        estimate: Estimate
      ) => {
        const value = estimate.estimate;
        const existingEntry = accumulator.find(e => e.value == value);
        if (existingEntry) {
          return accumulator.map(e => {
            if (e.value == value) {
              return { ...e, names: [...e.names, estimate.userName] };
            } else {
              return e;
            }
          });
        } else {
          return [...accumulator, { value, names: [estimate.userName] }];
        }
      },
      []
    );

    return data;
  }
}
</script>
