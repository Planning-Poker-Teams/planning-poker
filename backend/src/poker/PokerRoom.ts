import { Repository, Room } from "./Repository";
import { ApiGatewayManagementClient } from "../ApiGatewayManagementClient";
import { Severity, Logger } from '../buildLogger';

interface State {
  roomName: string;
  participants: string[];
  spectators: string[];
  currentTask?: string;
  estimations: Map<string, string>;
}

export class PokerRoom {
  constructor(
    private pokerRepository: Repository,
    private gatewayClient: ApiGatewayManagementClient,
    private log: Logger
  ) {}

  async processEvent(event: PokerEvent | ConnectionRelatedEvent) {
    this.log(Severity.INFO, "")
    if (event.eventType == "userJoined") {
      const connectionEvent = event as ParticipantConnected;
      const userJoinedEvent = event as UserJoined;
      await this.pokerRepository.putParticipant({
        connectionId: connectionEvent.connectionId,
        roomName: connectionEvent.roomName,
        name: userJoinedEvent.userName,
        isSpectator: userJoinedEvent.isSpectator
      });
    } else if (event.eventType == "userLeft") {
      const disconnectionEvent = event as ParticipantDisconnected;
      await this.pokerRepository.removeParticipant(
        disconnectionEvent.connectionId
      );
    }

    // fetch latest state using repository
    // update state based on event (handlePokerEvent)

    // const room = await this.pokerRepository.fetchRoom(this.state.roomName);

  }

  private handlePokerEvent(state: State, event: PokerEvent): State {
    switch (event.eventType) {
      case "userJoined":
        // perform side-effects here? (broadcast messages, use repo, ...)
        return {
          participants: event.isSpectator
            ? state.participants
            : [event.userName, ...state.participants],

          spectators: event.isSpectator
            ? [event.userName, ...state.spectators]
            : state.spectators,

          ...state
        };

      case "userLeft":
        return state;

      default:
        return state;
    }
  }
}
