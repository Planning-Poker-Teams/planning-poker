import { initialState } from '../store';
import { mutations } from '../store/mutations';
import { EstimationResult, StartEstimation, UserJoined, UserLeft } from '../store/pokerEvents';
import { RoomInformation, Participant, State } from '../store/types';
import { describe, expect, it } from 'vitest';

const exampleParticipant: Participant = {
  name: 'Foo',
  isSpectator: false,
  hasEstimated: false,
};

const exampleRoom: RoomInformation = {
  name: 'Room Name',
  userName: 'Bar',
  isSpectator: false,
  showCats: false,
};

describe('mutations', () => {
  it('stores room information', () => {
    const state = { ...initialState };
    const roomInformation: RoomInformation = {
      name: 'TestRoom',
      userName: 'Jane',
      isSpectator: false,
      showCats: true,
    };

    mutations.setRoomInformation(state, roomInformation);

    expect(state.room).toEqual(roomInformation);
  });

  it('resets state when leaving room', () => {
    const state: State = {
      participants: [exampleParticipant, { ...exampleParticipant, name: 'Bar' }],
      room: exampleRoom,
      cardDeck: ['S', 'M', 'L'],
    };

    mutations.leaveRoom(state);

    expect(state).toEqual(initialState);
  });

  it('stores card deck information', () => {
    const newCardDeck = ['N', 'E', 'W'];

    const state: State = {
      ...initialState,
      cardDeck: ['O', 'L', 'D'],
    };

    mutations.changeCardDeck(state, {
      eventType: 'changeCardDeck',
      cardDeck: newCardDeck,
    });

    expect(state.cardDeck).toEqual(newCardDeck);
  });

  it('records when participants join', () => {
    const state: State = {
      ...initialState,
      participants: [exampleParticipant],
      room: exampleRoom,
    };
    const userJoined: UserJoined = {
      eventType: 'userJoined',
      userName: 'Bar',
      isSpectator: true,
    };

    mutations.userJoined(state, userJoined);

    expect(state.participants).toEqual([
      exampleParticipant,
      { name: 'Bar', isSpectator: true, hasEstimated: false },
    ]);
  });

  it('only records each participant once (by userName)', () => {
    const state: State = {
      ...initialState,
      participants: [exampleParticipant],
      room: exampleRoom,
    };
    const userJoined: UserJoined = {
      eventType: 'userJoined',
      userName: exampleParticipant.name,
      isSpectator: true,
    };

    mutations.userJoined(state, userJoined);

    expect(state.participants).toEqual([exampleParticipant]);
  });

  it('removes participants when they leave', () => {
    const state: State = {
      ...initialState,
      participants: [exampleParticipant, { ...exampleParticipant, name: 'Bar' }],
      room: exampleRoom,
    };
    const userLeft: UserLeft = {
      eventType: 'userLeft',
      userName: 'Bar',
    };

    mutations.userLeft(state, userLeft);

    expect(state.participants).toEqual([exampleParticipant]);
  });

  it('prepares state if a new estimation is initiated', () => {
    const state: State = {
      ...initialState,
      participants: [
        { ...exampleParticipant, hasEstimated: true },
        { ...exampleParticipant, name: 'Bar', hasEstimated: true },
        {
          ...exampleParticipant,
          name: 'Baz',
          isSpectator: true,
          hasEstimated: true,
        },
      ],
      room: exampleRoom,
      estimationResult: {
        taskName: 'Some old task',
        startDate: new Date(),
        endDate: new Date(),
        estimates: [],
      },
    };
    const startEstimation: StartEstimation = {
      eventType: 'startEstimation',
      userName: 'Foo',
      taskName: 'Estimate this',
      startDate: new Date().toISOString(),
    };

    mutations.startEstimation(state, startEstimation);

    expect(state.participants.every(p => p.hasEstimated == false)).toBeTruthy();
    expect(state.estimationResult).toBeUndefined();
    expect(state.ongoingEstimation).toEqual({
      taskName: startEstimation.taskName,
      startDate: new Date(startEstimation.startDate),
    });
  });

  it('updates participants when they have voted', () => {
    const state: State = {
      ...initialState,
      participants: [
        exampleParticipant,
        { ...exampleParticipant, name: 'Bar', hasEstimated: false },
        {
          ...exampleParticipant,
          name: 'Baz',
          hasEstimated: false,
        },
      ],
      room: exampleRoom,
      ongoingEstimation: {
        taskName: 'Task',
        startDate: new Date(),
      },
    };

    mutations.userHasEstimated(state, {
      eventType: 'userHasEstimated',
      taskName: 'Task',
      userName: 'Bar',
    });
    mutations.userHasEstimated(state, {
      eventType: 'userHasEstimated',
      taskName: 'Task',
      userName: 'Baz',
    });

    expect(state.participants).toEqual([
      exampleParticipant,
      { ...exampleParticipant, name: 'Bar', hasEstimated: true },
      { ...exampleParticipant, name: 'Baz', hasEstimated: true },
    ]);
  });

  it('resets the state if the estimation result is known', () => {
    const state: State = {
      ...initialState,
      participants: [
        exampleParticipant,
        { ...exampleParticipant, name: 'Bar', hasEstimated: false },
        {
          ...exampleParticipant,
          name: 'Baz',
          hasEstimated: false,
        },
      ],
      room: exampleRoom,
      ongoingEstimation: {
        taskName: 'Task',
        startDate: new Date(),
      },
    };

    const result: EstimationResult = {
      eventType: 'estimationResult',
      taskName: 'Task',
      startDate: state.ongoingEstimation?.startDate.toISOString() ?? new Date().toISOString(),
      endDate: new Date().toISOString(),
      estimates: [],
    };

    mutations.estimationResult(state, result);

    expect(state.ongoingEstimation).toBeUndefined();
    expect(state.estimationResult).toEqual({
      taskName: result.taskName,
      startDate: new Date(result.startDate),
      endDate: new Date(result.endDate),
      estimates: result.estimates,
    });
  });
});
