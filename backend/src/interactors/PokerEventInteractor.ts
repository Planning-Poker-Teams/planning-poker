import { ParticipantRepository } from "../repositories/ParticipantRepository";
import { Participant, PokerRoom } from "../domain/types";
import { RoomRepository } from "../repositories/RoomRepository";
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

    if (!participantInfo) {
      throw Error(`Participant with id ${connectionId} could not be found.`);
    }

    console.log("Handling incoming event", pokerEvent);
    const room = await this.fetchRoom(participantInfo.roomName);
    const commands = handlePokerEvent(
      room,
      pokerEvent,
      participantInfo.participant
    );
    await this.processCommands(commands, room);
  }

  public async handleUserLeft(participant: Participant, roomName: string) {
    const userLeftEvent: UserLeft = {
      eventType: "userLeft",
      userName: participant.name
    };
    const room = await this.fetchRoom(roomName);
    const commands = handlePokerEvent(room, userLeftEvent, participant);
    await this.processCommands(commands, room);
  }

  private async fetchRoom(roomName: string): Promise<PokerRoom> {
    const room = await this.roomRepository.getOrCreateRoom(roomName);
    const participants = await this.participantRepository.fetchParticipants(
      room.participants
    );

    const currentEstimation =
      room.currentEstimationTaskName != undefined
        ? {
            taskName: room.currentEstimationTaskName!,
            startDate: room.currentEstimationStartDate!,
            initiator: participants.find(
              p => p.name === room.currentEstimationInitiator
            )!
          }
        : undefined;

    return {
      name: room.name,
      participants,
      currentEstimation
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

    switch (command.type) {
      case CommandType.BROADCAST_MESSAGE:
        const pokerRoom = await this.fetchRoom(roomName);
        const allConnectionIds = pokerRoom.participants.map(p => p.id);
        await this.messageSender.broadcast(
          allConnectionIds,
          JSON.stringify(command.payload)
        );
        break;

      case CommandType.SEND_MESSAGE:
        await Promise.all(
          command.payload.map(
            async payload =>
              await this.messageSender.post(
                command.recipient.id,
                JSON.stringify(payload)
              )
          )
        );
        break;

      case CommandType.ADD_PARTICIPANT:
        await this.roomRepository.addToParticipants(
          command.roomName,
          command.participant.id
        );
        break;

      case CommandType.REMOVE_PARTICIPANT:
        await this.roomRepository.removeFromParticipants(
          command.roomName,
          command.participant.id
        );
        break;

      case CommandType.SET_TASK:
        // set current estimation
        break;

      case CommandType.RECORD_ESTIMATION:
        // add new estimation
        break;

      case CommandType.FINISH_ROUND:
        // clear current task
        break;
    }
  }
}
