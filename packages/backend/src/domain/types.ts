export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentEstimation?: {
    taskName: string;
    startDate: string;
    endDate?: string;
    status: EstimationStatus;
    allowVoteCorrectionAfterReveal: boolean;
    participantsAllowedToCorrectVote: string[];
    // can be undefined if participant leaves after starting estimation:
    initiator?: Participant;
  };
  cardDeck: string[];
}

export type EstimationStatus = 'hidden' | 'revealed';

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}
