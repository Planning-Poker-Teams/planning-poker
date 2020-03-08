import { ParticipantRepository, Participant } from "./ParticipantRepository";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { Severity, Logger } from "../lib/buildLogger";
import { RoomRepository } from "./RoomRepository";

interface State {
  roomName: string;
  participants: Participant[];
  spectators: Participant[];
  currentTask?: string;
  estimations: { connectionId: string; value: string }[];
}

export class PokerRoom {
  constructor(
    private roomRepository: RoomRepository,
    private participantRepository: ParticipantRepository,
    private gatewayClient: ApiGatewayManagementClient,
    private log: Logger
  ) {}

  async joinRoom(participant: Participant) {
    await this.participantRepository.putParticipant(participant);

    // Broadcast new user to existing participants:
    const state = await this.hydrateState(participant.roomName);
    this.broadcast(state, {
      eventType: "userJoined",
      userName: participant.name,
      isSpectator: participant.isSpectator
    });

    // Send all other users as userJoined events:
    const allJoinedEvents: UserJoined[] = [
      ...state.participants,
      ...state.spectators
    ].map(p => ({
      eventType: "userJoined",
      userName: p.name,
      isSpectator: p.isSpectator
    }));

    await Promise.all(
      allJoinedEvents.map(event =>
        this.gatewayClient.post(participant.connectionId, JSON.stringify(event))
      )
    );

    await this.roomRepository.addToParticipants(
      participant.roomName,
      participant.connectionId
    );
  }

  async leaveRoom(participant: Participant) {
    await this.participantRepository.removeParticipant(
      participant.connectionId
    );

    if (participant) {
      await this.roomRepository.removeFromParticipants(
        participant.roomName,
        participant.connectionId
      );
    }

    const state = await this.hydrateState(participant.roomName);
    this.broadcast(state, {
      eventType: "userLeft",
      userName: participant.name
    });
  }

  async handleEvent(event: PokerEvent, participant: Participant) {
    const state = await this.hydrateState(participant.roomName);
    this.log(Severity.INFO, "Hydrated state", { state });
    await this.handlePokerEvent(state, event, participant);
  }

  private async handlePokerEvent(
    state: State,
    event: PokerEvent,
    participant: Participant
  ) {
    this.log(Severity.INFO, "Handling event", { event });

    switch (event.eventType) {
      case "startEstimation":
        // todo: validate that estimation is possible
        await this.broadcast(state, event);
        break;

      case "estimate":
        await this.roomRepository.addToEstimations(
          participant.roomName,
          event.taskName,
          event.estimate
        );
        await this.broadcast(state, {
          eventType: "userHasEstimated",
          userName: event.userName,
          taskName: event.taskName
        });
        break;

      case "showResult":
        // see if all users have estimated
        // if so, broadcast estimationResult event
        break;

      default:
        break;
    }
  }

  private async hydrateState(roomName: string) {
    const room = await this.roomRepository.getOrCreateRoom(roomName);

    const participants = (
      await Promise.all(
        room.participants.map(async connectionId =>
          this.participantRepository.fetchParticipant(connectionId)
        )
      )
    ).filter(p => p !== undefined) as Participant[];

    const state = {
      roomName: room.roomName,
      participants: participants.filter(p => !p.isSpectator),
      spectators: participants.filter(p => p!.isSpectator),
      currentTask: undefined,
      estimations: []
    };

    this.log(Severity.INFO, "Hydrated state", state);

    return state;
  }

  private broadcast(state: State, event: PokerEvent) {
    const participantConnectionIds = [
      ...state.participants,
      ...state.spectators
    ].map(p => p.connectionId);

    this.log(Severity.INFO, "broadcasting event to:", {
      participantConnectionIds,
      event
    });

    return this.gatewayClient.broadcast(
      participantConnectionIds,
      JSON.stringify(event)
    );
  }
}
