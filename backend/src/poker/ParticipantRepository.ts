import { DynamoDbClient } from "../lib/DynamoDbClient";

export interface Participant {
  connectionId: string;
  roomName: string;
  name: string;
  isSpectator: boolean;
}

export class ParticipantRepository {
  private client: DynamoDbClient;

  constructor(
    private participantsTableName: string,
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
}
