//
/**
 * ⚠️ The API interface of Planning Poker.
 * It should not be changed here but in planning-poker-backend.
 */

export type PokerEvent =
  | JoinRoom
  | UserJoined
  | UserLeft
  | StartEstimation
  | UserEstimate
  | UserHasEstimated
  | RequestShowEstimationResult
  | EstimationResult;

export interface JoinRoom {
  eventType: 'joinRoom';
  userName: string;
  roomName: string;
  isSpectator: boolean;
}

export interface UserJoined {
  eventType: 'userJoined';
  userName: string;
  isSpectator: boolean;
}

export interface UserLeft {
  eventType: 'userLeft';
  userName: string;
}

export interface StartEstimation {
  eventType: 'startEstimation';
  userName: string;
  taskName: string;
  startDate: string;
}

export interface UserEstimate {
  eventType: 'estimate';
  userName: string;
  taskName: string;
  estimate: string;
}

export interface UserHasEstimated {
  eventType: 'userHasEstimated';
  userName: string;
  taskName: string;
}

export interface RequestShowEstimationResult {
  eventType: 'showResult';
  userName: string;
}

export interface EstimationResult {
  eventType: 'estimationResult';
  taskName: string;
  startDate: string;
  endDate: string;
  estimates: { userName: string; estimate: string }[];
}
