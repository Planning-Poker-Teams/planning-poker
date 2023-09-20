<template>
  <confirm-show-results-dialog
    v-if="showConfirmDialog"
    @on_confirm="requestResult"
    @on_cancel="closeConfirmDialog"
  />
  <new-task-dialog
    v-if="showNewTaskDialog"
    @on_confirm="closeNewTaskDialog"
    @on_cancel="closeNewTaskDialog"
  />
  <div class="w-full min-h-24 relative overflow-hidden box-border">
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
          @click="handleSubmitResult"
        >
          <span class="hidden lg:inline mr-2">Show Result</span>
          <font-awesome-icon icon="fa-plus" />
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
          @click="console.log('TODO')"
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
import { ref, Ref, computed, toRef } from "vue";
import { useStore } from "vuex";
import { ActionType } from "../store/actions";
import { EstimationState } from "../store/getters";
import ConfirmShowResultsDialog from "./ConfirmShowResultsDialog.vue";
import NewTaskDialog from "./NewTaskDialog.vue";

const store = useStore();

const votingIsComplete: Ref<boolean> = toRef(store.getters, "votingIsComplete");
const showConfirmDialog = ref(false);
const showNewTaskDialog = ref(false);

const handleSubmitResult = () => {
  if (votingIsComplete.value) {
    return requestResult();
  }
  showConfirmDialog.value = true;
};
const handleNewTaskButton = () => {
  showNewTaskDialog.value = true;
};
const requestResult = () => {
  showConfirmDialog.value = false;
  store.dispatch(ActionType.REQUEST_RESULT);
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
};
const closeNewTaskDialog = () => {
  showNewTaskDialog.value = false;
};

const props = defineProps({
  taskName: {
    type: String,
    required: true,
  },
  taskStatus: {
    type: String,
    required: true,
  },
});

const isEstimationOngoing = computed(
  () => store.getters.estimationState == EstimationState.ONGOING
);
const estimationResultAvailable = computed(
  () => store.state.estimationResult !== undefined
);

defineExpose({});
</script>
