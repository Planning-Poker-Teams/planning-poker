<template>
  <div class="sticky top-0 bg-white rounded-t-lg w-full flex flex-col border-b shadow-sm">
    <div class="w-full min-h-16 flex justify-center items-center relative overflow-hidden">
      <div class="absolute top-0 left-0 flex items-center m-2">
        <img
          class="object-contain h-12 shadow-md rounded-lg mr-2"
          alt="Planning Poker App logo"
          src="../assets/planning-poker-app-icon.png"
        />
        <h2 class="hidden lg:inline font-medium font-sans select-none">
          Planning Poker
          <br />for teams
        </h2>
      </div>
      <h1 class="w:3/5 flex-1 text-center text-2xl m-0 font-sans font-bold">
        {{ roomName }}
      </h1>

      <button
        class="absolute top-0 right-0 bg-gray-300 text-gray-700 m-2 p-2 mr-40 border-2 hover:border-gray-400 border-gray-300 rounded"
        type="button"
        :hidden="!canChangeCardDeck"
        @click="showChangeDeckModal"
      >
        <span class="hidden lg:inline mr-2">Change Card Deck</span>
        <font-awesome-icon icon="sliders-h" />
      </button>

      <button
        class="absolute top-0 right-0 bg-gray-300 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-gray-300 rounded"
        type="button"
        @click="leaveRoom"
      >
        <span class="hidden lg:inline mr-2">Leave Room</span>
        <font-awesome-icon icon="door-open" />
      </button>
    </div>
    <participants-list :participants="refParticipants" />
  </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, defineComponent, PropType, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ParticipantsList from '../components/ParticipantsList.vue';
import { Participant } from '../store/types';

export default defineComponent({
  components: { ParticipantsList, FontAwesomeIcon },
  props: {
    roomName: {
      type: String,
      required: true,
    },
    participants: {
      type: Array as PropType<Participant[]>,
      required: true,
    },
  },
  emits: ['show_change_deck_modal'],
  setup: function (props, context) {
    const store = useStore();
    const router = useRouter();
    const refParticipants = toRef(props, 'participants');
    const canChangeCardDeck = computed<boolean>(
      () => !store.getters.somebodyHasVoted || !store.state.ongoingEstimation
    );
    const showChangeDeckModal = () => {
      context.emit('show_change_deck_modal');
    };

    const leaveRoom = () => {
      router.push({ name: 'lobby', query: { room: props.roomName } });
    };

    return {
      refParticipants,
      canChangeCardDeck,
      showChangeDeckModal,
      leaveRoom,
    };
  },
});
</script>
