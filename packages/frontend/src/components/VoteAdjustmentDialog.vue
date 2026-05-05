<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="vote-adjustment-dialog"
  >
    <div class="mx-auto p-5 border w-5/6 lg:w-2/4 lg:max-w-xl shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <p class="mb-5 text-lg leading-6 font-bold text-gray-900">Adjust your vote</p>

        <div class="grid grid-cols-5 gap-x-2 gap-y-2 mb-5 justify-center">
          <div
            v-for="value in cardDeck"
            :key="value"
            class="relative group"
            :class="value === selectedEstimate ? 'cursor-not-allowed' : 'cursor-pointer'"
            @click="selectEstimate(value)"
          >
            <card
              data-testid="vote-adjustment-card"
              :class="value === selectedEstimate ? 'cursor-not-allowed' : ''"
              :value="value"
              :selected="value === selectedEstimate"
              selected-title="Your current selection"
            />
            <span
              v-if="value === selectedEstimate"
              data-testid="selected-vote-popover"
              class="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white shadow"
            >
              Your current selection
            </span>
          </div>
        </div>

        <div class="mx-auto flex justify-between py-3">
          <button
            data-testid="cancel-vote-adjustment-button"
            class="mr-5 px-4 py-2 bg-gray-400 text-black text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            data-testid="confirm-vote-adjustment-button"
            class="ml-5 px-4 py-2 text-base font-medium rounded-md w-5/12 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-codecentric-100 hover:bg-codecentric-200 text-black"
            @click="confirm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref } from 'vue';
import Card from './Card.vue';

const props = defineProps({
  cardDeck: {
    type: Array as PropType<string[]>,
    required: true,
  },
  currentEstimate: {
    type: String,
    required: false,
    default: undefined,
  },
});

const emits = defineEmits(['on_confirm', 'on_cancel']);
const selectedEstimate = ref(props.currentEstimate);

const confirm = () => {
  emits('on_confirm', selectedEstimate.value);
};
const cancel = () => emits('on_cancel');
const selectEstimate = (estimate: string) => {
  if (estimate !== selectedEstimate.value) {
    selectedEstimate.value = estimate;
  }
};
const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    confirm();
  } else if (e.key === 'Escape') {
    cancel();
  }
};

onMounted(() => {
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyUp);
});

defineExpose({
  selectedEstimate,
  selectEstimate,
  confirm,
  cancel,
});
</script>
