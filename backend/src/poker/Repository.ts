import { DynamoDbClient } from "../DynamoDbClient";

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

export class Repository {
  private client: DynamoDbClient;

  constructor(
    private participantsTableName: string,
    private roomsTableName: string,
    enableXRay: boolean = true
  ) {
    this.client = new DynamoDbClient(enableXRay);
  }

  async putParticipant(participant: Participant): Promise<void> {
    await this.client.put(this.participantsTableName, participant);
  }

  async fetchParticipant(
    connectionId: string
  ): Promise<Participant | undefined> {
    const result = await this.client.get(this.participantsTableName, {
      connectionId
    });
    if (!result || !result.Item) {
      return undefined;
    }

    return result.Item as Participant;
  }

  async fetchParticipants(connectionIds: string[]): Promise<Participant[]> {
    const result = await this.client.batchGet(
      this.participantsTableName,
      "connectionId",
      connectionIds
    );

    const participants =
      result?.Responses?.participants.map(result => result as Participant) ??
      [];

    return participants;
  }

  async removeParticipant(connectionId: string): Promise<void> {
    await this.client.delete({
      tableName: this.participantsTableName,
      partitionKey: { connectionId }
    });
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
