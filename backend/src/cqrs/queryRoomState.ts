import { PokerRoom } from "../domain/types";
import { RoomRepository, ParticipantRepository } from "../repositories/types";

export type queryRoomState = (roomName: string) => Promise<PokerRoom>;

export const queryRoomState = (
  roomRepository: RoomRepository,
  participantRepository: ParticipantRepository
) => async (roomName: string): Promise<PokerRoom> => {
  const room = await roomRepository.getOrCreateRoom(roomName);

  const participantsWithoutEstimations = await participantRepository.fetchParticipants(
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
};
