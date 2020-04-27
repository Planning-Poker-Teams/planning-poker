<template>
  <div class="w-full h-full p-16 flex flex-col items-center">
    <div
      class="w-96 flex flex-col items-center bg-gray-100 shadow-lg rounded-lg"
    >
      <img
        class="m-8 mb-4 object-contain h-24 shadow-md rounded-lg"
        src="../assets/planning-poker-app-icon.png"
      />
      <h1 class="text-2xl font-medium font-sans mb-2 text-center select-none">
        Planning Poker
        <br />for teams
      </h1>
      <form class="w-full px-10 mb-4 p-4" @submit.prevent="joinRoom">
        <div class="flex flex-col">
          <input
            class="mb-2 py-2 px-3 text-lg font-semi bg-white appearance-none border-2 rounded text-grey-darker focus:outline-none focus:border-green-300"
            placeholder="Room name"
            v-model="roomName"
          />
          <input
            class="mb-2 py-2 px-3 text-lg font-semi bg-white appearance-none border-2 rounded text-grey-darker focus:outline-none focus:border-green-300"
            placeholder="Your name"
            v-model="userName"
          />
          <toggle
            class="m-2"
            id="isSpectator"
            v-model="isSpectator"
            label="Join as spectator"
          />
          <toggle
            class="mx-2 mb-2"
            id="showCats"
            v-model="showCats"
            label="Consensus cats"
          />
          <div class="flex flex-row-reverse">
            <button
              class="mt-6 my-2 bg-gray-300 hover:bg-gray-100 text-lg text-gray-700 font- py-2 px-4 border-2 border-gray-400 rounded"
              :disabled="!formIsCompleted"
              type="submit"
            >
              Join room
            </button>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-full my-6 rounded border border-gray-200" />
            <a
              href="https://apps.apple.com/app/planning-poker-for-teams/id1495956287"
              target="_blank"
            >
              <img class="w-32" src="../assets/app-store-badge.png" />
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Route } from 'vue-router';
import Toggle from '@/components/Toggle.vue';

@Component({
  components: {
    Toggle,
  },
})
export default class Lobby extends Vue {
  roomName = '';
  userName = '';
  isSpectator = false;
  showCats = true;

  beforeMount() {
    const roomNameQuery = this.$route.query.room as string;
    if (roomNameQuery) {
      this.roomName = roomNameQuery;
    }
  }

  get formIsCompleted(): boolean {
    return this.roomName.length > 0 && this.userName.length > 0;
  }

  joinRoom() {
    const { roomName, userName, isSpectator, showCats } = this;
    this.$store.commit('joinRoom', {
      name: roomName,
      userName,
      isSpectator,
      showCats,
    });
    this.$router.push({ name: 'room', params: { roomName } });
  }
}
</script>
