import { initialState } from '.';
import { mutations } from './mutations';
import { RoomInformation } from './types';

describe('mutations', () => {
  it('stores room information', () => {
    const state = {
      ...initialState,
    };
    const roomInformation: RoomInformation = {
      name: 'TestRoom',
      userName: 'Jane',
      isSpectator: false,
      showCats: true,
    };

    mutations.setRoomInformation(state, roomInformation);

    expect(state.room).toEqual(roomInformation);
  });
});
