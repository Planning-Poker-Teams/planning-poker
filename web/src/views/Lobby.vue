<template>
  <div
    class="flex-1 lg:flex-none w-full lg:w-1/3 flex flex-col items-center bg-gray-100 lg:shadow-lg lg:rounded-lg relative overflow-y-scroll"
  >
    <img
      class="m-8 mb-4 object-contain h-24 shadow-md rounded-lg"
      alt="Planning Poker App logo"
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
        <div class="mt-2 flex flex-row-reverse items-center ">
          <button
            class="my-2 ml-2 bg-gray-300 hover:bg-gray-100 text-lg text-gray-700 font- py-2 px-4 border-2 border-gray-400 rounded"
            :disabled="!formIsCompleted"
            type="submit"
          >
            Join room
          </button>
          <p class="my-2 mr-2 justify-center text-sm text-gray-700">
            By clicking "Join room" you agree to our
            <a class="underline text-gray-700" href="/privacy">Privacy Policy</a
            >.
          </p>
        </div>

        <div class="my-4x flex flex-col items-center">
          <div class="my-4 w-full rounded border border-gray-200" />
          <a class="underline text-gray-700" href="/legal-notice"
            >Legal notice</a
          >
          <a
            href="https://apps.apple.com/app/planning-poker-for-teams/id1495956287"
            target="_blank"
          >
            <img class="mt-3 w-32" src="../assets/app-store-badge.png" />
          </a>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Route } from 'vue-router';
import Toggle from '@/components/Toggle.vue';
import { Mutations } from '../store/mutations';

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
    this.$store.commit(Mutations.SET_ROOM_INFORMATION, {
      name: roomName,
      userName,
      isSpectator,
      showCats,
    });
    this.$router.push({ name: 'room', params: { roomName } });
  }
}
</script>
