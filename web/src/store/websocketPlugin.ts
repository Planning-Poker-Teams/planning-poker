import { Store, ActionPayload } from 'vuex';
import { State } from './types';
import { Actions } from './actions';

const log = (msg: string, obj?: any) => {
  if (process.env.ENVIRONMENT !== 'production') {
    console.log(msg, obj);
  }
};

const webSocketPlugin = (store: Store<State>) => {
  let socket: WebSocket | undefined = undefined;
  let isUserInRoom: boolean = false;

  store.subscribeAction((action: ActionPayload, state: State) => {
    switch (action.type) {
      case Actions.ENTER_ROOM: {
        if (!state.room) {
          return;
        }
        const { name, userName, isSpectator } = state.room;
        socket = setupWebSocketConnection(name, userName, isSpectator);
        isUserInRoom = true;
        break;
      }
      case Actions.LEAVE_ROOM: {
        socket?.close();
        isUserInRoom = false;
        break;
      }
      case Actions.SEND_MESSAGE: {
        log('Sending JSON message', action.payload);
        socket?.send(JSON.stringify(action.payload));
        break;
      }
    }
  });

  const handleIncomingMessage = (message: PokerEvent) => {
    log('Received incoming JSON message', message);
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
    const newSocket = new WebSocket('wss://api.planningpoker.cc/dev');
    (window as any).socket = newSocket;

    newSocket.onopen = () => {
      console.log('sending join room event');
      newSocket.send(
        JSON.stringify({
          eventType: 'joinRoom',
          userName,
          roomName,
          isSpectator,
        })
      );
    };

    newSocket.onmessage = event => {
      try {
        const json = JSON.parse(event.data);
        handleIncomingMessage(json);
      } catch (error) {
        console.error('Unable to parse incoming message from event:', event);
      }
    };

    newSocket.onclose = () => {
      console.log('Web socket connection closed');
      if (isUserInRoom) {
        socket = setupWebSocketConnection(
          roomName,
          userName,
          isSpectator
        );
      }
    };

    return newSocket;
  };
};

export default webSocketPlugin;
