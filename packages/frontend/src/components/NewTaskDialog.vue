<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="confirm-show-results-dialog"
  >
    <div class="mx-auto p-5 border w-2/4 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <template v-if="pendingParticipants.length">
          <p class="text-lg leading-6 font-medium text-gray-900">
            What do you want to vote on?
          </p>

          <input
            v-model="newTaskName"
            class="p-2 mb-4 w-full lg:w-1/2 text-center text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-green-300"
            placeholder="Task name"
          />
        </template>

        <template v-else>
          <p class="text-lg mb-2 leading-6 font-medium text-gray-900">
            Everyone has voted, proceed to view the results by clicking "OK"!
          </p>
        </template>

        <div class="w-5/6 mx-auto items-center px-4 py-3">
          <button
            class="ml-1 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="cancel"
          >
            CANCEL
          </button>
          <button
            class="mr-1 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="confirm"
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, toRef, computed } from "vue";
import { Store, useStore } from "vuex";
import { ActionType } from "../store/actions";
import { Participant, State } from "../store/types";

const newTaskName = ref("");

const emits = defineEmits(["on_confirm", "on_cancel"]);
const store: Store<State> = useStore();
const pendingParticipants: Ref<Participant[]> = toRef(
  store.getters,
  "pendingParticipants"
);

const confirm = () => {
  startEstimation(newTaskName.value);
  emits("on_confirm");
};
const startEstimation = async (taskName: string) => {
  store.dispatch(ActionType.REQUEST_START_ESTIMATION, taskName);
};
const cancel = () => emits("on_cancel");

const userName = computed(() => {
  return store.state.room?.userName;
});

const removeUser = (userName: string) => {
  store.dispatch(ActionType.REMOVE_USER, userName);
};
</script>
