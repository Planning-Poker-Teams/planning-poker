import { MessageSender, ParticipantRepository, RoomRepository } from "../repositories/types";

export const cleanUpStaleParticipants = async (
  roomName: string,
  roomRepository: RoomRepository,
  participantRepository: ParticipantRepository,
  messageSender: MessageSender
): Promise<void> => {
  const room = await roomRepository.getOrCreateRoom(roomName);
  
  const connectionData = await Promise.all(room.participants.map(connectionId => {
    return messageSender.hasConnection(connectionId)
      .then(hasConnection => ({
        connectionId,
        hasConnection,
      }));
  }));
  
  await Promise.all(
    connectionData
      .filter(({ hasConnection }) => !hasConnection)
      .map(({ connectionId }) =>
        participantRepository
          .removeParticipant(connectionId)
          .then(() =>
            roomRepository.removeFromParticipants(roomName, connectionId)
          )
      )
  );
};
