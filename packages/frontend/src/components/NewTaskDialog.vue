<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="confirm-show-results-dialog"
  >
    <div class="mx-auto p-5 border w-5/6 lg:w-2/4 lg:max-w-xl shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <p class="mb-5 text-lg leading-6 font-bold text-gray-900">What do you want to vote on?</p>

        <input
          v-model="newTaskName"
          class="p-2 mb-4 w-full text-left text-lg font-semi bg-white appearance-none border-4 rounded text-grey-darker focus:outline-none focus:border-codecentric-100"
          placeholder="Please enter a task name..."
        />

        <div class="mx-auto flex justify-between py-3">
          <button
            class="mr-5 px-4 py-2 bg-gray-400 text-black text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="ml-5 px-4 py-2 text-base font-medium rounded-md w-5/12 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            :class="
              newTaskName.length < 1
                ? 'bg-gray-200 hover:bg-gray-200 text-gray-500'
                : 'bg-codecentric-100 hover:bg-codecentric-200 text-black'
            "
            :disabled="newTaskName.length < 1"
            @click="confirm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Store, useStore } from 'vuex';
import { ActionType } from '../store/actions';
import { State } from '../store/types';

const newTaskName = ref('');

const emits = defineEmits(['on_confirm', 'on_cancel']);
const store: Store<State> = useStore();

onMounted(() => {
  window.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
      confirm();
    } else if (e.key === 'Escape') {
      cancel();
    }
  });
});

const confirm = () => {
  if (newTaskName.value.length > 0) {
    startEstimation(newTaskName.value);
    emits('on_confirm');
  }
};
const startEstimation = async (taskName: string) => {
  store.dispatch(ActionType.REQUEST_START_ESTIMATION, taskName);
};
const cancel = () => emits('on_cancel');
</script>
