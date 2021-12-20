import log from '../../log';
import { handleCommand } from '../cqrs/handleCommand';
import { queryRoomState } from '../cqrs/queryRoomState';
import { Command } from '../domain/commandTypes';
import { handlePokerEvent } from '../domain/handlePokerEvent';
import { ParticipantRepository, RoomRepository, MessageSender } from '../repositories/types';

export default class PokerEventInteractor {
  private queryRoomState: queryRoomState;
  private handleCommand: handleCommand;

  constructor(
    private participantRepository: ParticipantRepository,
    roomRepository: RoomRepository,
    messageSender: MessageSender
  ) {
    this.queryRoomState = queryRoomState(roomRepository, participantRepository);
    this.handleCommand = handleCommand(roomRepository, participantRepository, messageSender);
  }

  public async handleIncomingEvent(pokerEvent: PokerEvent, connectionId: string): Promise<void> {
    const participantInfo = await this.participantRepository.fetchParticipantInfo(connectionId);

    const roomNameFromJoinRoomEvent =
      pokerEvent.eventType === 'joinRoom' ? pokerEvent.roomName : undefined;

    // probably: call cleanUpStaleConnections from here

    const roomName = participantInfo?.roomName || roomNameFromJoinRoomEvent;

    if (!roomName) {
      throw Error(`Participant with id ${connectionId} could not be found.`);
    }

    log.info('Incoming message', {
      roomName,
      userName: participantInfo?.participant.name,
      message: pokerEvent,
      direction: 'incoming',
    });

    const room = await this.queryRoomState(roomName);
    const commands = handlePokerEvent(room, pokerEvent, connectionId, participantInfo?.participant);
    await this.processCommandsSequentially(commands, roomName);
  }

  public async handleUserLeft(participantId: string): Promise<void> {
    const participantInfo = await this.participantRepository.fetchParticipantInfo(participantId);

    if (!participantInfo) {
      log.warn(
        `Participant with connectionId ${participantId} was not found. Will not handle disconnection.`
      );
      return;
    }

    const { participant, roomName } = participantInfo;
    const userLeftEvent: UserLeft = {
      eventType: 'userLeft',
      userName: participant.name,
    };

    const room = await this.queryRoomState(roomName);
    const commands = handlePokerEvent(room, userLeftEvent, participant.id, participant);
    await this.processCommandsSequentially(commands, roomName);
  }

  private async processCommandsSequentially(commands: Command[], roomName: string): Promise<void> {
    // Make sure commands are processed sequentially:
    return commands.reduce(async (previousPromise, nextCommand) => {
      await previousPromise;

      const pokerRoom = await this.queryRoomState(roomName);
      return this.handleCommand(nextCommand, pokerRoom);
    }, Promise.resolve());
  }
}
