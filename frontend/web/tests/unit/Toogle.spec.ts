import { mount } from '@vue/test-utils';
import Toggle from '../../src/components/Toggle.vue';

describe('Toggle', () => {
  it('should use the property "id" in label and input', () => {
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
  it('should use the property "label" as label text.', () => {
    const wrapper = mount(Toggle, {
      props: {
        id: 'test-id',
        label: 'Label Text',
        modelValue: false,
      }
    });

    expect(wrapper.text()).toContain('Label Text');
  });
  it('should use property "modelValue" as initial value of the checkbox', () => {
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
  it('should emit the "update:modelValue" event', async () => {
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
