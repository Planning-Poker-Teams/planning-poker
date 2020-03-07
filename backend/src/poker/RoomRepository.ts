import { DynamoDbClient } from "../lib/DynamoDbClient";

export interface Room {
  roomName: string;
  participants: string[];
  currentTaskName?: string;
  estimates: { connectionId: string; value: string }[];
}

export class RoomRepository {
  private client: DynamoDbClient;

  constructor(private roomsTableName: string, enableXRay: boolean = true) {
    this.client = new DynamoDbClient(enableXRay);
  }

  // fetchRoom(roomName: string): Promise<Room> {
  //   return {} as any;
  // }

  // joinRoom(connectionId: string, roomName: string): Promise<void> {
  //   return {} as any;
  // }

  // leaveRoom(connectionId: string, roomName: string): Promise<void> {
  //   return {} as any;
  // }
  // startNewEstimation(
  //   participant: Participant,
  //   taskName: string
  // ): Promise<void> {
  //   return {} as any;
  // }
  // submitEstimation(
  //   participant: Participant,
  //   taskName: string,
  //   value: string
  // ): Promise<void> {
  //   return {} as any;
  // }
  // endEstimationRound()
  // leaveRoom()
}
