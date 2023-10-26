import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import Card from '../../src/components/Card.vue';

describe('Card', () => {
  it('should use the property "value" on card', () => {
    const wrapper = mount(Card, {
      props: {
        value: '13',
        selected: false,
      },
    });

    expect(wrapper.findAll('p')[0].text()).toContain('13');
    expect(wrapper.findAll('p')[1].text()).toContain('13');
    expect(wrapper.findAll('p')[2].text()).toContain('13');
  });

  it('should use the property "selected" to use the right css classes', () => {
    const selectedCard = mount(Card, {
      props: {
        value: '13',
        selected: true,
      },
    });

    expect(selectedCard.classes('cursor-default')).toBeTruthy();
    expect(selectedCard.classes('cursor-pointer')).toBeFalsy();
    expect(selectedCard.classes('opacity-90')).toBeTruthy();

    const unselectedCard = mount(Card, {
      props: {
        value: '13',
        selected: false,
      },
    });

    expect(unselectedCard.classes('cursor-pointer')).toBeTruthy();
    expect(unselectedCard.classes('cursor-default')).toBeFalsy();
    expect(unselectedCard.classes('bg-blue-400')).toBeTruthy();
  });
});
