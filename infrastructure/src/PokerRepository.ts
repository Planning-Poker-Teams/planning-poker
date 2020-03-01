import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface Participant {
  connectionId: string;
  roomName: string;
  name: string;
  isSpectator: boolean;
}

export interface Room {
  roomName: string;
  participants: string[];
  currentTaskName?: string;
  estimates: { connectionId: string; value: string }[];
}

export class PokerRepository {
  private docClient: DocumentClient;

  constructor(
    private participantsTableName: string,
    private roomsTableName: string
  ) {
    this.docClient = new DocumentClient({ apiVersion: "2012-08-10" });
  }

  fetchParticipant(connectionId: string): Promise<Participant> {
    return {} as any;
  }

  fetchParticipants(connectionIds: string[]): Promise<Participant[]> {
    // BatchGetItems
    return {} as any;
  }

  fetchRoom(roomName: string): Promise<Room> {
    return {} as any;
  }

  joinRoom(connectionId: string, roomName: string): Promise<void> {
    return {} as any;
  }

  leaveRoom(connectionId: string, roomName: string): Promise<void> {
    return {} as any;
  }

  startNewEstimation(
    participant: Participant,
    taskName: string
  ): Promise<void> {
    return {} as any;
  }

  submitEstimation(
    participant: Participant,
    taskName: string,
    value: string
  ): Promise<void> {
    return {} as any;
  }
}
