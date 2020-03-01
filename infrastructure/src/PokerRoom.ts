import { PokerRepository, Room } from "./PokerRepository";

interface State {
  // room: Room;
  roomName: string;
  participants: string[];
  spectators: string[];
}

class PokerRoom {
  private state: State;

  constructor(roomName: string, private pokerRepository: PokerRepository) {
    this.state = this.buildInitialState(roomName);
  }

  /**
   * Entry point for events.
   * @param event
   */
  async processEvent(event: PokerEvent) {
    // fetch latest state using repository
    // update state based on event (handleEvent)

    const room = await this.pokerRepository.fetchRoom(this.state.roomName);
    // const state = {
    //     roomName: room.roomName,
    //     participants: room.
    // }
  }

  handleEvent(state: State, event: PokerEvent): State {
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
        return this.state;
    }
  }

  private buildInitialState(roomName: string): State {
    return {
      roomName,
      participants: [],
      spectators: []
    };
  }
}
