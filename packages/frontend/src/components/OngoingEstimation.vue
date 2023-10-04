<template>
  <TaskHeader :task-name="taskName" :task-status="'Estimation'"></TaskHeader>
  <section
    class="w-full flex-1 flex flex-col lg:flex-row justify-evenly gap-10 items-center p-4 box-border"
  >
    <div class="flex justify-center lg:h-80 w-80 box-border">
      <div
        ref="cardTargetField"
        class="min-h-24 w-full max-w-lg flex justify-center items-center rounded border-4 border-gray-300 border-dashed"
      >
        <p
          class="text-2xl font-medium font-sans text-center text-gray-800 p-10"
        >
          Place your vote!
        </p>
      </div>
    </div>

    <div v-if="!isSpectator" class="grid grid-cols-5 gap-x-2 gap-y-2 mb-4">
      <card
        v-for="(value, index) in currentCardDeck"
        :ref="
          (el) => {
            // @ts-ignore TODO: create proper typing for cardRefList
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
import { onBeforeUpdate, PropType, Ref, ref, toRef, VueElement } from "vue";
import { Store, useStore } from "vuex";
import { State } from "../store/types";
import Card from "./Card.vue";
import useCardAnimation, { translates } from "./CardAnimation";
import TaskHeader from "./TaskHeader.vue";

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
const emits = defineEmits(["send-estimation", "request-result"]);
const store: Store<State> = useStore();
const votingIsComplete: Ref<boolean> = toRef(store.getters, "votingIsComplete");
const isSpectator = ref(store.state.room?.isSpectator);
const cardTargetField: Ref<Element | undefined> = ref(undefined);
const selectedEstimation: Ref<number | undefined> = ref(undefined);
const cardRefList: Ref<VueElement[]> = ref([]);
onBeforeUpdate(() => {
  cardRefList.value = [];
});

let lastSelectedCard: VueElement | undefined;
let lastCardMovement: translates;
const sendEstimation = (value: string, index: number) => {
  if (selectedEstimation.value !== index) {
    try {
      const { animateCardSelection } = useCardAnimation(
        cardRefList.value[index],
        cardTargetField
      );

      lastCardMovement = animateCardSelection(
        lastSelectedCard,
        lastCardMovement
      );
      lastSelectedCard = cardRefList.value[index];
    } catch (error) {
      console.warn("Card selection could not be animated", error);
    }

    selectedEstimation.value = index;
  }

  emits("send-estimation", value);
};

defineExpose({
  votingIsComplete,
  isSpectator,
  selectedEstimation,
  sendEstimation,
  cardRefList,
  cardTargetField,
});
</script>
