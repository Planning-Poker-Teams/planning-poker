import { Store, ActionPayload } from 'vuex';
import { State } from '../store/types';
import { ActionType } from '../store/actions';

const webSocketPlugin = (store: Store<State>) => {
  let socket: WebSocket | undefined = undefined;

  store.subscribeAction((action: ActionPayload, state: State) => {
    switch (action.type) {
      case ActionType.ENTER_ROOM: {
        if (!state.room) {
          return;
        }
        const { name, userName, isSpectator } = state.room;
        socket = setupWebSocketConnection(name, userName, isSpectator);
        break;
      }
      case ActionType.LEAVE_ROOM: {
        socket?.close();
        break;
      }
      case ActionType.SEND_MESSAGE: {
        socket?.send(JSON.stringify(action.payload));
        break;
      }
    }
  });

  const handleIncomingMessage = (message: PokerEvent) => {
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

    socket.onmessage = (event) => {
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
