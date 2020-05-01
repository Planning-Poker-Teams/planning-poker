import { GetterTree } from 'vuex';
import { State } from './types';

export enum EstimationState {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
}

export const getters: GetterTree<State, State> = {
  estimationState: (state: State): EstimationState => {
    if (state.ongoingEstimation) {
      return EstimationState.ONGOING;
    } else if (state.estimationResult) {
      return EstimationState.ENDED;
    } else {
      return EstimationState.NOT_STARTED;
    }
  },
  votingIsComplete: (state: State): boolean => {
    return state.participants.every(p => p.hasEstimated || p.isSpectator);
  },
};
