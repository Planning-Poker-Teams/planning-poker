import log from '../log';
import { MessageSender, ParticipantRepository, RoomRepository } from '../repositories/types';

export const cleanUpStaleParticipants = async (
  roomName: string,
  roomRepository: RoomRepository,
  participantRepository: ParticipantRepository,
  messageSender: MessageSender
): Promise<void> => {
  const participants = await participantRepository.fetchParticipants(roomName);
  log.info('Checking stale participants', { room: participants });

  const connectionData = await Promise.all(
    participants.map(async ({ id }) => {
      const hasConnection = await messageSender.hasConnection(id);
      return {
        id,
        hasConnection,
      };
    })
  );

  await Promise.all(
    connectionData
      .filter(({ hasConnection }) => !hasConnection)
      .map(async ({ id }) => {
        log.info('Removing stale participant', { id, roomName });
        await participantRepository.removeParticipant(id);
      })
  );
};
