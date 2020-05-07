<template>
  <div class="w-full overflow-x-scroll">
    <div class="flex items-center p-2">
      <participant-item
        v-for="(participant, index) in participants"
        :key="participant.name"
        :class="
          `
          ${index === 0 ? 'ml-auto' : ''}
          ${index === participants.length - 1 ? 'mr-auto' : ''}
        `
        "
        :name="participant.name"
        :hasVoted="participant.hasEstimated"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { Participant } from '../store/types';
import ParticipantItem from '@/components/ParticipantItem.vue';

@Component({
  components: { ParticipantItem },
})
export default class ParticipantsList extends Vue {
  @Prop() private participants!: Participant[];
}
</script>
