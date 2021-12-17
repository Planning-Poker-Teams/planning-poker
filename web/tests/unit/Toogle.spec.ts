import { mount } from '@vue/test-utils';
import Toggle from '../../src/components/Toggle.vue';

describe('Toggle', () => {
  it('render', () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    expect(wrapper.html()).toBe(
      '<label for="id" class="flex items-center cursor-pointer" data-v-8da0d0f8="">\n' +
        '  <div class="relative" data-v-8da0d0f8=""><input id="id" class="hidden" type="checkbox" data-v-8da0d0f8="">\n' +
        '    <div class="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner" data-v-8da0d0f8=""></div>\n' +
        '    <div class="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0" data-v-8da0d0f8=""></div>\n' +
        '  </div>\n' +
        '  <div class="ml-3 text-lg font-semi select-none text-gray-700" data-v-8da0d0f8="">Label Text</div>\n' +
        '</label>'
    );
  });
  it('prop:id', () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'test-id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    expect(wrapper.find('label').attributes('for')).toEqual('test-id');
    expect(wrapper.find('input').attributes('id')).toEqual('test-id');
  });
  it('prop:label', () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'test-id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    expect(wrapper.text()).toContain('Label Text');
  });
  it('prop:modelValue', () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'test-id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    const input = wrapper.find('input');
    expect(input.element.checked).toBeFalsy();
  });
  it('event:change', async () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'test-id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    wrapper.find('input').element.checked = true;
    await wrapper.find('input').trigger('change');

    expect(wrapper.emitted()).toHaveProperty('update:modelValue');
    expect(wrapper.emitted('update:modelValue')[0]).toBeTruthy();
  });
});
