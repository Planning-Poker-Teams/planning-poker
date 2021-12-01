<template>
  <section class="flex-1 flex flex-col items-center p-4">
    <div class="w-full flex justify-center lg:pt-4 pb-4 lg:pb-8">
      <div
        ref="taskNameRef"
        class="min-h-24 w-full max-w-lg flex justify-center items-center rounded border-4 border-gray-300 border-dashed"
      >
        <p class="text-2xl font-medium font-sans text-center text-gray-800 p-2">
          {{ taskName }}
        </p>
      </div>
      <button
        v-if="votingIsComplete"
        class="mx-2 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
        type="submit"
        @click="requestResult"
      >
        Show result
      </button>
    </div>

    <div v-if="!isSpectator" class="grid grid-cols-4 col-gap-2 row-gap-2 mb-4">
      <div
        v-for="(value, index) in possibleEstimationValues"
        :ref="
          (el) => {
            selectedCardRefs[index] = el;
          }
        "
        :key="value"
        class="flex flex-col justify-center w-16 lg:w-20 h-24 lg:h-32 rounded-lg shadow cursor-pointer select-none relative"
        :class="
          index == selectedEstimation ? 'bg-red-400 opacity-90' : 'bg-blue-400'
        "
        @click="sendEstimation(value, index)"
      >
        <p class="absolute top-0 left-0 text-sm text-white px-1 font-mono">
          {{ value }}
        </p>
        <p class="text-white font-medium text-2xl text-center font-mono">
          {{ value }}
        </p>
        <p
          class="absolute bottom-0 right-0 transform rotate-180 text-sm text-white px-1 font-mono"
        >
          {{ value }}
        </p>
      </div>
    </div>
    <div v-if="isSpectator" class="row-span-2 flex items-center justify-center">
      <p class="font-medium text-4xl text-gray-500">Participants are voting</p>
    </div>
  </section>
</template>

<script lang="ts">
import { State } from '../store/types';
import { defineComponent, onBeforeUpdate, Ref, ref, toRef } from 'vue';
import { Store, useStore } from 'vuex';

const CARD_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
  duration: 500,
  fill: 'forwards',
  easing: 'ease-in-out',
};

export default defineComponent({
  props: {
    taskName: {
      type: String,
      required: true,
    },
  },
  emits: ['send-estimation', 'request-result'],
  setup(props, context) {
    const store: Store<State> = useStore();
    const votingIsComplete = toRef(store.getters, 'votingIsComplete');
    const isSpectator = ref(store.state.room?.isSpectator);
    const taskNameRef: Ref<Element | undefined> = ref(undefined);
    const possibleEstimationValues = [
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
    const selectedEstimation: Ref<number | undefined> = ref(undefined);
    const selectedCardRefs: Ref<Element[]> = ref([]);
    onBeforeUpdate(() => {
      selectedCardRefs.value = [];
    });

    let lastCardMovement: { transform: string }[] = [];

    const requestResult = () => context.emit('request-result');
    const calculateAnimationTranslation = (
      index: number
    ): { x: number; y: number } => {
      const selectedCard = selectedCardRefs.value[index];

      const selectedCardRect = selectedCard.getBoundingClientRect();
      const selectedCardCentreCoordinates = {
        x: selectedCardRect.x + selectedCardRect.width / 2,
        y: selectedCardRect.y + selectedCardRect.height / 2,
      };

      if (typeof taskNameRef.value !== 'undefined') {
        const taskNameRect = taskNameRef.value.getBoundingClientRect();
        const taskNameCentreCoordinates = {
          x: taskNameRect.x + taskNameRect.width / 2,
          y: taskNameRect.y + taskNameRect.height / 2,
        };

        return {
          x: taskNameCentreCoordinates.x - selectedCardCentreCoordinates.x,
          y: taskNameCentreCoordinates.y - selectedCardCentreCoordinates.y,
        };
      }

      return { x: 0, y: 0 };
    };

    const calculateRandomRotation = (): number => {
      return Math.random() * 180 - 90;
    };

    const getCardMovement = (
      { x, y }: { x: number; y: number },
      rotation: number
    ): { transform: string }[] => {
      return [
        { transform: 'translate3D(0, 0, 0) rotate(0)' },
        {
          transform: `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
        },
      ];
    };

    const animateCardMovingForwards = (
      card: Element,
      cardMovement: { transform: string }[]
    ): void => {
      card.animate(cardMovement, CARD_ANIMATION_OPTIONS);
    };

    // Unfortunately not all browsers support `animation.reverse()`, so we have to create a separate animation manually
    const animateCardMovingBackwards = (
      card: Element,
      cardMovement: { transform: string }[]
    ): void => {
      card.animate(cardMovement, {
        ...CARD_ANIMATION_OPTIONS,
        direction: 'reverse',
      });
    };

    let lastSelectedCard: Element;
    const animateCardSelection = (index: number) => {
      if (lastSelectedCard && lastCardMovement) {
        animateCardMovingBackwards(lastSelectedCard, lastCardMovement);
      }

      const selectedCard = selectedCardRefs.value[index];
      const cardMovement = getCardMovement(
        calculateAnimationTranslation(index),
        calculateRandomRotation()
      );

      animateCardMovingForwards(selectedCard, cardMovement);

      lastSelectedCard = selectedCard;
      lastCardMovement = cardMovement;
    };

    const sendEstimation = (value: string, index: number) => {
      if (selectedEstimation.value !== index) {
        try {
          animateCardSelection(index);
        } catch (error) {
          console.warn('Card selection could not be animated', error);
        }

        selectedEstimation.value = index;
      }

      context.emit('send-estimation', value);
    };

    return {
      votingIsComplete,
      requestResult,
      isSpectator,
      selectedEstimation,
      possibleEstimationValues,
      sendEstimation,
      selectedCardRefs,
      taskNameRef,
    };
  },
});
</script>
