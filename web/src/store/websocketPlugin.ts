import { Store, MutationPayload } from 'vuex';
import { State, Mutations } from '.';

const webSocketPlugin = (store: Store<State>) => {
  let socket: WebSocket | undefined = undefined;

  store.subscribe((mutation: MutationPayload, state: State) => {
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

      // send message
    }
  });

  const handleIncomingMessage = (message: PokerEvent) => {
    console.log('Received incoming JSON message', message);
    switch (message.eventType) {
      case 'userJoined':
      case 'userLeft':
      case 'startEstimation':
      case 'userHasEstimated':
      case 'estimationResult':
        store.commit(message.eventType, message);
        break;
    }
  };

  const setupWebSocketConnection = (
    roomName: string,
    userName: string,
    isSpectator: boolean
  ): WebSocket => {
    const socket = new WebSocket('wss://api.planningpoker.cc/dev');

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          eventType: 'joinRoom',
          userName,
          roomName,
          isSpectator,
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
