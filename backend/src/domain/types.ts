export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentEstimation?: {
    taskName: string;
    startDate: string;
    // can be undefined if participant leaves after starting estimation:
    initiator?: Participant;
  };
  cardDeck: string[];
}

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}
