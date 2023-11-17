<template>
  <div style="flex-direction: column;"
  class="items-center justify-center flex">
    <div
    class="flex-none flex justify-center items-center w-16 h-16 m-1 p-1 text-sm shadow rounded-full select-none bg-blue-400 name-blob"
  >
    <p class="text-center text-white font-medium text-xs overflow-x-hidden">
      {{ abbreviation }}
    </p>
    <div 
    class="flex-none flex justify-center items-enter w-8 h-8 m-1 p-1 text-sm shadow rounded-full select-none name-blob-status" 
    :class="refVoted ? 'bg-green-400' : 'bg-yellow-400'"
    v-if="showCheckmark"
    >
      <font-awesome-icon class="text-white name-blob-status__icon" icon="check" v-if="refVoted" />
      <font-awesome-icon class="text-black name-blob-status__icon" icon="hourglass" v-if="!refVoted" />
    </div>
  </div>
  {{ name }}
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import "../assets/participant-item.css";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  hasVoted: {
    type: Boolean,
    required: true,
  },
  abbreviation: {
    type: String,
    required: true,
  },
  showCheckmark: {
    type: Boolean,
    default: false,
  }
});

const refVoted = toRef(props, 'hasVoted');

defineExpose({
  refVoted,
});
</script>
