<template>
  <div class="w-full overflow-x-scroll">
    <div class="flex items-center p-2">
      <div
        class="flex-none flex justify-center items-center w-16 h-16 shadow rounded-full m-1 p-2 select-none"
        v-for="(participant, index) in participants"
        :key="participant.name"
        v-bind:class="`
          ${participant.hasEstimated || participant.isSpectator
            ? 'bg-red-400'
            : 'bg-green-400'
          }
          ${index === 0  ? 'ml-auto' : ''}
          ${index === participants.length - 1 ? 'mr-auto' : ''}
        `"
      >
        <p
          class="text-center text-white font-medium text-sm overflow-x-hidden"
        >{{ participant.name }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { Participant } from '../store/types';

@Component
export default class ParticipantsList extends Vue {
  @Prop() private participants!: Participant[];
}
</script>
