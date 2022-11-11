<template>
  <section class="flex-1 flex flex-col px-4 justify-around items-center">
    <h1 class="text-sans text-xl font-medium my-4">{{ taskName }}</h1>
    <table class="table-fixed bg-gray-300 rounded-t text-center w-full lg:w-3/4">
      <thead>
        <tr>
          <th class="p-2">Size</th>
          <th class="p-2">Votes</th>
          <th class="p-2 w-1/2">Voters</th>
        </tr>
      </thead>
      <tbody class="bg-gray-200">
        <tr
          v-for="entry in estimationResultBySize"
          :key="entry.value"
          class="last:rounded-b rounded"
        >
          <td class="p-2">
            <span class="text-2xl font-mono font-medium">{{ entry.value }}</span>
          </td>
          <td class="p-2">{{ entry.names.length }}</td>
          <td class="p-2 flex justify-start overflow-x-auto">
            <participant-item
              v-for="name in entry.names"
              :key="name"
              :name="name"
              :has-voted="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <img
      v-if="showConsensusCats"
      class="object-contain h-32 rounded my-2"
      alt="Consensus cats!"
      :src="catUrl"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Store, useStore } from 'vuex';
import ParticipantItem from '../components/ParticipantItem.vue';
import { State } from '../store/types';

const store: Store<State> = useStore();
const taskName = ref(store.state.estimationResult?.taskName);
const estimationResultBySize = ref(
  store.getters.resultBySize as { value: string; names: string[] }[]
);
const showConsensusCats = computed(
  () => store.state.room?.showCats && estimationResultBySize.value.length == 1
);

const catUrl = `https://thecatapi.com/api/images/get?format=src&type=gif&nocache=${new Date().toISOString()}`;

defineExpose({
  taskName,
  showConsensusCats,
  catUrl,
  estimationResultBySize,
});
</script>
