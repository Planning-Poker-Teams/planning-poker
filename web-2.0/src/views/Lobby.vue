<template>
  <div class="min-w-64">
    <div
      class="m-4 flex flex-col items-center bg-gray-100 shadow-lg rounded-lg"
    >
      <img
        class="m-8 object-contain h-24 shadow-md rounded-lg"
        src="AppIcon.png"
      />
      <h1 class="text-2xl font-medium font-sans mb-2 text-center">
        Planning Poker<br />
        for teams
      </h1>

      <form class="mb-4 p-4" @submit.prevent>
        <div class="flex flex-col">
          <input
            class="mb-2 py-2 px-3 text-lg font-semi bg-white appearance-none border-2 rounded text-grey-darker focus:outline-none focus:border-green-300"
            placeholder="Room name"
            v-model="roomName"
          />
          <input
            class="mb-2 mb-4 py-2 px-3 text-lg font-semi bg-white appearance-none border-2 rounded text-grey-darker focus:outline-none focus:border-green-300"
            placeholder="Your name"
            v-model="userName"
          />
          <div class="flex flex-row-reverse">
            <button
              class="my-2 bg-gray-300 hover:bg-gray-100 text-lg text-gray-700 font- py-2 px-4 border-2 border-gray-400 rounded"
              v-on:click="joinRoom"
              :disabled="!formIsCompleted"
            >
              Join room
            </button>
          </div>
          <p class="w-64 text-xs font-mono m-2 text-gray-400">
            Debug state: {{ joinRoomProperties }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Lobby extends Vue {
  roomName = '';
  userName = '';

  get joinRoomProperties() {
    return JSON.stringify(this.$store.state);
  }

  get formIsCompleted(): boolean {
    return this.roomName.length > 0 && this.userName.length > 0;
  }

  joinRoom() {
    const { roomName, userName } = this;
    this.$store.commit('joinRoom', { roomName, userName });
  }
}
</script>
