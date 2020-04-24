import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface State {
  roomName?: string;
}

export default new Vuex.Store<State>({
  state: {
    roomName: undefined,
  },
  mutations: {
    setRoomName(state: State, value: string) {
      state.roomName = value;
    },
  },
  actions: {},
  modules: {},
});
