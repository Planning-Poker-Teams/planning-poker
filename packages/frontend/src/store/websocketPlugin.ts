import { Store, ActionPayload } from 'vuex';
import { ActionType } from '../store/actions';
import { PokerEvent } from '../store/pokerEvents';
import { State } from '../store/types';
import { ConnectionState } from '.';

const getWebSocketUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL || window.planningPoker.apiUrl;
  if (configuredUrl.includes('://')) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${configuredUrl}`;
};

const readWebSocketMessage = async (data: string | Blob | ArrayBuffer): Promise<string> => {
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof Blob) {
    return data.text();
  }

  return new TextDecoder().decode(data);
};

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
        store.state.connectionState = ConnectionState.CONNECTING;
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
      case 'userRenamed':
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
    const socket = new WebSocket(getWebSocketUrl());

    socket.onopen = () => {
      //TODO: enterRoom should be called after user actually got confirmation of room joining and received taskname etc. to prevent flickering of task creaton modal
      store.commit('enterRoom');
      socket.send(
        JSON.stringify({
          eventType: 'joinRoom',
          userName,
          roomName,
          isSpectator,
        })
      );
    };

    socket.onmessage = async event => {
      const message = await readWebSocketMessage(event.data);
      const json = JSON.parse(message);
      handleIncomingMessage(json);
    };

    socket.onerror = event => {
      console.error('[error] Connection error, see log for details.');
      console.error(event);
    };

    socket.onclose = event => {
      store.commit('leaveRoom');
      if (event.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${event.code}.`);
      } else {
        console.warn(`[close] Connection died, code=${event?.code}.`);
      }
    };

    return socket;
  };
};

export default webSocketPlugin;
