import { Command, CommandType } from '../domain/commandTypes';
import { PokerRoom } from '../domain/types';
import log from '../log';
import { RoomRepository, ParticipantRepository, MessageSender } from '../repositories/types';
import { cleanUpStaleParticipants } from './cleanUpStaleParticipants';

export type handleCommand = (command: Command, room: PokerRoom) => Promise<void>;

export const handleCommand =
  (
    roomRepository: RoomRepository,
    participantRepository: ParticipantRepository,
    messageSender: MessageSender
  ) =>
  async (command: Command, room: PokerRoom): Promise<void> => {
    switch (command.type) {
      case CommandType.BROADCAST_MESSAGE: {
        const allParticipants = await participantRepository.fetchParticipants(room.name);
        const allConnectionIds = allParticipants.map(p => p.id);
        log.info('Outgoing message (broadcast)', {
          message: command.payload,
          direction: 'outgoing',
          broadcast: true,
        });
        await messageSender.broadcast(allConnectionIds, JSON.stringify(command.payload));
        break;
      }
      case CommandType.SEND_MESSAGE: {
        await Promise.all(
          command.payload.map(async payload => {
            log.info('Outgoing message', {
              message: payload,
              direction: 'outgoing',
              connectionId: command.recipient.id,
            });
            await messageSender.post(command.recipient.id, JSON.stringify(payload));
          })
        );
        break;
      }

      case CommandType.ADD_PARTICIPANT: {
        await cleanUpStaleParticipants(
          command.roomName,
          roomRepository,
          participantRepository,
          messageSender
        );
        await participantRepository.putParticipant(command.participant, command.roomName);
        break;
      }

      case CommandType.REMOVE_PARTICIPANT: {
        await participantRepository.removeParticipant(command.participant.id);
        break;
      }

      case CommandType.SEND_EXISTING_PARTICIPANTS: {
        const allParticipants = await participantRepository.fetchParticipants(room.name);
        const userJoinedEvents: UserJoined[] = allParticipants.map(participant => ({
          eventType: 'userJoined',
          userName: participant.name,
          isSpectator: participant.isSpectator,
        }));
        await Promise.all(
          userJoinedEvents.map(
            async payload => await messageSender.post(command.recipient.id, JSON.stringify(payload))
          )
        );
        break;
      }

      case CommandType.CHANGE_CARD_DECK: {
        await roomRepository.changeCardDeck(room.name, command.newCardDeck);
        break;
      }

      case CommandType.SET_TASK: {
        await roomRepository.startNewEstimation(
          room.name,
          command.taskName,
          command.participantId,
          command.startDate
        );
        break;
      }

      case CommandType.RECORD_ESTIMATION: {
        await roomRepository.addToEstimations(room.name, command.participantId, command.estimate);
        break;
      }

      case CommandType.FINISH_ROUND: {
        await roomRepository.finishEstimation(room.name);
        break;
      }
    }
  };
