import Vue from 'vue';
import Vuex from 'vuex';
import webSocketPlugin from './websocketPlugin';
import { State } from './types';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';

Vue.use(Vuex);

export const initialState: State = {
  room: undefined,
  participants: [],
  ongoingEstimation: undefined,
  estimationResult: undefined,
};

export default new Vuex.Store<State>({
  state: initialState,
  getters,
  actions,
  mutations,
  modules: {},
  plugins: [webSocketPlugin],
});
