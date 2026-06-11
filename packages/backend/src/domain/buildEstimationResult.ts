import { PokerRoom } from './types';

export const buildEstimationResult = (
  room: PokerRoom,
  isEditable: boolean = room.currentEstimation?.status === 'revealed'
): EstimationResult => ({
  eventType: 'estimationResult',
  taskName: room.currentEstimation!.taskName,
  startDate: room.currentEstimation!.startDate,
  endDate: room.currentEstimation!.endDate ?? new Date().toISOString(),
  isEditable,
  allowVoteCorrectionAfterReveal: room.currentEstimation!.allowVoteCorrectionAfterReveal,
  estimates: room.participants.filter(p => !p.isSpectator).map(participant => ({
    userName: participant.name,
    estimate: participant.currentEstimation!,
  })),
});
