import ParticipantRepository from "../repositories/ParticipantRepository";
import { Participant, PokerRoom } from "../domain/types";
import RoomRepository from "../repositories/RoomRepository";
import { handlePokerEvent } from "../domain/handlePokerEvent";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { Command, CommandType } from "../domain/commandTypes";

// extract ApiGatewayManagementClient to interface

export class PokerEventInteractor {
  constructor(
    private participantRepository: ParticipantRepository,
    private roomRepository: RoomRepository,
    private messageSender: ApiGatewayManagementClient
  ) {}

  public async handleIncomingEvent(
    pokerEvent: PokerEvent,
    connectionId: string
  ) {
    const participantInfo = await this.participantRepository.fetchParticipantInfo(
      connectionId
    );

    const roomNameFromJoinRoomEvent =
      pokerEvent.eventType === "joinRoom" ? pokerEvent.roomName : undefined;

    const roomName = participantInfo?.roomName || roomNameFromJoinRoomEvent;

    if (!roomName) {
      throw Error(`Participant with id ${connectionId} could not be found.`);
    }

    const room = await this.fetchRoom(roomName);
    const commands = handlePokerEvent(
      room,
      pokerEvent,
      connectionId,
      participantInfo?.participant
    );
    await this.processCommands(commands, room);
  }

  public async handleUserLeft(participantId: string) {
    const participantInfo = await this.participantRepository.fetchParticipantInfo(
      participantId
    );

    if (!participantInfo) {
      throw Error(
        `Participant with connectionId ${participantId} was not found when handling disconnection.`
      );
    }

    const { participant, roomName } = participantInfo;
    const userLeftEvent: UserLeft = {
      eventType: "userLeft",
      userName: participant.name,
    };

    const room = await this.fetchRoom(roomName);
    const commands = handlePokerEvent(
      room,
      userLeftEvent,
      participant.id,
      participant
    );
    await this.processCommands(commands, room);
  }

  private async fetchRoom(roomName: string): Promise<PokerRoom> {
    const room = await this.roomRepository.getOrCreateRoom(roomName);

    const participantsWithoutEstimations = await this.participantRepository.fetchParticipants(
      room.participants
    );

    const participants = participantsWithoutEstimations.map((p) => ({
      ...p,
      currentEstimation: room.currentEstimates.find(
        (e) => e.connectionId === p.id
      )?.value,
    }));

    const currentEstimation =
      room.currentEstimationTaskName != undefined
        ? {
            taskName: room.currentEstimationTaskName!,
            startDate: room.currentEstimationStartDate!,
            initiator: participants.find(
              (p) => p.name === room.currentEstimationInitiator
            ),
          }
        : undefined;

    return {
      name: room.name,
      participants,
      currentEstimation,
    };
  }

  private async processCommands(
    commands: Command[],
    room: PokerRoom
  ): Promise<void> {
    console.log("processing commands:", commands);

    // Make sure commands are processed sequentially:
    return commands.reduce(async (previousPromise, nextCommand) => {
      await previousPromise;
      return this.handleCommand(nextCommand, room.name);
    }, Promise.resolve());
  }

  private async handleCommand(
    command: Command,
    roomName: string
  ): Promise<void> {
    console.log("Handling command", command);
    const pokerRoom = await this.fetchRoom(roomName);

    switch (command.type) {
      case CommandType.BROADCAST_MESSAGE:
        const allConnectionIds = pokerRoom.participants.map((p) => p.id);
        await this.messageSender.broadcast(
          allConnectionIds,
          JSON.stringify(command.payload)
        );
        break;

      case CommandType.SEND_MESSAGE:
        await Promise.all(
          command.payload.map(
            async (payload) =>
              await this.messageSender.post(
                command.recipient.id,
                JSON.stringify(payload)
              )
          )
        );
        break;

      case CommandType.ADD_PARTICIPANT:
        await this.participantRepository.putParticipant(
          command.participant,
          command.roomName
        );
        await this.roomRepository.addToParticipants(
          command.roomName,
          command.participant.id
        );
        break;

      case CommandType.REMOVE_PARTICIPANT:
        await this.participantRepository.removeParticipant(
          command.participant.id
        );
        await this.roomRepository.removeFromParticipants(
          command.roomName,
          command.participant.id
        );
        break;

      case CommandType.SEND_EXISTING_PARTICIPANTS:
        const userJoinedEvents: UserJoined[] = pokerRoom.participants.map(
          (participant) => ({
            eventType: "userJoined",
            userName: participant.name,
            isSpectator: participant.isSpectator,
          })
        );
        await Promise.all(
          userJoinedEvents.map(
            async (payload) =>
              await this.messageSender.post(
                command.recipient.id,
                JSON.stringify(payload)
              )
          )
        );
        break;

      case CommandType.SET_TASK:
        await this.roomRepository.startNewEstimation(
          roomName,
          command.taskName,
          command.participantId,
          command.startDate
        );
        break;

      case CommandType.RECORD_ESTIMATION:
        await this.roomRepository.addToEstimations(
          roomName,
          command.participantId,
          command.estimate
        );
        break;

      case CommandType.FINISH_ROUND:
        await this.roomRepository.finishEstimation(roomName);
        break;
    }
  }
}
