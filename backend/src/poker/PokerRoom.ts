import { ParticipantRepository } from "./ParticipantRepository";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { Severity, Logger } from '../lib/buildLogger';
import { RoomRepository } from './RoomRepository';

interface State {
  roomName: string;
  participants: string[];
  spectators: string[];
  currentTask?: string;
  estimations: Map<string, string>;
}

export class PokerRoom {
  constructor(
    private roomRepository: RoomRepository,
    private gatewayClient: ApiGatewayManagementClient,
    private log: Logger
  ) {}

  async processEvent(event: PokerEvent) {
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
