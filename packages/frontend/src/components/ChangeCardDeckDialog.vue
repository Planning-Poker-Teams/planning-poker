<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
  >
    <div class="mx-auto p-5 border w-2/4 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <p class="text-lg leading-6 font-medium text-gray-900">Change Card Deck</p>
        <div class="mt-2 px-7 py-3">
          <input
            v-model="cardDeckString"
            class="w-5/6 mb-2 py-2 px-3 text-lg font-semi bg-white appearance-none border-2 rounded text-grey-darker focus:outline-none focus:border-green-300"
            type="text"
          />
        </div>
        <div class="w-5/6 mx-auto items-center px-4 py-3">
          <button
            class="mr-1 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="changeCardDeck"
          >
            OK
          </button>
          <button
            class="ml-1 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="hideChangeDeckModal"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {PropType, ref} from 'vue';

const props = defineProps({
  currentCardDeck: {
    type: Array as PropType<string[]>,
    required: true,
  },
});
const cardDeckString = ref(props.currentCardDeck.join(', '));

const emits = defineEmits(['hide_change_deck_modal', 'change_deck']);
const hideChangeDeckModal = () => {
  emits('hide_change_deck_modal');
};

const changeCardDeck = () => {
  emits('change_deck', cardDeckString.value.split(/[ ,]+/));
};

defineExpose({
  cardDeckString,
  hideChangeDeckModal,
  changeCardDeck,
});
</script>
