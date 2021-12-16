import { jest } from '@jest/globals';
import { ActionContext } from 'vuex';
import store from '../store';
import { actions, ActionType } from '../store/actions';
import { State } from '../store/types';

describe('actions', () => {
  const state: State = {
    room: {
      name: 'Test',
      userName: 'Foo',
      isSpectator: false,
      showCats: true,
    },
    participants: [
      { name: 'Foo', isSpectator: false, hasEstimated: false },
      { name: 'Bar', isSpectator: false, hasEstimated: false },
    ],
    ongoingEstimation: {
      taskName: 'The task',
      startDate: new Date(),
    },
  };

  const actionContext: ActionContext<State, State> = {
    dispatch: jest.fn(),
    commit: jest.fn(),
    state,
    getters: {},
    rootState: state,
    rootGetters: {},
  };

  it('requests start of a new estimation', () => {
    const requestStartEstimation = actions[ActionType.REQUEST_START_ESTIMATION].bind(store);

    requestStartEstimation(actionContext, 'New task');

    expect(actionContext.dispatch).toBeCalledWith(ActionType.SEND_MESSAGE, {
      eventType: 'startEstimation',
      taskName: 'New task',
      userName: 'Foo',
      startDate: expect.anything(),
    });
  });

  it('sends an estimation', () => {
    const sendEstimation = actions[ActionType.SEND_ESTIMATION].bind(store);

    sendEstimation(actionContext, '10');

    expect(actionContext.dispatch).toBeCalledWith(ActionType.SEND_MESSAGE, {
      eventType: 'estimate',
      taskName: 'The task',
      userName: 'Foo',
      estimate: '10',
    });
  });

  it('requests showing estimation results', () => {
    const requestResult = actions[ActionType.REQUEST_RESULT].bind(store);

    requestResult(actionContext);

    expect(actionContext.dispatch).toBeCalledWith(ActionType.SEND_MESSAGE, {
      eventType: 'showResult',
      userName: 'Foo',
    });
  });
});
