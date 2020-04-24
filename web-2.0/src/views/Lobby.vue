<template>
  <div>
    <h1>Planning Poker</h1>
    <p>{{ greeting }}</p>
    <form @submit.prevent>
      <label>Room name</label>
      <input v-model="roomName" />
      <button v-on:click="joinRoom">Join Room</button>
    </form>
    <p>State: {{ joinRoomProperties }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class Lobby extends Vue {
  greeting = "Hello world!";
  roomName = "";

  get joinRoomProperties() {
    return JSON.stringify(this.$store.state);
  }

  joinRoom() {
    this.$store.commit("setRoomName", this.roomName);
  }
}
</script>
