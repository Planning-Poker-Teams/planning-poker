import { MutationTree } from 'vuex';
import router from '../router';
import {
  ChangeCardDeck,
  EstimationResult,
  StartEstimation,
  UserHasEstimated,
  UserJoined,
  UserLeft,
} from '../store/pokerEvents';
import { State, RoomInformation, EstimationResult as StoreEstimationResult } from '../store/types';

export enum MutationsType {
  SET_ROOM_INFORMATION = 'setRoomInformation',
  LEAVE_ROOM = 'leaveRoom',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  CHANGE_CARD_DECK = 'changeCardDeck',
  START_ESTIMATION = 'startEstimation',
  USER_HAS_ESTIMATED = 'userHasEstimated',
  ESTIMATION_RESULT = 'estimationResult',
}

export type Mutations = {
  [MutationsType.SET_ROOM_INFORMATION](state: State, roomInformation: RoomInformation): void;
  [MutationsType.LEAVE_ROOM](state: State): void;
  [MutationsType.USER_JOINED](state: State, event: UserJoined): void;
  [MutationsType.USER_LEFT](state: State, event: UserLeft): void;
  [MutationsType.CHANGE_CARD_DECK](state: State, event: ChangeCardDeck): void;
  [MutationsType.START_ESTIMATION](state: State, event: StartEstimation): void;
  [MutationsType.USER_HAS_ESTIMATED](state: State, event: UserHasEstimated): void;
  [MutationsType.ESTIMATION_RESULT](state: State, event: EstimationResult): void;
};

const removePendingUserEstimation = (
  userName: string,
  estimationResult: StoreEstimationResult
): StoreEstimationResult => {
  const estimates = estimationResult.estimates.filter(
    userEstimate => userEstimate.userName !== userName || userEstimate.estimate
  );
  return { ...estimationResult, estimates };
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationsType.SET_ROOM_INFORMATION](state: State, roomInformation: RoomInformation) {
    state.room = roomInformation;
    state.participants = [];
    state.ongoingEstimation = undefined;
    state.estimationResult = undefined;
  },
  [MutationsType.LEAVE_ROOM](state: State) {
    state.room = undefined;
    state.cardDeck = [];
    state.participants = [];
    state.ongoingEstimation = undefined;
    state.estimationResult = undefined;
  },
  [MutationsType.USER_JOINED](state: State, event: UserJoined) {
    const participant = {
      name: event.userName,
      isSpectator: event.isSpectator,
      hasEstimated: false,
    };
    const alreadyHasParticipant = state.participants.find(p => p.name == participant.name);
    if (!alreadyHasParticipant) {
      state.participants.push(participant);
    }
  },
  [MutationsType.USER_LEFT](state: State, event: UserLeft) {
    if (state.room?.userName === event.userName) {
      router.push({ name: 'lobby', query: { room: state.room?.name } });
    }
    state.participants = state.participants.filter(p => p.name != event.userName);

    if (state.estimationResult) {
      state.estimationResult = removePendingUserEstimation(event.userName, state.estimationResult);
    }
  },
  [MutationsType.CHANGE_CARD_DECK](state: State, event: ChangeCardDeck) {
    state.cardDeck = event.cardDeck;
  },
  [MutationsType.START_ESTIMATION](state: State, event: StartEstimation) {
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
  [MutationsType.USER_HAS_ESTIMATED](state: State, event: UserHasEstimated) {
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
  [MutationsType.ESTIMATION_RESULT](state: State, event: EstimationResult) {
    state.ongoingEstimation = undefined;
    state.estimationResult = {
      taskName: event.taskName,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      estimates: event.estimates,
    };
  },
};
