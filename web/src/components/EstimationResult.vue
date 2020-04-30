<template>
  <div class="flex flex-col pt-4 justify-center items-center">
    <h1 class="font-bold text-sans text-2xl">{{ taskName }}</h1>
    <div class="p-4 md:w-2/3">
      <bar-chart v-bind:estimation-data="chartData" />
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
