import { RoomRepository } from '../types';
import { DynamoDbClient } from './DynamoDbClient';

export interface Room {
  name: string;
  participants: string[];
  currentEstimationTaskName?: string;
  currentEstimationStartDate?: string;
  currentEstimationInitiator?: string;
  currentEstimates: Estimate[];
  cardDeck: string[];
}

export interface Estimate {
  connectionId: string;
  timestamp: string;
  value: string;
}

export default class DynamoDbRoomRepository implements RoomRepository {
  constructor(
    private roomsTableName: string,
    private client: DynamoDbClient = new DynamoDbClient()
  ) {}

  async getOrCreateRoom(name: string): Promise<Room> {
    const room = await this.client.get(this.roomsTableName, { name }, true);
    if (!room.Item) {
      await this.client.put(this.roomsTableName, {
        name,
        cardDeck: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '???'],
      });
      const newRoom = await this.client.get(this.roomsTableName, { name }, true);
      return this.mapDocumentToRoom(newRoom.Item);
    }
    return this.mapDocumentToRoom(room.Item);
  }

  async deleteRoom(name: string): Promise<void> {
    await this.client.delete({
      tableName: this.roomsTableName,
      partitionKey: { name },
    });
  }

  async changeCardDeck(roomName: string, cardDeck: string[]): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name: roomName },
      updateExpression: `
        SET 
          cardDeck = :cardDeck`,
      expressionAttributeValues: {
        ':cardDeck': cardDeck,
      },
    });
  }

  async addToParticipants(name: string, connectionId: string): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: 'ADD participants :newParticipant',
      expressionAttributeValues: {
        ':newParticipant': this.client.createSetExpression([connectionId]),
      },
    });
  }

  async removeFromParticipants(name: string, connectionId: string): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: 'DELETE participants :participant',
      expressionAttributeValues: {
        ':participant': this.client.createSetExpression([connectionId]),
      },
    });
  }

  async startNewEstimation(
    roomName: string,
    taskName: string,
    initiator: string,
    startDate: string
  ): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name: roomName },
      updateExpression: `
        SET 
          currentEstimationTaskName = :taskName, 
          currentEstimationInitiator = :initiator, 
          currentEstimationStartDate = :startDate 
        REMOVE currentEstimates`,
      expressionAttributeValues: {
        ':taskName': taskName,
        ':initiator': initiator,
        ':startDate': startDate,
      },
    });
  }

  async addToEstimations(
    roomName: string,
    connectionId: string,
    value: string,
    timestamp: Date = new Date()
  ): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name: roomName },
      updateExpression: 'ADD currentEstimates :newEstimate',
      expressionAttributeValues: {
        ':newEstimate': this.client.createSetExpression([
          JSON.stringify({
            connectionId,
            timestamp,
            value,
          }),
        ]),
      },
    });
  }

  async finishEstimation(roomName: string): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name: roomName },
      updateExpression: `
      REMOVE 
        currentEstimationTaskName,
        currentEstimationStartDate,
        currentEstimationInitiator,
        currentEstimates`,
    });
  }

  private mapDocumentToRoom(roomItem: any): Room {
    return {
      name: roomItem.name,
      participants: roomItem.participants?.values ?? [],
      currentEstimationTaskName: roomItem.currentEstimationTaskName,
      currentEstimationStartDate: roomItem.currentEstimationStartDate,
      currentEstimationInitiator: roomItem.currentEstimationInitiator,
      currentEstimates: roomItem.currentEstimates
        ? roomItem.currentEstimates.values.map(JSON.parse)
        : [],
      cardDeck: roomItem.cardDeck,
    };
  }
}
