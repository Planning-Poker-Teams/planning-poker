<template>
  <div class="p-16 w-full h-full">
    <div
      class="w-full h-full flex flex-col items-center justify-center bg-gray-100 shadow-lg rounded-lg"
    >
      <h1 class="text-2xl font-medium font-sans mb-2 text-center">In the room {{ roomName }}</h1>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';

@Component
export default class Room extends Vue {
  beforeMount() {
      const roomNameParam = this.$route.params.roomName
      const { userName, roomName } = this.$store.state

      if (!userName || !roomName || roomName !== roomNameParam) {
        this.$router.push({ name: 'lobby', query: { roomName: roomNameParam } });
      }
  } 

  get roomName(): string {
      return this.$store.state.roomName
  }
}
</script>
