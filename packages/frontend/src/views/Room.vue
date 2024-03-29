<template>
  <div
    class="h-full w-full flex flex-col items-center bg-gray-100 lg:shadow-lg lg:rounded-lg relative overflow-y-scroll"
  >
    <room-header
      :participants="participants"
      :room-name="roomName"
      @show_change_deck_modal="showChangeDeckModal = true"
    />
    <task-header></task-header>
    <change-card-deck-dialog
      v-if="showChangeDeckModal"
      :current-card-deck="cardDeck"
      @hide_change_deck_modal="showChangeDeckModal = false"
      @change_deck="changeCardDeck"
    />
    <ongoing-estimation
      v-if="isEstimationOngoing"
      :task-name="taskName"
      :current-card-deck="cardDeck"
      @send-estimation="sendEstimation"
      @request-result="requestResult"
    />
    <estimation-result v-if="estimationResultAvailable" />
  </div>
  <participants-list :participants="participants" />
  <connection-status-dialog
    :show="store.state.connectionState != ConnectionState.CONNECTED"
  ></connection-status-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Store, useStore } from 'vuex';
import ChangeCardDeckDialog from '../components/ChangeCardDeckDialog.vue';
import ConnectionStatusDialog from '../components/ConnectionStatusDialog.vue';
import EstimationResult from '../components/EstimationResult.vue';
import OngoingEstimation from '../components/OngoingEstimation.vue';
import ParticipantsList from '../components/ParticipantsList.vue';
import RoomHeader from '../components/RoomHeader.vue';
import TaskHeader from '../components/TaskHeader.vue';
import { ConnectionState } from '../store';
import { ActionType } from '../store/actions';
import { EstimationState } from '../store/getters';

import { State } from '../store/types';

const store: Store<State> = useStore();
const route = useRoute();
const router = useRouter();

const showChangeDeckModal = ref(false);
const cardDeck = toRef(store.state, 'cardDeck');

const participants = toRef(store.state, 'participants');
const taskName = computed(() => {
  const { ongoingEstimation, estimationResult } = store.state;
  return ongoingEstimation?.taskName || estimationResult?.taskName || '';
});
const roomName = computed(() => {
  if (typeof store.state.room === 'undefined') {
    return '';
  }

  return store.state.room.name;
});

onMounted(() => {
  const roomNameParam = route.params.roomName;
  if (!store.state.room || roomName.value !== roomNameParam) {
    router.push({ name: 'lobby', query: { room: roomNameParam } });
  }
  store.dispatch(ActionType.ENTER_ROOM);
});
onUnmounted(() => {
  store.dispatch(ActionType.LEAVE_ROOM);
});

const isEstimationOngoing = computed(
  () => store.getters.estimationState == EstimationState.ONGOING
);
const estimationResultAvailable = computed(() => store.state.estimationResult !== undefined);
const changeCardDeck = async (newCardDeck: string[]) => {
  store.dispatch(ActionType.CHANGE_CARD_DECK, newCardDeck);
  showChangeDeckModal.value = false;
};
const sendEstimation = async (value: string) => {
  store.dispatch(ActionType.SEND_ESTIMATION, value);
};
const requestResult = async () => {
  store.dispatch(ActionType.REQUEST_RESULT);
};

defineExpose({
  showChangeDeckModal,
  cardDeck,
  participants,
  roomName,
  taskName,
  isEstimationOngoing,
  estimationResultAvailable,
  changeCardDeck,
  sendEstimation,
  requestResult,
});
</script>
