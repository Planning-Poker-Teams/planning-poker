export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentTask?: string;
  startDate?: string;
}

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}