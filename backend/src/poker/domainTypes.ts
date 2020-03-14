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

export type InternalCommand =
  | BroadcastMessage
  | SendMessage
  | AddParticipant
  | RemoveParticipant;

export enum CommandType {
  BROADCAST_MESSAGE = "BROADCAST_MESSAGE",
  SEND_MESSAGE = "SEND_MESSAGE",
  ADD_PARTICIPANT = "ADD_PARTICIPANT",
  REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT"
}

export interface BroadcastMessage {
  type: CommandType.BROADCAST_MESSAGE;
  payload: PokerEvent;
}

export interface SendMessage {
  type: CommandType.SEND_MESSAGE;
  recipient: Participant;
  payload: PokerEvent[];
}

export interface AddParticipant {
  type: CommandType.ADD_PARTICIPANT;
  roomName: string;
  participant: Participant;
}

export interface RemoveParticipant {
  type: CommandType.REMOVE_PARTICIPANT;
  roomName: string;
  participant: Participant;
}