export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentEstimation?: {
    taskName: string;
    startDate: string;
    endDate?: string;
    initiator: Participant;
  }
}

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}
