import { ActionTree, Dispatch } from 'vuex';
import { State } from '../store/types';

export enum ActionType {
  ENTER_ROOM = 'enterRoom', // handled by websocketPlugin
  LEAVE_ROOM = 'leaveRoom', // handled by websocketPlugin
  SEND_MESSAGE = 'sendMessage', // handled by websocketPlugin
  REQUEST_START_ESTIMATION = 'requestStartEstimation',
  SEND_ESTIMATION = 'sendEstimation',
  REQUEST_RESULT = 'requestShowResult',
}

export type Actions = {
  [ActionType.ENTER_ROOM](): void;
  [ActionType.LEAVE_ROOM](): void;
  [ActionType.SEND_MESSAGE](): void;
  [ActionType.REQUEST_START_ESTIMATION](
    { dispatch, state }: { dispatch: Dispatch; state: State },
    taskName: string
  ): void;
  [ActionType.SEND_ESTIMATION](
    { dispatch, state }: { dispatch: Dispatch; state: State },
    estimate: string
  ): void;
  [ActionType.REQUEST_RESULT]({
    dispatch,
    state,
  }: {
    dispatch: Dispatch;
    state: State;
  }): void;
};

export const actions: ActionTree<State, State> & Actions = {
  [ActionType.ENTER_ROOM]() {},
  [ActionType.LEAVE_ROOM]() {},
  [ActionType.SEND_MESSAGE]() {},
  [ActionType.REQUEST_START_ESTIMATION]({ dispatch, state }, taskName: string) {
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
    dispatch(ActionType.SEND_MESSAGE, startEstimationMessage);
  },
  [ActionType.SEND_ESTIMATION]({ dispatch, state }, estimate: string) {
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
    dispatch(ActionType.SEND_MESSAGE, estimationMessage);
  },
  [ActionType.REQUEST_RESULT]({ dispatch, state }) {
    if (!state.room) {
      console.error('There is no room', state);
      return;
    }
    const showResultMessage: RequestShowEstimationResult = {
      eventType: 'showResult',
      userName: state.room?.userName,
    };
    dispatch(ActionType.SEND_MESSAGE, showResultMessage);
  },
};
