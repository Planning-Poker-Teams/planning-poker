import { Participant } from '../../domain/types';
import { ParticipantRepository } from '../types';
import { DynamoDbClient } from './DynamoDbClient';

interface ParticipantRowSchema {
  connectionId: string;
  roomName: string;
  name: string;
  isSpectator: boolean;
}

export default class DynamoDbParticipantRepository implements ParticipantRepository {
  private cache = new Map<string, ParticipantRowSchema>();

  constructor(
    private participantsTableName: string,
    private client: DynamoDbClient = new DynamoDbClient()
  ) {}

  async getAllParticipants(): Promise<Participant[]> {
    const allItems = await this.client.scan(this.participantsTableName);

    return allItems.map(item => {
      const participant = {
        id: item.connectionId,
        name: item.name,
        isSpectator: item.isSpectator,
      };
      return participant;
    });
  }

  async putParticipant(participant: Participant, roomName: string): Promise<void> {
    const row = {
      connectionId: participant.id,
      roomName,
      name: participant.name,
      isSpectator: participant.isSpectator,
    };

    await this.client.put(this.participantsTableName, row);
    this.cache.set(participant.id, row);
  }

  async fetchParticipantInfo(
    id: string
  ): Promise<{ participant: Participant; roomName: string } | undefined> {
    if (this.cache.has(id)) {
      const row = this.cache.get(id)!;
      const participant = {
        id: row.connectionId,
        name: row.name,
        isSpectator: row.isSpectator,
      };
      return {
        participant,
        roomName: row.roomName,
      };
    }

    const result = await this.client.get(this.participantsTableName, {
      connectionId: id,
    });
    if (!result || !result.Item) {
      return undefined;
    }
    const row = result.Item;
    const participant = {
      id: row.connectionId,
      name: row.name,
      isSpectator: row.isSpectator,
    };

    return {
      participant,
      roomName: row.roomName,
    };
  }

  async fetchParticipants(ids: string[]): Promise<Participant[]> {
    const idsForFetching = ids.filter(id => !this.cache.has(id));
    const idsFromCache = ids.filter(id => this.cache.has(id));

    const result =
      idsForFetching.length > 0
        ? await this.client.batchGet(this.participantsTableName, 'connectionId', idsForFetching)
        : undefined;

    const participants =
      result?.Responses?.participants.map(result => result as ParticipantRowSchema) ?? [];

    const participantsFromCache = idsFromCache.map(id => this.cache.get(id)!);

    const allParticipants = [...participants, ...participantsFromCache];
    return allParticipants.map(p => ({
      id: p.connectionId,
      name: p.name,
      isSpectator: p.isSpectator,
    }));
  }

  async removeParticipant(id: string): Promise<void> {
    await this.client.delete({
      tableName: this.participantsTableName,
      partitionKey: { connectionId: id },
    });
    this.cache.delete(id);
  }
}
