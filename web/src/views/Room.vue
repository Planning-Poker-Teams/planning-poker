<template>
  <div class="p-16 w-full h-full">
    <div
      class="w-full h-full p-2 bg-gray-100 shadow-lg rounded-lg grid grid-rows-3"
    >
      <div class="">
        <h1 class="text-xs font-mono">Room: {{ roomName }}</h1>
        <div class="flex">
          <div v-for="participant in participants" :key="participant.name">
            <div class="w-12 h-12 m-1 p-2 bg-gray-400">
              <p class="text-xs">
                {{ participant.name }} {{ participant.hasEstimated }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="row-span-2 grid grid-rows-2">
        <div v-if="!isEstimationOngoing" class="flex justify-center">
          Start estimation form
        </div>

        <div v-if="isEstimationOngoing" class="flex justify-center">
          <div
            class="h-32 w-64 flex flex-col justify-center rounded border-4 border-gray-300 border-dashed"
          >
            <p class="text-2xl font-medium font-sans text-center text-gray-800">
              {{ taskName }}
            </p>
          </div>
        </div>

        <div v-if="isEstimationOngoing" class="flex">
          Estimation cards
          <div class="w-16 h-24 m-2 bg-gray-300">Card</div>
        </div>
      </div>
    </div>
    <div class="text-white text-xs font-mono">{{ currentState }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { EstimationState, Participant } from '../store';

@Component
export default class Room extends Vue {
  beforeMount() {
    const roomNameParam = this.$route.params.roomName;
    const roomName = this.$store.state.room?.name;

    if (!this.$store.state.room || roomName !== roomNameParam) {
      this.$router.push({ name: 'lobby', query: { room: roomNameParam } });
    }
  }

  get currentState(): string {
    return JSON.stringify(this.$store.state);
  }

  get participants(): Participant[] {
    return this.$store.state.participants;
  }

  get roomName(): string {
    return this.$store.state.room?.name;
  }

  get taskName(): string | undefined {
    return this.$store.state.ongoingEstimation?.taskName;
  }

  get isEstimationOngoing(): boolean {
    return this.$store.getters.estimationState == EstimationState.ONGOING;
  }
}
</script>
