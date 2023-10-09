<template>
  <div
    v-if="show"
    class="fixed z-10 inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="connection-status-dialog"
  >
    <div
      v-if="store.state.connectionState == ConnectionState.CONNECTING"
      class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] border-codecentric-200"
      role="status"
    >
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span
      >
    </div>
    <div
      v-if="store.state.connectionState == ConnectionState.NOT_CONNECTED"
      class="bg-gray-800 p-3 text-lg text-white"
    >
      <div class="max-w-sm p-4">
        <div class="text-sm">
          <span class="font-bold">Connection Error</span><br />
          There seems to be a problem connecting to the server. Please retry
          from the lobby.
        </div>

        <div class="flex justify-between pt-5">
          <button
            class="bg-gray-500 px-4 py-2 text-sm font-bold text-white"
            @click="backToLobby()"
          >
            Back to Lobby.
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ConnectionState } from "../store";
const router = useRouter();

const store = useStore();

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const backToLobby = () => {
  router.push({ name: "lobby", query: { room: store.state.room.name } });
};
</script>
