<template>
  <div class="w-full overflow-x-auto">
    <div class="flex items-center p-2">
      <participant-item
        v-for="participant in participants"
        class="first:ml-auto last:mr-auto"
        :key="participant.name"
        :name="participant.name"
        :hasVoted="participant.hasEstimated || participant.isSpectator"
        :showCheckmark="true"
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
