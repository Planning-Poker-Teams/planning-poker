<template>
  <div class="sticky top-0 bg-white rounded-t-lg w-full flex flex-col border-b shadow-sm z-10">
    <div
      class="w-full min-h-16 flex justify-left lg:justify-center items-center relative overflow-hidden"
    >
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

      <div class="w-3/5 ml-16 lg:m-0 flex flex-col items-start lg:items-center">
        <h1 class="text-2xl font-sans font-bold">
          {{ roomName }}
        </h1>
        <span
          v-if="isLocalBackend"
          class="mt-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs font-semibold uppercase tracking-wide"
        >
          Local backend
        </span>
      </div>

      <div id="controlArea" class="absolute top-0 right-0 w-5/12 flex justify-end">
        <button-p-p
          :style="urlCopyStatus ? { cursor: 'default' } : { cursor: 'pointer' }"
          :text="urlCopyStatus ? 'Copied' : 'Invite'"
          :color="urlCopyStatus ? 'codecentric-100' : 'gray-300'"
          :icon-name="urlCopyStatus ? 'fa-check' : 'fa-link'"
          :hidden="!canChangeCardDeck"
          @click="copyUrl"
        >
        </button-p-p>

        <button-p-p
          text="Deck"
          color="gray-300"
          icon-name="sliders-h"
          :hidden="!canChangeCardDeck"
          @click="showChangeDeckModal"
        >
        </button-p-p>

        <button-p-p
          text="Exit"
          color="gray-300"
          icon-name="door-open"
          :hidden="!canChangeCardDeck"
          @click="leaveRoom"
        >
        </button-p-p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Participant } from '../store/types';
import ButtonPP from './ButtonPP.vue';

const store = useStore();
const router = useRouter();

const props = defineProps({
  roomName: {
    type: String,
    required: true,
  },
  participants: {
    type: Array as PropType<Participant[]>,
    required: true,
  },
});
const refParticipants = toRef(props, 'participants');
const configuredApiUrl = import.meta.env.VITE_API_URL || window.planningPoker.apiUrl;
const isLocalBackend = computed<boolean>(
  () =>
    configuredApiUrl.includes('localhost:4566/_aws/execute-api') ||
    configuredApiUrl.includes('127.0.0.1:4566/_aws/execute-api')
);
const canChangeCardDeck = computed<boolean>(() => {
  if (store.state.estimationResult?.isEditable) {
    return false;
  }

  return !store.getters.somebodyHasVoted || !store.state.ongoingEstimation;
});

const emits = defineEmits(['show_change_deck_modal']);

const showChangeDeckModal = () => {
  emits('show_change_deck_modal');
};

const leaveRoom = () => {
  router.push({ name: 'lobby', query: { room: props.roomName } });
};

const urlCopyStatus = ref(false);
const copyUrl = async () => {
  //TODO: Shouldn't use plaintext domain here, instead import from wherever it's stored
  navigator.clipboard.writeText(`https://${window.location.hostname}${window.location.pathname}`);
  urlCopyStatus.value = true;
};

defineExpose({
  refParticipants,
  isLocalBackend,
  canChangeCardDeck,
  showChangeDeckModal,
  leaveRoom,
});
</script>
