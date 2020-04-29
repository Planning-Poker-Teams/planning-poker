import Vue from 'vue';
import Vuex from 'vuex';
import webSocketPlugin from './websocketPlugin';

Vue.use(Vuex);

export interface State {
  room?: RoomInformation;
  participants: Participant[];
  ongoingEstimation?: Estimation;
  estimationResult?: EstimationResult;
}

export interface RoomInformation {
  name: string;
  userName: string;
  isSpectator: boolean;
  showCats: boolean;
}

export interface Participant {
  name: string;
  isSpectator: boolean;
  hasEstimated: boolean;
  estimationValue?: string;
}

export interface Estimation {
  taskName: string;
  start: Date;
}

export interface EstimationResult {
  taskName: string;
  startDate: Date;
  endDate: Date;
  estimates: { userName: string; estimate: string }[];
}

export enum Actions {
  REQUEST_START_ESTIMATION = 'requestStartEstimation',
  SEND_ESTIMATION = 'sendEstimation',
}

export enum Mutations {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  USER_JOINED = 'userJoined',
  SEND_MESSAGE = 'sendMessage',
}

export enum EstimationState {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
}

export default new Vuex.Store<State>({
  state: {
    room: undefined,
    participants: [],
    ongoingEstimation: undefined,
    estimationResult: undefined,
  },
  getters: {
    estimationState: (state: State): EstimationState => {
      if (state.ongoingEstimation) {
        return EstimationState.ONGOING;
      } else if (state.estimationResult) {
        return EstimationState.ENDED;
      } else {
        return EstimationState.NOT_STARTED;
      }
    },
  },
  actions: {
    // should joinRoom, leaveRoom be actions too?
    sendEstimation({ commit, state }, estimate: string) {
      if (!state.room || !state.ongoingEstimation) {
        console.error('There is no room or no ongoing estimation', state);
        return;
      }
      const estimationMessage: UserEstimate = {
        eventType: 'estimate',
        userName: state.room.userName,
        taskName: state.ongoingEstimation?.taskName,
        estimate,
      };
      commit(Mutations.SEND_MESSAGE, estimationMessage);
    },
    requestStartEstimation({ commit, state }, taskName: string) {
      if (!state.room) {
        console.error('There is no room', state);
        return;
      }
      const startEstimationMessage: StartEstimation = {
        eventType: 'startEstimation',
        userName: state.room.userName,
        taskName,
        startDate: new Date().toISOString(),
      };
      commit(Mutations.SEND_MESSAGE, startEstimationMessage);
    },
    requestShowResult({ commit, state }) {
      if (!state.room) {
        console.error('There is no room', state);
        return;
      }
      const showResultMessage: RequestShowEstimationResult = {
        eventType: 'showResult',
        userName: state.room?.userName,
      };
      commit(Mutations.SEND_MESSAGE, showResultMessage);
    },
  },
  mutations: {
    sendMessage(state: State, payload: PokerEvent) {},
    joinRoom(state: State, roomInformation: RoomInformation) {
      state.room = roomInformation;
    },
    userJoined(state: State, event: UserJoined) {
      const participant = {
        name: event.userName,
        isSpectator: event.isSpectator,
        hasEstimated: false,
      };
      const alreadyHasParticipant = state.participants.find(
        p => p.name == participant.name
      );
      if (!alreadyHasParticipant) {
        state.participants.push(participant);
      }
    },
    userLeft(state: State, event: UserLeft) {
      state.participants = state.participants.filter(
        p => p.name != event.userName
      );
    },
    startEstimation(state: State, event: StartEstimation) {
      state.estimationResult = undefined;
      state.participants = state.participants.map(p => ({
        ...p,
        hasEstimated: false,
      }));
      state.ongoingEstimation = {
        taskName: event.taskName,
        start: new Date(event.startDate),
      };
    },
    userHasEstimated(state: State, event: UserHasEstimated) {
      if (state.ongoingEstimation?.taskName !== event.taskName) {
        return;
      }
      state.participants = state.participants.map(p => {
        if (p.name == event.userName) {
          return {
            ...p,
            hasEstimated: true,
          };
        }
        return p;
      });
    },
    estimationResult(state: State, event: EstimationResult) {
      state.ongoingEstimation = undefined;
      state.estimationResult = {
        taskName: event.taskName,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        estimates: event.estimates,
      };
    },
  },
  modules: {},
  plugins: [webSocketPlugin],
});
