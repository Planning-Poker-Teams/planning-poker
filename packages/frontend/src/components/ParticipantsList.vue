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

<script setup lang="ts">
import { PropType, toRef } from 'vue';
import ParticipantItem from '../components/ParticipantItem.vue';
import { Participant } from '../store/types';

const props = defineProps({
  participants: {
    type: Array as PropType<Participant[]>,
    required: true,
  },
});
const refParticipants = toRef(props, 'participants');

defineExpose({
  refParticipants,
});
</script>
