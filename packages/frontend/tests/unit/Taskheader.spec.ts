import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import OngoingEstimation from '../../src/components/OngoingEstimation.vue';
import TaskHeader from '../../src/components/TaskHeader.vue';
import {
  EstimationResult as IEstimationResult,
  Participant as IParticipant,
  Estimation as IOngoingEstimation,
} from '../../src/store/types';
import createWrapper from './helper';

const estimationResult: IEstimationResult = {
  taskName: 'test-task',
  startDate: new Date(),
  endDate: new Date(),
  estimates: [
    {userName: 'Hank', estimate: '2'},
    {userName: 'Jessie', estimate: '18'},
    {userName: 'Walter', estimate: '10'},
    {userName: 'Saul', estimate: '10'},
  ],
};

const ongoingEstimation: IOngoingEstimation = {
  taskName: 'test-task',
  startDate: new Date(),
};

describe('taskheader', () => {
  it('should display the correct task name in estimation mode', () => {
    const {wrapper} = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          {name: 'test-user-a', isSpectator: true, hasEstimated: false},
          {name: 'test-user-b', isSpectator: false, hasEstimated: true},
          {name: 'test-user-c', isSpectator: false, hasEstimated: true},
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );
    expect(wrapper.find({ref: 'task-name-display'}).exists()).toBeTruthy();
    expect(wrapper.find({ref: 'task-name-display'}).text()).toContain('test-task');
  });

  it('should show result button and no warning dialog', async () => {
    const {wrapper} = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          {name: 'test-user-a', isSpectator: true, hasEstimated: false},
          {name: 'test-user-b', isSpectator: false, hasEstimated: true},
          {name: 'test-user-c', isSpectator: false, hasEstimated: true},
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );

    const resultButton = wrapper.find({ref: 'show-result-button'});
    expect(resultButton.exists()).toBeTruthy();
    await resultButton.trigger('click');
    expect(wrapper.find('[data-testid=confirm-show-results-dialog]').exists()).toBeFalsy();
  });

  it('should show warning dialog when not all users have voted yet', async () => {
    const {wrapper} = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          {name: 'test-user-a', isSpectator: true, hasEstimated: false},
          {name: 'test-user-b', isSpectator: false, hasEstimated: false},
          {name: 'test-user-c', isSpectator: false, hasEstimated: true},
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );

    await wrapper.find({ref: 'show-result-button'}).trigger('click');
    const confirmDialog = wrapper.find('[data-testid=confirm-show-results-dialog]');
    expect(confirmDialog.exists()).toBeTruthy();
    expect(confirmDialog.text()).include('test-user-b');
  });

  it('should show hint if user is spectator', () => {
    const {wrapper} = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        },
      },
      {
        room: {
          name: 'test-room',
          userName: 'test-user',
          isSpectator: true,
          showCats: false,
        },
        participants: [],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
      }
    );
    expect(wrapper.findAll('div')[2].exists()).toBeTruthy();
    expect(wrapper.findAll('div')[2].text()).toContain('Participants are voting');
  });
});
