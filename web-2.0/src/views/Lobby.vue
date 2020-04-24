<template>
  <div>
    <h1>Planning Poker</h1>
    <p>{{ greeting }}</p>
    <form @submit.prevent>
      <label>Room name</label>
      <input v-bind="roomName" />
      <button v-on:click="setRoomName" />
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default class Lobby extends Vue {
  greeting = "Hello world!";
  roomName = "";

  setRoomName() {
    console.log('updating room name', this.roomName)
    this.$store.commit('roomName', this.roomName)
  }
}
</script>
