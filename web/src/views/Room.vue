<template>
  <div class="p-16 w-full h-full">
    <div
      class="w-full h-full flex flex-col items-center justify-center bg-gray-100 shadow-lg rounded-lg grid grid-rows-3"
    >
      <div class="w-full h-full">
        <h1 class="text-xl font-medium font-sans mb-2 text-center">
          In the room {{ roomName }}
        </h1>
        <div>Participants</div>
      </div>
      <div class="w-full h-full row-span-2 grid grid-rows-2">
        <div
          class="h-32 w-full p-8 flex items-center rounded border-4 border-gray-300 border-dashed text-center"
        >
          <p class="text-2xl font-medium font-sans text-center text-gray-800">
            Some Task here
          </p>
        </div>
        <div class="">Cards / Start estimation</div>
      </div>
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
    const roomNameParam = this.$route.params.roomName;
    const roomName = this.$store.state.room?.name;

    if (!this.$store.state.room || roomName !== roomNameParam) {
      this.$router.push({ name: 'lobby', query: { room: roomNameParam } });
    }
  }

  get roomName(): string {
    return this.$store.state.room?.name;
  }
}
</script>
