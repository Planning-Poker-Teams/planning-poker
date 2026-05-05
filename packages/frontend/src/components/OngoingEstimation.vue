<template>
  <LayoutGroup id="ongoing-estimation">
    <section
      class="w-full flex-1 flex flex-col lg:flex-row justify-evenly gap-10 items-center p-4 box-border"
    >
      <div class="flex justify-center lg:h-80 w-80 box-border">
        <div
          data-testid="card-target-field"
          class="min-h-24 w-full max-w-lg flex justify-center items-center rounded border-4 border-gray-300 border-dashed"
        >
          <motion.div
            v-if="selectedEstimateValue"
            :key="`selected-${selectedEstimateValue}`"
            class="relative z-20"
            :layout-id="cardLayoutId(selectedEstimateValue)"
            :layout="true"
            :animate="{ rotate: selectedCardRotation }"
            :initial="false"
            :transition="cardTransition"
          >
            <card
              data-testid="selected-estimation-card"
              :value="selectedEstimateValue"
              :selected="true"
            />
          </motion.div>
          <p v-else class="text-2xl font-medium font-sans text-center text-gray-800 p-10">
            Place your vote!
          </p>
        </div>
      </div>

      <div v-if="!isSpectator" class="grid grid-cols-5 gap-x-2 gap-y-2 mb-4">
        <div v-for="(value, index) in currentCardDeck" :key="value">
          <div
            v-if="index === selectedEstimation"
            data-testid="selected-estimation-placeholder"
            class="w-16 lg:w-20 h-24 lg:h-32"
            aria-hidden="true"
          />
          <motion.div
            v-else
            :class="index === previouslySelectedEstimation ? 'relative z-20' : 'relative z-0'"
            :layout-id="cardLayoutId(value)"
            :layout="true"
            :animate="{ rotate: 0 }"
            :initial="false"
            :transition="cardTransition"
          >
            <card
              data-testid="estimation-card"
              :value="value"
              :selected="false"
              @click="sendEstimation(value, index)"
            />
          </motion.div>
        </div>
      </div>
      <div v-else class="row-span-2 flex items-center justify-center">
        <p class="font-medium text-4xl text-gray-500">Participants are voting</p>
      </div>
    </section>
  </LayoutGroup>
</template>

<script setup lang="ts">
import { LayoutGroup, motion } from 'motion-v';
import { computed, PropType, Ref, ref, toRef } from 'vue';
import { Store, useStore } from 'vuex';
import { State } from '../store/types';
import Card from './Card.vue';

const props = defineProps({
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
const selectedEstimation: Ref<number | undefined> = ref(undefined);
const previouslySelectedEstimation: Ref<number | undefined> = ref(undefined);

const cardTransition = {
  layout: {
    duration: 0.45,
    ease: 'easeInOut',
  },
};

const cardLayoutId = (value: string): string => `estimate-card-${value}`;

const selectedEstimateValue = computed(() => {
  if (typeof selectedEstimation.value === 'undefined') {
    return undefined;
  }

  return props.currentCardDeck[selectedEstimation.value];
});

const selectedCardRotation = computed(() => {
  if (typeof selectedEstimation.value === 'undefined') {
    return 0;
  }

  return ((selectedEstimation.value % 5) - 2) * 4;
});

const sendEstimation = (value: string, index: number) => {
  previouslySelectedEstimation.value = selectedEstimation.value;
  selectedEstimation.value = index;
  emits('send-estimation', value);
};

defineExpose({
  votingIsComplete,
  isSpectator,
  selectedEstimation,
  previouslySelectedEstimation,
  sendEstimation,
  selectedEstimateValue,
});
</script>
