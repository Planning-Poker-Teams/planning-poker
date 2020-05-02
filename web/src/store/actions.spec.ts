import { actions, Actions } from './actions';
import { State } from './types';
import { ActionContext } from 'vuex';
import store from '.';

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
    const requestStartEstimation = (actions[
      Actions.REQUEST_START_ESTIMATION
    ] as any).bind(store);

    requestStartEstimation(actionContext, 'New task');

    expect(actionContext.dispatch).toBeCalledWith(Actions.SEND_MESSAGE, {
      eventType: 'startEstimation',
      taskName: 'New task',
      userName: 'Foo',
      startDate: expect.anything(),
    });
  });

  it('sends an estimation', () => {
    const sendEstimation = (actions[Actions.SEND_ESTIMATION] as any).bind(
      store
    );

    sendEstimation(actionContext, '10');

    expect(actionContext.dispatch).toBeCalledWith(Actions.SEND_MESSAGE, {
      eventType: 'estimate',
      taskName: 'The task',
      userName: 'Foo',
      estimate: '10',
    });
  });

  it('requests showing estimation results', () => {
    const requestResult = (actions[Actions.REQUEST_RESULT] as any).bind(store);

    requestResult(actionContext);

    expect(actionContext.dispatch).toBeCalledWith(Actions.SEND_MESSAGE, {
      eventType: 'showResult',
      userName: 'Foo',
    });
  });
});
