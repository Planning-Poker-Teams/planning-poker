import { Participant } from '../domain/types';
import { Room } from './dynamodb/RoomRepository';

interface ParticipantInfo {
  participant: Participant;
  roomName: string;
}

export interface ParticipantRepository {
  putParticipant(participant: Participant, roomName: string): Promise<void>;
  fetchParticipantInfo(id: string): Promise<ParticipantInfo | undefined>;
  fetchParticipants(ids: string[]): Promise<Participant[]>;
  removeParticipant(id: string): Promise<void>;
}

export interface RoomRepository {
  getOrCreateRoom(name: string): Promise<Room>;
  deleteRoom(name: string): Promise<void>;
  changeCardDeck(roomName: string, cardDeck: string[]): Promise<void>;
  addToParticipants(name: string, connectionId: string): Promise<void>;
  removeFromParticipants(name: string, connectionId: string): Promise<void>;
  startNewEstimation(
    roomName: string,
    taskName: string,
    initiator: string,
    startDate: string
  ): Promise<void>;
  addToEstimations(roomName: string, connectionId: string, value: string): Promise<void>;
  finishEstimation(roomName: string): Promise<void>;
}

export interface MessageSender {
  broadcast(recipientIds: string[], data: string): Promise<void>;
  post(recipientId: string, data: string): Promise<void>;
  hasConnection(connectionId: string): Promise<boolean>;
}
