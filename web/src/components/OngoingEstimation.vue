<template>
  <section class="flex-1 flex flex-col items-center p-4">
    <div class="w-full flex justify-center lg:pt-4 pb-4 lg:pb-8">
      <div
        ref="taskName"
        class="min-h-24 w-full max-w-lg flex justify-center items-center rounded border-4 border-gray-300 border-dashed"
      >
        <p class="text-2xl font-medium font-sans text-center text-gray-800 p-2">{{ taskName }}</p>
      </div>
    </div>

    <div class="grid grid-cols-4 col-gap-2 row-gap-2 mb-4" v-if="!isSpectator">
      <div
        class="flex flex-col justify-center w-16 lg:w-20 h-24 lg:h-32 rounded-lg shadow cursor-pointer select-none relative"
        v-for="value in possibleEstimationValues"
        :ref="`card-${value}`"
        :key="value"
        :class="value == selectedEstimation ? 'bg-red-400' : 'bg-blue-400'"
        @click="sendEstimation(value)"
      >
        <p class="absolute top-0 left-0 text-sm text-white px-1 font-mono">{{ value }}</p>
        <p class="text-white font-medium text-2xl text-center font-mono">{{ value }}</p>
        <p
          class="absolute bottom-0 right-0 transform rotate-180 text-sm text-white px-1 font-mono"
        >{{ value }}</p>
      </div>
    </div>
    <div class="row-span-2 flex items-center justify-center" v-if="isSpectator">
      <p class="font-medium text-4xl text-gray-500">Participants are voting</p>
    </div>

    <button
      class="mb-4 px-6 py-2 bg-gray-300 text-gray-700 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
      type="submit"
      v-if="votingIsComplete"
      @click="requestResult"
    >Show result</button>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

const CARD_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
  duration: 500,
  fill: 'forwards',
  easing: 'ease-in-out',
};

@Component
export default class OngoingEstimation extends Vue {
  @Prop() taskName!: string;

  selectedEstimation = '';

  lastSelectedCard?: Element;
  lastCardMovement?: { transform: string }[];

  possibleEstimationValues = [
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

  get votingIsComplete() {
    return this.$store.getters.votingIsComplete;
  }

  get isSpectator() {
    return this.$store.state.room?.isSpectator;
  }

  sendEstimation(value: string) {
    if (this.selectedEstimation !== value) {
      try {
        this.animateCardSelection(value);
      } catch (error) {
        console.warn('Card selection could not be animated', error);
      }

      this.selectedEstimation = value;
    }

    this.$emit('send-estimation', value);
  }

  requestResult() {
    this.$emit('request-result');
  }

  animateCardSelection(value: string) {
    if (this.lastSelectedCard && this.lastCardMovement) {
      this.animateCardMovingBackwards(
        this.lastSelectedCard,
        this.lastCardMovement
      );
    }

    const selectedCard = this.getSelectedCard(value);
    const cardMovement = this.getCardMovement(
      this.calculateAnimationTranslation(value),
      this.calculateRandomRotation()
    );

    this.animateCardMovingForwards(selectedCard, cardMovement);

    this.lastSelectedCard = selectedCard;
    this.lastCardMovement = cardMovement;
  }

  getSelectedCard(value: string): Element {
    const selectedCardRefs = this.$refs[`card-${value}`] as Element[];
    return selectedCardRefs[0];
  }

  getTaskName(): Element {
    return this.$refs.taskName as Element;
  }

  getCardMovement(
    { x, y }: { x: number; y: number },
    rotation: number
  ): { transform: string }[] {
    return [
      { transform: 'translate3D(0, 0, 0) rotate(0)' },
      {
        transform: `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
      },
    ];
  }

  animateCardMovingForwards(
    card: Element,
    cardMovement: { transform: string }[]
  ): void {
    card.animate(cardMovement, CARD_ANIMATION_OPTIONS);
  }

  // Unfortunately not all browsers support `animation.reverse()`, so we have to create a separate animation manually
  animateCardMovingBackwards(
    card: Element,
    cardMovement: { transform: string }[]
  ): void {
    card.animate(cardMovement, {
      ...CARD_ANIMATION_OPTIONS,
      direction: 'reverse',
    });
  }

  calculateAnimationTranslation(value: string): { x: number; y: number } {
    const selectedCard = this.getSelectedCard(value);
    const taskName = this.getTaskName();

    const selectedCardRect = selectedCard.getBoundingClientRect();
    const selectedCardCentreCoordinates = {
      x: selectedCardRect.x + selectedCardRect.width / 2,
      y: selectedCardRect.y + selectedCardRect.height / 2,
    };

    const taskNameRect = taskName.getBoundingClientRect();
    const taskNameCentreCoordinates = {
      x: taskNameRect.x + taskNameRect.width / 2,
      y: taskNameRect.y + taskNameRect.height / 2,
    };

    return {
      x: taskNameCentreCoordinates.x - selectedCardCentreCoordinates.x,
      y: taskNameCentreCoordinates.y - selectedCardCentreCoordinates.y,
    };
  }

  calculateRandomRotation(): number {
    return Math.random() * 180 - 90;
  }
}
</script>
