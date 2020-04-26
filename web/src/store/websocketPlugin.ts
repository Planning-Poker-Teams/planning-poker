import { Store, MutationPayload } from 'vuex';
import { State, Mutations } from '.';

const webSocketPlugin = (store: Store<State>) => {
  let socket: WebSocket | undefined = undefined;

  store.subscribe((mutation: MutationPayload, state: State) => {
    console.log('Store mutation', mutation);

    switch (mutation.type) {
      case Mutations.JOIN_ROOM: {
        if (state.room) {
          const { name, userName, isSpectator } = state.room;
          socket = setupWebSocketConnection(name, userName, isSpectator);
        }
        break;
      }
      case Mutations.LEAVE_ROOM: {
        socket?.close();
        break;
      }
    }
  });

  const handleIncomingMessage = (message: any) => {
    console.log('Received incoming JSON message', message);
    switch (message.eventType) {
      case 'userJoined': {
        store.commit('userJoined', message.userName);
      }
    }
  };

  const setupWebSocketConnection = (
    roomName: string,
    userName: string,
    isSpectator: boolean
  ): WebSocket => {
    const socket = new WebSocket('wss://api.planningpoker.cc/dev');

    socket.onopen = event => {
      socket.send(
        JSON.stringify({
          eventType: 'joinRoom',
          userName,
          roomName,
          isSpectator: false,
        })
      );
    };

    socket.onmessage = event => {
      try {
        const json = JSON.parse(event.data);
        handleIncomingMessage(json);
      } catch (error) {
        console.error('Unable to parse incoming message from event:', event);
      }
    };

    return socket;
  };
};

export default webSocketPlugin;
