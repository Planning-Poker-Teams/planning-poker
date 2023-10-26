import { mount } from '@vue/test-utils';
import router from '../../src/router';
import { customStore } from '../../src/store';
import { State } from '../../src/store/types';

export default (
  component: any,
  componentOptions = {},
  storeState: State = { participants: [], cardDeck: ['0, 1, 2, 3, 5, 8, 13'] }
) => {
  const store = customStore(storeState);
  return {
    wrapper: mount(component, {
      global: {
        plugins: [store, router],
        stubs: ['FontAwesomeIcon'],
      },
      ...componentOptions,
    }),
    store,
    router,
  };
};
