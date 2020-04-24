<template>
  <div class="w-full m-4 p-2 ">
    <h1 class="font-medium text-xl">Planning Poker</h1>
    <form class="bg-gray-100 p-4" @submit.prevent>
      <div class="mb-4">
        <input
          class="p-2 border border-gray-300 font-medium"
          placeholder="Room name"
          v-model="roomName"
        />
      </div>
      <div class="">
        <button
          class="border py-2 px-4 rounded disabled:cursor-not-allowed"
          v-on:click="joinRoom"
          :disabled="!formIsCompleted"
        >
          Join Room
        </button>
      </div>
    </form>
    <p class="font-mono m-2">State: {{ joinRoomProperties }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class Lobby extends Vue {
  roomName = "";

  get joinRoomProperties() {
    return JSON.stringify(this.$store.state);
  }

  get formIsCompleted(): boolean {
    return this.roomName.length > 0;
  }

  joinRoom() {
    this.$store.commit("setRoomName", this.roomName);
  }
}
</script>
