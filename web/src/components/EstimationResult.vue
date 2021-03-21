<template>
  <section class="flex-1 flex flex-col px-4 justify-around items-center">
    <h1 class="text-sans text-xl font-medium my-4">{{ taskName }}</h1>
    <table
      class="table-fixed bg-gray-300 rounded-t text-center w-full lg:w-3/4"
    >
      <thead>
        <tr>
          <th class="p-2">Size</th>
          <th class="p-2">Votes</th>
          <th class="p-2 w-1/2">Voters</th>
        </tr>
      </thead>
      <tbody class="bg-gray-200">
        <tr
          class="last:rounded-b rounded"
          v-for="entry in estimationResultBySize"
          :key="entry.value"
        >
          <td class="p-2">
            <span class="text-2xl font-mono font-medium">{{
              entry.value
            }}</span>
          </td>
          <td class="p-2">{{ entry.names.length }}</td>
          <td class="p-2 flex justify-start overflow-x-auto">
            <participant-item
              v-for="name in entry.names"
              :key="name"
              :name="name"
              :hasVoted="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <img
      class="object-contain h-32 rounded my-2"
      alt="Consensus cats!"
      v-if="showConsensusCats"
      :src="catUrl"
    />
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ParticipantItem from '@/components/ParticipantItem.vue';

@Component({
  components: { ParticipantItem },
})
export default class EstimationResult extends Vue {
  get taskName() {
    return this.$store.state.estimationResult.taskName;
  }

  get showConsensusCats(): boolean {
    return (
      this.$store.state.room?.showCats &&
      this.estimationResultBySize.length == 1
    );
  }

  get catUrl(): string {
    return `https://thecatapi.com/api/images/get?format=src&type=gif&nocache=${new Date().toISOString()}`;
  }

  get estimationResultBySize(): { value: string; names: string[] }[] {
    return this.$store.getters.resultBySize!;
  }
}
</script>
