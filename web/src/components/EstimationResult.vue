<template>
  <section class="flex-1 flex flex-col px-4 justify-around items-center">
    <h1 class="text-sans text-xl font-medium my-4">{{ taskName }}</h1>
    <table class="table-fixed bg-white text-center w-full max-w-lg rounded">
      <thead>
        <tr>
          <th class="p-2">Complexity</th>
          <th class="p-2">Votes</th>
          <th class="p-2 w-1/2">Voters</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in chartData" :key="entry.value">
          <td class="p-2">{{ entry.value }}</td>
          <td class="p-2">{{ entry.names.length }}</td>
          <td class="p-2 w-1/2 overflow-x-scroll">
            <div class="w-full flex justify-start">
              <div
                class="flex-none flex justify-center items-center w-16 h-16 shadow rounded-full mx-1 p-2 select-none bg-red-400"
                v-for="name in entry.names"
                :key="name"
              >
                <p class="text-center text-white font-medium text-sm overflow-x-hidden">{{ name }}</p>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <img
      class="object-contain h-32 rounded"
      alt="Consensus cats!"
      v-if="showConsensusCats"
      :src="catUrl"
    />
  </section>
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

    return data.sort((a, b) => {
      const aNumberOfVotes = parseInt(a.names.length, 10)
      const bNumberOfVotes = parseInt(b.names.length, 10)
      
      return aNumberOfVotes < bNumberOfVotes ? 1 : aNumberOfVotes > bNumberOfVotes ? -1 : 0
    });
  }
}
</script>
