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
        <div
          class="w-5/6 mx-auto bg-green-100 border-t-4 border-green-300 rounded-b text-teal-900 px-4 py-3 shadow-md"
          role="alert"
        >
          <div class="flex">
            <div class="py-1">
              <svg
                class="fill-current h-6 w-6 text-teal-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold">Not supported for the iOS application.</p>
              <p class="text-sm">
                The development of the
                <a
                  href="https://apps.apple.com/de/app/planning-poker-for-teams/id1495956287"
                  target="_blank"
                  >Planning Poker iOS application</a
                >
                has been discontinued. If the default card deck is changed, users of the iOS
                application will no longer be able to participate in estimations.
              </p>
            </div>
          </div>
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

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    currentCardDeck: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ['hide_change_deck_modal', 'change_deck'],
  setup(props, context) {
    const cardDeckString = ref(props.currentCardDeck.join(', '));

    const hideChangeDeckModal = () => {
      context.emit('hide_change_deck_modal');
    };

    const changeCardDeck = () => {
      context.emit('change_deck', cardDeckString.value.split(/[ ,]+/));
    };

    return {
      cardDeckString,
      hideChangeDeckModal,
      changeCardDeck,
    };
  },
});
</script>
