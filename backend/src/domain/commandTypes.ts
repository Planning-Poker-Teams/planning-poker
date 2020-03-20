import { Participant } from "./types";

export type Command =
  | BroadcastMessage
  | SendMessage
  | AddParticipant
  | RemoveParticipant
  | RecordEstimation
  | FinishRound;

export enum CommandType {
  BROADCAST_MESSAGE = "BROADCAST_MESSAGE",
  SEND_MESSAGE = "SEND_MESSAGE",
  ADD_PARTICIPANT = "ADD_PARTICIPANT",
  REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT",
  SET_TASK_NAME = "SET_TASK_NAME",
  RECORD_ESTIMATION = "RECORD_ESTIMATION",
  FINISH_ROUND = "FINISH_ROUND"
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

export interface SetTaskName {
  type: CommandType.SET_TASK_NAME;
  roomName: string;
  taskName: string;
  startDate: string;
}

export interface RecordEstimation {
  type: CommandType.RECORD_ESTIMATION;
  roomName: string;
  taskName: string;
  estimate: string;
}

export interface FinishRound {
  type: CommandType.FINISH_ROUND;
  roomName: string;
}
