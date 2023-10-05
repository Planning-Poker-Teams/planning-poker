<template>
  <confirm-show-results-dialog
    v-if="showConfirmDialog"
    @on_confirm="requestResult"
    @on_cancel="closeShowResultDialog"
  />
  <new-task-dialog
    v-if="showNewTaskDialog"
    @on_confirm="closeNewTaskDialog"
    @on_cancel="cancelNewTaskDialog"
  />
  <div
    v-if="taskName"
    class="w-full min-h-24 relative overflow-hidden box-border"
  >
    <div class="flex justify-center items-center relative">
      <div class="w:3/5 flex-1 text-xl font-sans m-2">
        <span class="font-bold">{{ taskName }} - </span>
        <span class="">{{ taskStatus }}</span>
      </div>

      <div id="controlArea" class="flex justify-end">
        <button
          v-if="isEstimationOngoing"
          class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-codecentric-100 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
          type="button"
          @click="handleShowResultButton"
        >
          <span class="hidden lg:inline mr-2">Show Result</span>
          <font-awesome-icon icon="fa-magnifying-glass" />
        </button>

        <button
          v-if="estimationResultAvailable"
          class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-codecentric-100 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
          type="button"
          @click="handleNewTaskButton"
        >
          <span class="hidden lg:inline mr-2">New Task</span>
          <font-awesome-icon icon="fa-plus" />
        </button>

        <button
          v-if="estimationResultAvailable"
          class="bg-codecentric-100 text-gray-700 m-2 p-2 border-2 hover:border-gray-400 border-codecentric-100 rounded flex justify-center items-center flex-nowrap whitespace-nowrap"
          type="button"
          @click="handleRestartTaskButton(taskName)"
        >
          <span class="hidden lg:inline mr-2">Restart</span>
          <font-awesome-icon icon="fa-undo" />
        </button>
      </div>
    </div>
    <hr class="m-2 h-0.5 bg-gray-400 box-border" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, toRef, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ActionType } from "../store/actions";
import { EstimationState } from "../store/getters";
import ConfirmShowResultsDialog from "./ConfirmShowResultsDialog.vue";
import NewTaskDialog from "./NewTaskDialog.vue";
const router = useRouter();

const store = useStore();
const props = defineProps({
  taskName: {
    type: String,
    required: true,
  },
  taskStatus: {
    type: String,
    required: true,
  },
  newTask: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const votingIsComplete: Ref<boolean> = toRef(store.getters, "votingIsComplete");
const showConfirmDialog = ref(false);
const showNewTaskDialog = ref(props.newTask);
const isEstimationOngoing = computed(
  () => store.getters.estimationState == EstimationState.ONGOING
);
const estimationResultAvailable = computed(
  () => store.state.estimationResult !== undefined
);

//Show Result Logic
const handleShowResultButton = () => {
  if (votingIsComplete.value) {
    return requestResult();
  }
  showConfirmDialog.value = true;
};
const requestResult = () => {
  showConfirmDialog.value = false;
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
  if (props.newTask) {
    //TODO: exception case: newtaskdialog shown when joining new room without task. A bit ugly that this has to be checked here, could be imprvoed.
    router.push({ name: "lobby", query: { room: store.state.room.name } });
  }
  closeNewTaskDialog();
};
const closeNewTaskDialog = () => {
  showNewTaskDialog.value = false;
};
const handleRestartTaskButton = async (taskName: string) => {
  await store.dispatch(ActionType.REQUEST_START_ESTIMATION, taskName);
};

defineExpose({});
</script>
