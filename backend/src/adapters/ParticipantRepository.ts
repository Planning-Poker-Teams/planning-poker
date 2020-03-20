import { DynamoDbClient } from "../lib/DynamoDbClient";

export interface Participant {
  connectionId: string;
  roomName: string;
  name: string;
  isSpectator: boolean;
}

export class ParticipantRepository {
  private client: DynamoDbClient;
  private cache = new Map<string, Participant>();

  constructor(
    private participantsTableName: string,
    enableXRay: boolean = true
  ) {
    this.client = new DynamoDbClient(enableXRay);
  }

  async putParticipant(participant: Participant): Promise<void> {
    await this.client.put(this.participantsTableName, participant);
    this.cache.set(participant.connectionId, participant);
  }

  async fetchParticipant(
    connectionId: string
  ): Promise<Participant | undefined> {
    if (this.cache.has(connectionId)) {
      return this.cache.get(connectionId);
    }

    const result = await this.client.get(this.participantsTableName, {
      connectionId
    });
    if (!result || !result.Item) {
      return undefined;
    }

    return result.Item as Participant;
  }

  async fetchParticipants(connectionIds: string[]): Promise<Participant[]> {
    const idsForFetching = connectionIds.filter(id => !this.cache.has(id));
    const idsFromCache = connectionIds.filter(id => this.cache.has(id));

    const result =
      idsForFetching.length > 0
        ? await this.client.batchGet(
            this.participantsTableName,
            "connectionId",
            idsForFetching
          )
        : undefined;

    const participants =
      result?.Responses?.participants.map(result => result as Participant) ??
      [];

    const participantsFromCache = idsFromCache.map(id => this.cache.get(id)!);

    return [...participants, ...participantsFromCache];
  }

  async removeParticipant(connectionId: string): Promise<void> {
    await this.client.delete({
      tableName: this.participantsTableName,
      partitionKey: { connectionId }
    });
    this.cache.delete(connectionId);
  }
}
