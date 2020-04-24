import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface State {
  roomName?: string;
  userName?: string;
}

interface RoomInformation {
  roomName?: string;
  userName?: string;
}

export default new Vuex.Store<State>({
  state: {
    roomName: undefined,
    userName: undefined,
  },
  mutations: {
    setRoomInformation(state: State, roomInformation: RoomInformation) {
      state.userName = roomInformation.userName;
      state.roomName = roomInformation.roomName;
      // doesn't work:
      // state = {
      //   ...state,
      //   ...roomInformation,
      // };
    },
  },
  actions: {},
  modules: {},
});
