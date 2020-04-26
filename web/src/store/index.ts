import Vue from 'vue';
import Vuex from 'vuex';
import webSocketPlugin from './websocketPlugin';
import createWebSocketPlugin from './websocketPlugin';

Vue.use(Vuex);

export interface State {
  room?: RoomInformation;
  participants: string[];
}

export interface RoomInformation {
  name: string;
  userName: string;
  isSpectator: boolean;
  showCats: boolean;
}

export enum Mutations {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  USER_JOINED = 'userJoined',
}

export default new Vuex.Store<State>({
  state: {
    room: undefined,
    participants: [],
  },
  getters: {},
  actions: {},
  mutations: {
    joinRoom(state: State, roomInformation: RoomInformation) {
      state.room = roomInformation;
    },
    userJoined(state: State, userName: string) {
      state.participants.push(userName);
    },
  },
  modules: {},
  plugins: [webSocketPlugin],
});
