<template>
  <div
    class="flex-none flex justify-center items-center w-16 h-16 m-1 p-1 text-sm shadow rounded-full select-none"
    :class="refVoted ? 'bg-red-400' : 'bg-green-400'"
  >
    <p class="text-center text-white font-medium text-xs overflow-x-hidden">
      {{ name }}
      <font-awesome-icon v-if="refVoted && showCheckmark" class="text-white" icon="check" />
    </p>
  </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { defineComponent, toRef } from 'vue';

export default defineComponent({
  components: {
    FontAwesomeIcon,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    hasVoted: {
      type: Boolean,
      required: true,
    },
    showCheckmark: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const refVoted = toRef(props, 'hasVoted');

    return {
      refVoted,
    };
  },
});
</script>
