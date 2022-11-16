import OngoingEstimation from '../../src/components/OngoingEstimation.vue';
import createWrapper from './helper';
import { describe, expect, it } from 'vitest';

describe('ongoing estimation', () => {
  it('should use the property "task" to show the task name', () => {
    const { wrapper } = createWrapper(OngoingEstimation, {
      props: {
        taskName: 'test-task',
        currentCardDeck: ['0, 1, 2, 3, 5, 8, 13'],
      },
    });
    expect(wrapper.findAll('div')[1].exists()).toBeTruthy();
    expect(wrapper.findAll('div')[1].text()).toContain('test-task');
  });
  it('should show result button', () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        },
      },
      {
        participants: [
          { name: 'test-user-a', isSpectator: true, hasEstimated: false },
          { name: 'test-user-b', isSpectator: false, hasEstimated: true },
          { name: 'test-user-c', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
      }
    );
    expect(wrapper.find('button[type=submit]').exists()).toBeTruthy();
  });
  it('should not show result button', () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['0, 1, 2, 3, 5, 8, 13'],
        },
      },
      {
        participants: [
          { name: 'test-user-a', isSpectator: true, hasEstimated: false },
          { name: 'test-user-b', isSpectator: false, hasEstimated: false },
          { name: 'test-user-c', isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ['0, 1, 2, 3, 5, 8, 13'],
      }
    );
    expect(wrapper.find('button[type=submit]').exists()).toBeFalsy();
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
