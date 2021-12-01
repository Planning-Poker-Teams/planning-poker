import {
  createLogger,
  createStore,
  CommitOptions,
  DispatchOptions,
  Store as VuexStore,
} from 'vuex';
import webSocketPlugin from '../store/websocketPlugin';
import { State } from '../store/types';
import { Mutations, mutations } from '../store/mutations';
import { Actions, actions } from '../store/actions';
import { Getters, getters } from '../store/getters';

export const initialState: State = {
  room: undefined,
  participants: [],
  ongoingEstimation: undefined,
  estimationResult: undefined,
};

const plugins = [webSocketPlugin];
if (import.meta.env.DEV === true) {
  plugins.push(createLogger());
}

export type Store = Omit<
  VuexStore<State>,
  'getters' | 'commit' | 'dispatch'
> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
};

export default createStore<State>({
  state: initialState,
  getters,
  actions,
  mutations,
  modules: {},
  plugins,
});
