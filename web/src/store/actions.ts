import { ActionTree } from 'vuex';
import { State } from './types';
import { Mutations } from './mutations';

export enum Actions {
  REQUEST_START_ESTIMATION = 'requestStartEstimation',
  SEND_ESTIMATION = 'sendEstimation',
  REQUEST_RESULT = 'requestShowResult',
}

export const actions: ActionTree<State, State> = {
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
};
