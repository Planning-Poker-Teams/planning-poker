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
  <div v-if="taskName" class="w-full min-h-24 relative overflow-hidden box-border">
    <div class="flex justify-center items-center relative">
      <div class="w:3/5 flex-1 text-xl font-sans m-2">
        Task:
        <span ref="task-name-display" class="font-bold">{{ taskName }} - </span>
        <span class="">{{ isEstimationOngoing ? 'Estimation' : 'Result' }}</span>
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
import { EstimationState } from '../store/getters';
import ButtonPP from './ButtonPP.vue';
import ConfirmShowResultsDialog from './ConfirmShowResultsDialog.vue';
import NewTaskDialog from './NewTaskDialog.vue';
const router = useRouter();

const store = useStore();

const isEstimationOngoing = computed(
  () => store.getters.estimationState == EstimationState.ONGOING
);
const estimationResultAvailable = computed(() => store.state.estimationResult !== undefined);
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
const handleRestartTaskButton = async (taskName: string) => {
  await store.dispatch(ActionType.REQUEST_START_ESTIMATION, taskName);
};

defineExpose({});
</script>
