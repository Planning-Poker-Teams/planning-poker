import { PokerRoom } from "../domain/types";
import { RoomRepository, ParticipantRepository } from "../repositories/types";
import { Estimate } from "../repositories/dynamodb/RoomRepository";

export type queryRoomState = (roomName: string) => Promise<PokerRoom>;

const sortByDescendingTimestamp = (
  first: Estimate,
  second: Estimate
) => {
  const firstTimestamp = new Date(first.timestamp);
  const secondTimestamp = new Date(second.timestamp);
  return firstTimestamp < secondTimestamp
    ? 1
    : firstTimestamp > secondTimestamp
    ? -1
    : 0;
};

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
    currentEstimation: room.currentEstimates
      .sort(sortByDescendingTimestamp)
      .find((e) => e.connectionId === p.id)?.value,
  }));

  const currentEstimation =
    room.currentEstimationTaskName != undefined
      ? {
          taskName: room.currentEstimationTaskName!,
          startDate: room.currentEstimationStartDate!,
          initiator: participants.find(
            (p) => p.id === room.currentEstimationInitiator
          ),
        }
      : undefined;

  return {
    name: room.name,
    participants,
    currentEstimation,
  };
};
