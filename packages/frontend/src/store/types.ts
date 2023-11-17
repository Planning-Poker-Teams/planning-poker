export interface State {
  room?: RoomInformation;
  cardDeck: string[];
  participants: Participant[];
  ongoingEstimation?: Estimation;
  estimationResult?: EstimationResult;
  connectionState?: string;
}

export interface RoomInformation {
  name: string;
  userName: string;
  isSpectator: boolean;
  showCats: boolean;
}

export interface Participant {
  name: string;
  isSpectator: boolean;
  hasEstimated: boolean;
}

export interface Estimation {
  taskName: string;
  startDate: Date;
}

export interface EstimationResult {
  taskName: string;
  startDate: Date;
  endDate: Date;
  estimates: Estimate[];
}

export interface Estimate {
  userName: string;
  estimate?: string;
}
