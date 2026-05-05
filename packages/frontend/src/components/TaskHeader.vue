<template>
  <confirm-show-results-dialog
    v-if="showConfirmDialog"
    @on_confirm="requestResult"
    @on_cancel="closeShowResultDialog"
  />
  <new-task-dialog
    v-if="
      (store.getters.estimationState == EstimationState.NOT_STARTED || showNewTaskDialog) &&
      store.state.connectionState == ConnectionState.CONNECTED
    "
    @on_confirm="closeNewTaskDialog"
    @on_cancel="cancelNewTaskDialog"
  />
  <vote-adjustment-dialog
    v-if="showVoteAdjustmentDialog"
    :card-deck="cardDeck"
    :current-estimate="currentUserEstimate"
    @on_confirm="confirmVoteAdjustment"
    @on_cancel="closeVoteAdjustmentDialog"
  />
  <div v-if="taskName" class="w-full min-h-24 relative overflow-hidden box-border">
    <div class="flex justify-center items-center relative">
      <div class="w:3/5 flex-1 text-xl font-sans m-2">
        Task:
        <span ref="task-name-display" class="font-bold">{{ taskName }} - </span>
        <span class="">{{ taskStateLabel }}</span>
      </div>

      <div id="controlArea" class="flex justify-end">
        <button-p-p
          v-if="isEstimationOngoing"
          data-testid="show-result-button"
          text="Show Result"
          color="codecentric-100"
          icon-name="fa-magnifying-glass"
          @click="handleShowResultButton"
        >
        </button-p-p>

        <button-p-p
          v-if="currentUserCanEditRevealedVote"
          data-testid="adjust-vote-button"
          text="Adjust your vote"
          color="gray-300"
          icon-name="fa-pen-to-square"
          @click="openVoteAdjustmentDialog"
        >
        </button-p-p>

        <span
          v-if="currentUserCanEditRevealedVote"
          data-testid="adjust-vote-separator"
          class="self-center text-gray-500 font-bold mx-1"
        >
          |
        </span>

        <button-p-p
          v-if="estimationResultAvailable"
          data-testid="restart-task-button"
          text="Restart"
          color="codecentric-100"
          icon-name="fa-undo"
          @click="handleRestartTaskButton(taskName)"
        >
        </button-p-p>

        <button-p-p
          v-if="estimationResultAvailable"
          data-testid="new-task-button"
          text="New Task"
          color="codecentric-100"
          icon-name="fa-plus"
          @click="handleNewTaskButton"
        >
        </button-p-p>
      </div>
    </div>
    <hr class="m-2 h-0.5 bg-gray-400 box-border" />
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ConnectionState } from '../store';
import { ActionType } from '../store/actions';
import { EstimationState, GetterType } from '../store/getters';
import ButtonPP from './ButtonPP.vue';
import ConfirmShowResultsDialog from './ConfirmShowResultsDialog.vue';
import NewTaskDialog from './NewTaskDialog.vue';
import VoteAdjustmentDialog from './VoteAdjustmentDialog.vue';
const router = useRouter();

const store = useStore();
const cardDeck = toRef(store.state, 'cardDeck');

const isEstimationOngoing = computed(
  () => store.getters.estimationState == EstimationState.ONGOING
);
const estimationResultAvailable = computed(() => store.state.estimationResult !== undefined);
const currentUserCanEditRevealedVote: Ref<boolean> = toRef(
  store.getters,
  GetterType.CURRENT_USER_CAN_EDIT_REVEALED_VOTE
);
const taskStateLabel = computed(() => {
  if (isEstimationOngoing.value) {
    return 'Estimation';
  }

  if (store.state.estimationResult?.isEditable) {
    return 'Live Result';
  }

  return 'Result';
});
const taskName = computed(() => {
  if (store.state.ongoingEstimation) {
    return store.state.ongoingEstimation.taskName;
  } else if (store.state.estimationResult) {
    return store.state.estimationResult.taskName;
  } else {
    return '';
  }
});

const votingIsComplete: Ref<boolean> = toRef(store.getters, 'votingIsComplete');
const showConfirmDialog = ref(false);
const showNewTaskDialog = ref(false);
const showVoteAdjustmentDialog = ref(false);
const currentUserEstimate = computed(() => {
  if (!store.state.room) {
    return undefined;
  }

  return store.state.estimationResult?.estimates.find(
    estimate => estimate.userName === store.state.room?.userName
  )?.estimate;
});
//Show Result Logic
const handleShowResultButton = () => {
  if (votingIsComplete.value) {
    return requestResult();
  }
  showConfirmDialog.value = true;
};
const requestResult = () => {
  closeShowResultDialog();
  store.dispatch(ActionType.REQUEST_RESULT);
};
const closeShowResultDialog = () => {
  showConfirmDialog.value = false;
};

//Task Start Logic
const handleNewTaskButton = () => {
  showNewTaskDialog.value = true;
};
const cancelNewTaskDialog = () => {
  closeNewTaskDialog();
  if (!taskName.value) {
    //TODO: exception case: newtaskdialog shown when joining new room without task. A bit ugly that this has to be checked here, could be imprvoed.
    router.push({ name: 'lobby', query: { room: store.state.room.name } });
  }
};
const closeNewTaskDialog = () => {
  showNewTaskDialog.value = false;
};
const openVoteAdjustmentDialog = () => {
  showVoteAdjustmentDialog.value = true;
};
const closeVoteAdjustmentDialog = () => {
  showVoteAdjustmentDialog.value = false;
};
const confirmVoteAdjustment = (estimate?: string) => {
  closeVoteAdjustmentDialog();

  if (estimate && estimate !== currentUserEstimate.value) {
    store.dispatch(ActionType.SEND_ESTIMATION, estimate);
  }
};
const handleRestartTaskButton = async (taskName: string) => {
  await store.dispatch(ActionType.REQUEST_START_ESTIMATION, {
    taskName,
    allowVoteCorrectionAfterReveal:
      store.state.estimationResult?.allowVoteCorrectionAfterReveal ?? false,
  });
};

defineExpose({
  currentUserCanEditRevealedVote,
  currentUserEstimate,
  showVoteAdjustmentDialog,
  openVoteAdjustmentDialog,
  closeVoteAdjustmentDialog,
  confirmVoteAdjustment,
});
</script>
