<template>
  <div class="w-full overflow-x-auto">
    <div class="flex items-center p-2">
      <participant-item
        v-for="participant in refParticipants"
        :key="participant.name"
        class="first:ml-auto last:mr-auto"
        :name="participant.name"
        :has-voted="participant.hasEstimated || participant.isSpectator"
        :show-checkmark="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from 'vue';
import ParticipantItem from '../components/ParticipantItem.vue';
import { Participant } from '../store/types';

export default defineComponent({
  components: {
    ParticipantItem,
  },
  props: {
    participants: {
      type: Array as PropType<Participant[]>,
      required: true,
    },
  },
  setup(props) {
    const refParticipants = toRef(props, 'participants');

    return {
      refParticipants,
    };
  },
});
</script>
