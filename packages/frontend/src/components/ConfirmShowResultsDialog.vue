<template>
  <div
    class="fixed z-10 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex h-screen justify-center items-center"
    data-testid="confirm-show-results-dialog"
  >
    <div
      class="mx-auto p-5 border w-5/6 lg:w-2/4 lg:max-w-xl shadow-lg rounded-md bg-white"
    >
      <div class="mt-3 text-center">
        <template v-if="pendingParticipants.length">
          <p class="text-lg leading-6 font-medium text-gray-900">
            Not everyone has voted yet. Are you sure?
          </p>

          <h4 class="mt-3 mb-1">Pending participants:</h4>
          <ul class="list-none list-outside mb-2 text-left inline-block">
            <li v-for="{ name } in pendingParticipants" :key="name">
              <font-awesome-icon icon="xmark" class="text-red-500" />
              {{ name }}

              <a
                v-if="userName !== name"
                class="cursor-pointer"
                :title="`Remove ${name} from the room`"
                @click="removeUser(name)"
              >
                <small class="pl-2 text-red-500 underline">remove</small>
              </a>
            </li>
          </ul>
        </template>

        <template v-else>
          <p class="text-lg mb-2 leading-6 font-medium text-gray-900">
            Everyone has voted, proceed to view the results by clicking "OK"!
          </p>
        </template>

        <div class="mx-auto flex justify-between py-3">
          <button
            class="mr-5 px-4 py-2 bg-gray-400 text-black text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="ml-5 px-4 py-2 text-base font-medium rounded-md w-5/12 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-codecentric-100 hover:bg-codecentric-200 text-black"
            @click="confirm"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, toRef, computed } from "vue";
import { Store, useStore } from "vuex";
import { ActionType } from "../store/actions";
import { Participant, State } from "../store/types";

const emits = defineEmits(["on_confirm", "on_cancel"]);
const store: Store<State> = useStore();
const pendingParticipants: Ref<Participant[]> = toRef(
  store.getters,
  "pendingParticipants"
);

const confirm = () => emits("on_confirm");
const cancel = () => emits("on_cancel");

const userName = computed(() => {
  return store.state.room?.userName;
});

const removeUser = (userName: string) => {
  store.dispatch(ActionType.REMOVE_USER, userName);
};
</script>
