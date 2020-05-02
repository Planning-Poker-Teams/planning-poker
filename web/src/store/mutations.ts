import { MutationTree } from 'vuex';
import { State, RoomInformation } from './types';

export enum Mutations {
  SET_ROOM_INFORMATION = 'setRoomInformation',
  USER_JOINED = 'userJoined',
  SEND_MESSAGE = 'sendMessage',
}

export const mutations: MutationTree<State> = {
  [Mutations.SET_ROOM_INFORMATION](state: State, roomInformation: RoomInformation) {
    state.room = roomInformation;
    state.participants = [];
    state.ongoingEstimation = undefined;
    state.estimationResult = undefined;
  },
  leaveRoom(state: State) {
    state.room = undefined;
    state.participants = [];
    state.ongoingEstimation = undefined;
    state.estimationResult = undefined;
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
      startDate: new Date(event.startDate),
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
};
