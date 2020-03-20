export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentTask?: string;
  startDate?: Date;
}

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}