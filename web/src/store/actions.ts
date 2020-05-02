import { ActionTree } from 'vuex';
import { State } from './types';

export enum Actions {
  ENTER_ROOM = 'enterRoom', // handled by websocketPlugin
  LEAVE_ROOM = 'leaveRoom', // handled by websocketPlugin
  SEND_MESSAGE = 'sendMessage', // handled by websocketPlugin
  REQUEST_START_ESTIMATION = 'requestStartEstimation',
  SEND_ESTIMATION = 'sendEstimation',
  REQUEST_RESULT = 'requestShowResult',
}

export const actions: ActionTree<State, State> = {
  [Actions.ENTER_ROOM]() {},
  [Actions.LEAVE_ROOM]() {},
  [Actions.SEND_MESSAGE]() {},
  [Actions.REQUEST_START_ESTIMATION]({ dispatch, state }, taskName: string) {
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
    dispatch(Actions.SEND_MESSAGE, startEstimationMessage);
  },
  [Actions.SEND_ESTIMATION]({ dispatch, state }, estimate: string) {
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
    dispatch(Actions.SEND_MESSAGE, estimationMessage);
  },
  [Actions.REQUEST_RESULT]({ dispatch, state }) {
    if (!state.room) {
      console.error('There is no room', state);
      return;
    }
    const showResultMessage: RequestShowEstimationResult = {
      eventType: 'showResult',
      userName: state.room?.userName,
    };
    dispatch(Actions.SEND_MESSAGE, showResultMessage);
  },
};
