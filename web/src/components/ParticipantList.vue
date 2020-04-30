<template>
  <div class="h-full flex justify-center bg-blue-400x">
    <!-- <div>
      Leave room
      <h1 class="text-xs font-mono">Current room: {{ roomName }}</h1>
    </div> -->
    <div
      class="flex xjustify-center items-center bg-red-700x"
      v-for="participant in participants"
      :key="participant.name"
    >
      <div
        class="flex justify-center items-center w-20 h-20 shadow rounded-full m-1 p-2 select-none"
        v-bind:class="participant.hasEstimated ? 'bg-red-400' : 'bg-green-400'"
      >
        <p class="text-center text-white font-medium text-xsx overflow-hidden">
          {{ participant.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { Participant } from '../store/types';

@Component
export default class ParticipantList extends Vue {
  @Prop() private roomName!: string;
  @Prop() private participants!: Participant[];
}
</script>
