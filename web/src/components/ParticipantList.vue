<template>
  <div class="flex flex-col border-b bg-blue-700x h-full">
    <div class="flex justify-center">
      <div class="flex-1">
        <button
          class="text-md bg-gray-300 text-gray-700 px-1 border-2 hover:border-gray-400 border-gray-300 rounded"
          type="button"
          @click="leaveRoom"
        >
          Leave room
        </button>
      </div>
      <h1 class="text-2xl m-0 font-sans font-bold">{{ roomName }}</h1>
      <div class="flex-1" />
    </div>
    <div class="flex flex-row justify-center items-center h-full p-2">
      <div
        class="flex justify-center items-center w-16 h-16 shadow rounded-full m-1 p-2 select-none"
        v-for="participant in participants"
        :key="participant.name"
        v-bind:class="
          participant.hasEstimated || participant.isSpectator
            ? 'bg-red-400'
            : 'bg-green-400'
        "
      >
        <p class="text-center text-white font-medium text-sm overflow-y-auto">
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

  leaveRoom() {
    const roomName = this.$store.state.room?.name;
    this.$router.push({ name: 'lobby', query: { room: roomName } });
  }
}
</script>
