export interface RoomState {
  name: string;
  participants: Participant[];
  currentTask?: string;
}

export interface Participant {
  id: string
  name: string
  isSpectator: boolean
  currentEstimation?: string
}

export enum InternalEventType {
  BROADCAST = "BROADCAST"
}

export interface BroadcastEvent {
  type: InternalEventType.BROADCAST
  payload: PokerEvent
}

export type InternalEvent = BroadcastEvent
