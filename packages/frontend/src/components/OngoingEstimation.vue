<template>
  <confirm-show-results-dialog
    v-if="showConfirmDialog"
    @on_confirm="requestResult"
    @on_cancel="closeConfirmDialog"
  />
  <section class="flex-1 flex flex-col items-center p-4">
    <div class="w-full flex justify-center lg:pt-4 pb-4 lg:pb-8">
      <div
        ref="cardTargetField"
        class="min-h-24 w-full max-w-lg flex justify-center items-center rounded border-4 border-gray-300 border-dashed"
      >
        <p class="text-2xl font-medium font-sans text-center text-gray-800 p-2">
          {{ taskName }}
        </p>
      </div>
      <button
        class="mx-2 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
        type="submit"
        @click="handleSubmitResult"
      >
        Show result
      </button>
    </div>

    <div v-if="!isSpectator" class="grid grid-cols-4 gap-x-2 gap-y-2 mb-4">
      <card
        v-for="(value, index) in currentCardDeck"
        :ref="
          el => {
            cardRefList[index] = el;
          }
        "
        :key="value"
        :value="value"
        :selected="index == selectedEstimation"
        @click="sendEstimation(value, index)"
      >
      </card>
    </div>
    <div v-else class="row-span-2 flex items-center justify-center">
      <p class="font-medium text-4xl text-gray-500">Participants are voting</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUpdate, PropType, Ref, ref, toRef, VueElement } from 'vue';
import { Store, useStore } from 'vuex';
import { State } from '../store/types';
import Card from './Card.vue';
import useCardAnimation, { translates } from './CardAnimation';
import ConfirmShowResultsDialog from './ConfirmShowResultsDialog.vue';

defineProps({
  taskName: {
    type: String,
    required: true,
  },
  currentCardDeck: {
    type: Array as PropType<string[]>,
    required: true,
  },
});
const emits = defineEmits(['send-estimation', 'request-result']);
const store: Store<State> = useStore();
const votingIsComplete: Ref<boolean> = toRef(store.getters, 'votingIsComplete');
const isSpectator = ref(store.state.room?.isSpectator);
const showConfirmDialog = ref(false);
const cardTargetField: Ref<Element | undefined> = ref(undefined);
const selectedEstimation: Ref<number | undefined> = ref(undefined);
const cardRefList: Ref<VueElement[]> = ref([]);
onBeforeUpdate(() => {
  cardRefList.value = [];
});

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
};

const handleSubmitResult = () => {
  if (votingIsComplete.value) {
    return requestResult();
  }

  showConfirmDialog.value = true;
};

const requestResult = () => {
  showConfirmDialog.value = false;
  emits('request-result');
};

let lastSelectedCard: VueElement | undefined;
let lastCardMovement: translates;
const sendEstimation = (value: string, index: number) => {
  if (selectedEstimation.value !== index) {
    try {
      const { animateCardSelection } = useCardAnimation(cardRefList.value[index], cardTargetField);

      lastCardMovement = animateCardSelection(lastSelectedCard, lastCardMovement);
      lastSelectedCard = cardRefList.value[index];
    } catch (error) {
      console.warn('Card selection could not be animated', error);
    }

    selectedEstimation.value = index;
  }

  emits('send-estimation', value);
};

defineExpose({
  votingIsComplete,
  requestResult,
  isSpectator,
  selectedEstimation,
  sendEstimation,
  cardRefList,
  cardTargetField,
});
</script>
