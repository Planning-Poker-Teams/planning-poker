import {
  createLogger,
  createStore,
  CommitOptions,
  DispatchOptions,
  Store as VuexStore,
} from 'vuex';
import { Actions, actions } from '../store/actions';
import { Getters, getters } from '../store/getters';
import { Mutations, mutations } from '../store/mutations';
import { State } from '../store/types';
import webSocketPlugin from '../store/websocketPlugin';

export enum ConnectionState {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
}

export const initialState: State = {
  room: undefined,
  cardDeck: [],
  participants: [],
  ongoingEstimation: undefined,
  estimationResult: undefined,
  connectionState: ConnectionState.NOT_CONNECTED,
};

const plugins = [webSocketPlugin];
if (import.meta.env.DEV === true) {
  plugins.push(createLogger());
}

const defaultOptions = {
  state: initialState,
  getters,
  actions,
  mutations,
  modules: {},
  plugins,
};

export type Store = Omit<VuexStore<State>, 'getters' | 'commit' | 'dispatch'> & {
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

export const customStore = (options: State) => {
  const customOptions = { ...defaultOptions };
  customOptions.state = { ...customOptions.state, ...options };
  return createStore<State>(customOptions);
};

export default createStore<State>(defaultOptions);
