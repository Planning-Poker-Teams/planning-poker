import { GetterTree } from 'vuex';
import { State, Estimate } from './types';

export enum EstimationState {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
}

type EstimationResult = { value: string; names: string[] }[];

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
  resultBySize: (state: State): EstimationResult | undefined => {
    if (!state.estimationResult) {
      return undefined;
    }
    const data = state.estimationResult.estimates.reduce(
      (
        accumulator: { value: string; names: string[] }[],
        estimate: Estimate
      ) => {
        const value = estimate.estimate;
        const existingEntry = accumulator.find(entry => entry.value == value);
        if (existingEntry) {
          return accumulator.map(entry => {
            if (entry.value == value) {
              return { ...entry, names: [...entry.names, estimate.userName] };
            } else {
              return entry;
            }
          });
        } else {
          return [...accumulator, { value, names: [estimate.userName] }];
        }
      },
      []
    );
    return data.sort((a, b) => {
      const aNumberOfVotes = a.names.length;
      const bNumberOfVotes = b.names.length;

      return aNumberOfVotes < bNumberOfVotes
        ? 1
        : aNumberOfVotes > bNumberOfVotes
        ? -1
        : 0;
    });
  },
};
