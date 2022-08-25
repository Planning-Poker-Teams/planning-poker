import log from '../../log';
import { MessageSender, ParticipantRepository, RoomRepository } from '../repositories/types';

export const cleanUpStaleParticipants = async (
  roomName: string,
  roomRepository: RoomRepository,
  participantRepository: ParticipantRepository,
  messageSender: MessageSender
): Promise<void> => {
  const room = await roomRepository.getOrCreateRoom(roomName);
  log.info('Checking stale participants', { room });

  const connectionData = await Promise.all(
    room.participants.map(connectionId => {
      return messageSender.hasConnection(connectionId).then(hasConnection => ({
        connectionId,
        hasConnection,
      }));
    })
  );

  await Promise.all(
    connectionData
      .filter(({ hasConnection }) => !hasConnection)
      .map(async ({ connectionId }) => {
        log.info('Removing stale participant', { connectionId, roomName });
        await participantRepository.removeParticipant(connectionId);
        await roomRepository.removeFromParticipants(roomName, connectionId);
      })
  );
};
