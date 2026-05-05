import { describe, expect, it } from 'vitest';
import OngoingEstimation from '../../src/components/OngoingEstimation.vue';
import createWrapper from './helper';

describe('ongoing estimation', () => {
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
    expect(wrapper.text()).toContain('Participants are voting');
  });

  it('emits the selected estimate', async () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['1', '2', '3'],
        },
      },
      {
        room: {
          name: 'test-room',
          userName: 'test-user',
          isSpectator: false,
          showCats: false,
        },
        participants: [],
        cardDeck: ['1', '2', '3'],
      }
    );

    await wrapper.findAll('[data-testid=estimation-card]')[1].trigger('click');

    expect(wrapper.emitted('send-estimation')).toEqual([['2']]);
  });

  it('renders the selected card in the vote target and keeps a deck placeholder', async () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['1', '2', '3'],
        },
      },
      {
        room: {
          name: 'test-room',
          userName: 'test-user',
          isSpectator: false,
          showCats: false,
        },
        participants: [],
        cardDeck: ['1', '2', '3'],
      }
    );

    await wrapper.findAll('[data-testid=estimation-card]')[1].trigger('click');

    const targetField = wrapper.find('[data-testid=card-target-field]');
    expect(targetField.find('[data-testid=selected-estimation-card]').text()).toContain('2');
    expect(wrapper.find('[data-testid=selected-estimation-placeholder]').exists()).toBeTruthy();
    expect(wrapper.findAll('[data-testid=estimation-card]')).toHaveLength(2);

    window.dispatchEvent(new Event('resize'));

    expect(targetField.find('[data-testid=selected-estimation-card]').text()).toContain('2');
  });

  it('moves the selected card when the vote changes', async () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: 'test-task',
          currentCardDeck: ['1', '2', '3'],
        },
      },
      {
        room: {
          name: 'test-room',
          userName: 'test-user',
          isSpectator: false,
          showCats: false,
        },
        participants: [],
        cardDeck: ['1', '2', '3'],
      }
    );

    await wrapper.findAll('[data-testid=estimation-card]')[1].trigger('click');
    await wrapper.findAll('[data-testid=estimation-card]')[0].trigger('click');

    const targetField = wrapper.find('[data-testid=card-target-field]');
    expect(targetField.find('[data-testid=selected-estimation-card]').text()).toContain('1');
    expect(wrapper.emitted('send-estimation')).toEqual([['2'], ['1']]);
    expect(wrapper.findAll('[data-testid=estimation-card]')).toHaveLength(2);
    expect(wrapper.find('[data-testid=selected-estimation-placeholder]').exists()).toBeTruthy();
  });
});
