import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
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
    const wrapper = mount(Card, {
      props: {
        value: '13',
        selected: true,
      },
    });

    expect(wrapper.classes('bg-red-400')).toBeTruthy();
    expect(wrapper.classes('opacity-90')).toBeTruthy();
    expect(wrapper.classes('bg-blue-400')).toBeFalsy();

    const wrapper2 = mount(Card, {
      props: {
        value: '13',
        selected: false,
      },
    });

    expect(wrapper2.classes('bg-red-400')).toBeFalsy();
    expect(wrapper2.classes('opacity-90')).toBeFalsy();
    expect(wrapper2.classes('bg-blue-400')).toBeTruthy();
  });
});
