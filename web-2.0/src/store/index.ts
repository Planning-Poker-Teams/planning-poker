import Vue from 'vue';
import Vuex from 'vuex';
import webSocketPlugin from './websocketPlugin';
import createWebSocketPlugin from './websocketPlugin';

Vue.use(Vuex);

export interface State {
  roomName?: string;
  userName?: string;
  participants: string[];
}

interface RoomInformation {
  roomName?: string;
  userName?: string;
}

export enum Mutations {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  USER_JOINED = 'userJoined',
}

export default new Vuex.Store<State>({
  state: {
    roomName: undefined,
    userName: undefined,
    participants: [],
  },
  mutations: {
    joinRoom(state: State, roomInformation: RoomInformation) {
      state.userName = roomInformation.userName;
      state.roomName = roomInformation.roomName;
      // doesn't work:
      // state = {
      //   ...state,
      //   ...roomInformation,
      // };
    },
    userJoined(state: State, userName: string) {
      state.participants.push(userName);
    },
  },
  actions: {},
  modules: {},
  plugins: [webSocketPlugin],
});
