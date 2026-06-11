import { describe, expect, it, vi } from 'vitest';
import OngoingEstimation from '../../src/components/OngoingEstimation.vue';
import TaskHeader from '../../src/components/TaskHeader.vue';
import {
  EstimationResult as IEstimationResult,
  Estimation as IOngoingEstimation,
} from '../../src/store/types';
import createWrapper from './helper';

const estimationResult: IEstimationResult = {
  taskName: 'test-task',
  startDate: new Date(),
  endDate: new Date(),
  isEditable: false,
  allowVoteCorrectionAfterReveal: false,
  estimates: [
    { userName: 'Hank', estimate: '2' },
    { userName: 'Jessie', estimate: '18' },
    { userName: 'Walter', estimate: '10' },
    { userName: 'Saul', estimate: '10' },
  ],
};

const ongoingEstimation: IOngoingEstimation = {
  taskName: 'test-task',
  startDate: new Date(),
  allowVoteCorrectionAfterReveal: false,
};

const editableEstimationResult: IEstimationResult = {
  ...estimationResult,
  isEditable: true,
  allowVoteCorrectionAfterReveal: true,
};

describe('taskheader', () => {
  it('should display the correct task name in estimation mode', () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          { name: 'test-user-a', isSpectator: true, hasEstimated: false },
          { name: 'test-user-b', isSpectator: false, hasEstimated: true },
          { name: 'test-user-c', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );
    expect(wrapper.find({ ref: 'task-name-display' }).exists()).toBeTruthy();
    expect(wrapper.find({ ref: 'task-name-display' }).text()).toContain('test-task');
  });

  it('should show result button and no warning dialog', async () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          { name: 'test-user-a', isSpectator: true, hasEstimated: false },
          { name: 'test-user-b', isSpectator: false, hasEstimated: true },
          { name: 'test-user-c', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );

    const resultButton = wrapper.find('[data-testid=show-result-button]');
    expect(resultButton.exists()).toBeTruthy();
    await resultButton.trigger('click');
    expect(wrapper.find('[data-testid=confirm-show-results-dialog]').exists()).toBeFalsy();
  });

  it('should show warning dialog when not all users have voted yet', async () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        participants: [
          { name: 'test-user-a', isSpectator: true, hasEstimated: false },
          { name: 'test-user-b', isSpectator: false, hasEstimated: false },
          { name: 'test-user-c', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        ongoingEstimation,
      }
    );

    await wrapper.find('[data-testid=show-result-button]').trigger('click');
    const confirmDialog = wrapper.find('[data-testid=confirm-show-results-dialog]');
    expect(confirmDialog.exists()).toBeTruthy();
    expect(confirmDialog.text()).include('test-user-b');
  });

  it('should show an adjust vote button and separator for editable results', () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult: editableEstimationResult,
      }
    );

    expect(wrapper.find('[data-testid=adjust-vote-button]').exists()).toBeTruthy();
    expect(wrapper.find('[data-testid=adjust-vote-separator]').text()).toBe('|');
  });

  it('should not show an adjust vote button for non editable results', () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult,
      }
    );

    expect(wrapper.find('[data-testid=adjust-vote-button]').exists()).toBeFalsy();
    expect(wrapper.find('[data-testid=adjust-vote-separator]').exists()).toBeFalsy();
  });

  it('should open the vote adjustment dialog from the taskbar', async () => {
    const { wrapper } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult: editableEstimationResult,
      }
    );

    await wrapper.find('[data-testid=adjust-vote-button]').trigger('click');

    expect(wrapper.find('[data-testid=vote-adjustment-dialog]').exists()).toBeTruthy();
    const selectedCard = wrapper.findAll('[data-testid=vote-adjustment-card]')[1];
    expect(selectedCard.classes()).toContain('bg-codecentric-100');
    expect(selectedCard.classes()).toContain('cursor-not-allowed');
    expect(selectedCard.attributes('title')).toBe('Your current selection');
    expect(wrapper.find('[data-testid=selected-vote-popover]').text()).toBe(
      'Your current selection'
    );
  });

  it('should close the vote adjustment dialog without dispatching when canceled', async () => {
    const { wrapper, store } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult: editableEstimationResult,
      }
    );
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await wrapper.find('[data-testid=adjust-vote-button]').trigger('click');
    await wrapper.find('[data-testid=cancel-vote-adjustment-button]').trigger('click');

    expect(wrapper.find('[data-testid=vote-adjustment-dialog]').exists()).toBeFalsy();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch the changed vote when confirmed', async () => {
    const { wrapper, store } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult: editableEstimationResult,
      }
    );
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await wrapper.find('[data-testid=adjust-vote-button]').trigger('click');
    await wrapper.findAll('[data-testid=vote-adjustment-card]')[2].trigger('click');
    await wrapper.find('[data-testid=confirm-vote-adjustment-button]').trigger('click');

    expect(wrapper.find('[data-testid=vote-adjustment-dialog]').exists()).toBeFalsy();
    expect(dispatchSpy).toHaveBeenCalledWith('sendEstimation', '3');
  });

  it('should close the vote adjustment dialog without dispatching when the vote is unchanged', async () => {
    const { wrapper, store } = createWrapper(
      TaskHeader,
      {},
      {
        room: {
          name: 'test-room',
          userName: 'Hank',
          isSpectator: false,
          showCats: false,
        },
        participants: [
          { name: 'Hank', isSpectator: false, hasEstimated: true },
          { name: 'Jessie', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['1', '2', '3', '5', '8'],
        estimationResult: editableEstimationResult,
      }
    );
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await wrapper.find('[data-testid=adjust-vote-button]').trigger('click');
    await wrapper.find('[data-testid=confirm-vote-adjustment-button]').trigger('click');

    expect(wrapper.find('[data-testid=vote-adjustment-dialog]').exists()).toBeFalsy();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should show hint if user is spectator', () => {
    const { wrapper } = createWrapper(
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
