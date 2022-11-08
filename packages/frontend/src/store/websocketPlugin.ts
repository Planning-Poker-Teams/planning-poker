import { Store, ActionPayload } from 'vuex';
import { ActionType } from '../store/actions';
import { PokerEvent } from '../store/pokerEvents';
import { State } from '../store/types';

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
      case 'changeCardDeck':
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
    const socket = new WebSocket(`wss://${window.planningPoker.apiUrl}`);

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
      const json = JSON.parse(event.data);
      handleIncomingMessage(json);
    };

    return socket;
  };
};

export default webSocketPlugin;
