export interface PokerRoom {
  name: string;
  participants: Participant[];
  currentTask?: string;
}

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  currentEstimation?: string;
}

export enum InternalEventType {
  BROADCAST_MESSAGE = "BROADCAST_MESSAGE",
  SEND_MESSAGE = "SEND_MESSAGE",
  ADD_PARTICIPANT = "ADD_PARTICIPANT"
}

export interface BroadcastMessage {
  type: InternalEventType.BROADCAST_MESSAGE;
  payload: PokerEvent;
}

export interface SendMessage {
  type: InternalEventType.SEND_MESSAGE;
  recipient: Participant;
  payload: PokerEvent[];
}

export interface AddParticipant {
  type: InternalEventType.ADD_PARTICIPANT;
  roomName: string;
  participant: Participant;
}

export type InternalEvent = BroadcastMessage | SendMessage | AddParticipant;
