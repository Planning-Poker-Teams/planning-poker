<template>
  <template v-if="!consensusReached">
    <table class="table-fixed bg-gray-300 rounded-t text-center w-full lg:w-3/4">
      <thead>
        <tr>
          <th class="p-2 w-1/6">
            <font-awesome-icon icon="coins" class="pr-4" />
            <sortable-table-header
              column="size"
              :active-dir="sortDir"
              :active-col="sortCol"
              @on-click="sortColumn('size')"
              >Option</sortable-table-header
            >
          </th>
          <th class="p-2 w-1/6">
            <font-awesome-icon icon="users" class="pr-4" />
            <sortable-table-header
              column="votes"
              :active-dir="sortDir"
              :active-col="sortCol"
              @on-click="sortColumn('votes')"
              >#Votes</sortable-table-header
            >
          </th>
          <th class="p-2">
            <font-awesome-icon icon="chart-pie" class="pr-4" />
            <sortable-table-header
              column="agreement"
              :active-dir="sortDir"
              :active-col="sortCol"
              @on-click="sortColumn('agreement')"
              >Votes</sortable-table-header
            >
          </th>
          <th class="p-2">Voters</th>
        </tr>
      </thead>
      <tbody class="bg-gray-200">
        <tr v-for="entry in sortedEntries" :key="entry.value" class="last:rounded-b rounded">
          <td class="p-2">
            <span class="text-2xl font-mono font-medium">{{ entry.value }}</span>
          </td>
          <td class="p-2">{{ entry.names.length }}</td>
          <td class="p-2">
            <Progressbar
              class="progress-bar"
              :total-step="store.state.estimationResult?.estimates.length || 1"
              :current-step="entry.names.length"
              :show-footer="false"
              :with-label="true"
              :bar-color="'#2d3748'"
              :font-color="'white'"
            ></Progressbar>
          </td>
          <td class="p-2 flex justify-start overflow-x-auto">
            <participant-item
              v-for="name in entry.names"
              :key="name"
              :name="name"
              :has-voted="hasVoted(entry.value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </template>

  <template v-if="consensusReached">
    <div class="text-xl font-sans m-2 text-center">
      <span class="font-bold">Consensus Reached! 🎉</span><br /><br />
      <span class="">{{
        sortedEntries[0]?.value
          ? `All ${sortedEntries[0]?.names.length} participants voted for option ${sortedEntries[0]?.value}.`
          : `All ${sortedEntries[0]?.names.length} participants were too confused to select anything. 🧐`
      }}</span>
    </div>
    <img
      v-if="showConsensusCats"
      class="object-contain h-80 rounded my-2"
      alt="Consensus cats!"
      :src="catUrl"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { Store, useStore } from 'vuex';
import { useStorage } from '../hooks/useStorage';
import { State } from '../store/types';
import ParticipantItem from './ParticipantItem.vue';
import Progressbar from './Progressbar.vue';
import SortableTableHeader from './SortableTableHeader.vue';

type SortDir = 'up' | 'down';
type SortCol = 'votes' | 'size' | 'agreement';
type Entry = { value: string; names: string[] };
type Entries = Entry[];

const store: Store<State> = useStore();
const taskName = ref(store.state.estimationResult?.taskName);
const cardDeck = ref(store.state.cardDeck);
const estimationResultBySize = toRef(store.getters, 'resultBySize');

const storedSortDir = useStorage('sortDir');
const storedSortCol = useStorage('sortCol');
const sortDir = ref<SortDir>(storedSortDir.value || 'up');
const sortCol = ref<SortCol>(storedSortCol.value || 'size');

const sortFunctions = {
  size: (e1: Entry, e2: Entry): number =>
    cardDeck.value.indexOf(e1.value) - cardDeck.value.indexOf(e2.value),
  votes: (e1: Entry, e2: Entry): number => (e1.names.length < e2.names.length ? -1 : 1),
  agreement: (e1: Entry, e2: Entry): number => (e1.names.length < e2.names.length ? -1 : 1),
};

const sortedEntries = computed((): Entries => {
  return [...estimationResultBySize.value]
    .sort((e1, e2): number => {
      const dirModifier = sortDir.value === 'down' ? -1 : 1;
      return sortFunctions[sortCol.value](e1, e2) * dirModifier;
    })
    .filter(entry => entry.value);
});

const showConsensusCats = computed(
  () => store.state.room?.showCats && estimationResultBySize.value.length == 1
);
const consensusReached = computed(() => estimationResultBySize.value.length == 1);

const hasVoted = (vote?: string): boolean => typeof vote !== 'undefined';

const sortColumn = (column: SortCol) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === 'up' ? 'down' : 'up';
  } else {
    sortCol.value = column;
  }

  storedSortDir.value = sortDir.value;
  storedSortCol.value = sortCol.value;
};

const catUrl = `https://thecatapi.com/api/images/get?format=src&type=gif&nocache=${new Date().toISOString()}`;

defineExpose({
  taskName,
  showConsensusCats,
  catUrl,
  estimationResultBySize,
});
</script>
