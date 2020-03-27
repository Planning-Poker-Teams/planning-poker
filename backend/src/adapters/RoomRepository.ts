import { DynamoDbClient } from "../lib/DynamoDbClient";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import DynamoDB = require("aws-sdk/clients/dynamodb");

export interface Room {
  name: string;
  participants: string[];
  currentEstimationTaskName?: string;
  currentEstimationStartDate?: string;
  currentEstimationInitiator?: string;
  currentEstimates: { connectionId: string; value: string }[];
}

export class RoomRepository {
  private client: DynamoDbClient;

  constructor(private roomsTableName: string, enableXRay: boolean = true) {
    this.client = new DynamoDbClient(enableXRay);
  }

  async getOrCreateRoom(name: string): Promise<Room> {
    const room = await this.client.get(this.roomsTableName, { name }, true);

    if (!room.Item) {
      await this.client.put(this.roomsTableName, {
        name
      });
      const newRoom = await this.client.get(
        this.roomsTableName,
        { name },
        true
      );
      return this.prepareRoom(newRoom.Item);
    }

    return this.prepareRoom(room.Item);
  }

  async deleteRoom(name: string): Promise<void> {
    await this.client.delete({
      tableName: this.roomsTableName,
      partitionKey: { name }
    });
  }

  async addToParticipants(name: string, connectionId: string): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: "ADD participants :newParticipant",
      expressionAttributeValues: {
        ":newParticipant": this.client.createSetExpression([connectionId])
      }
    });
  }

  async removeFromParticipants(
    name: string,
    connectionId: string
  ): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: "DELETE participants :participant",
      expressionAttributeValues: {
        ":participant": this.client.createSetExpression([connectionId])
      }
    });
  }

  async startNewEstimation(
    name: string,
    taskName: string,
    initiator: string,
    startDate: string
  ): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: `
        SET 
          currentEstimationTaskName = :taskName, 
          currentEstimationInitiator = :initiator, 
          currentEstimationStartDate = :startDate 
        REMOVE currentEstimates`,
      expressionAttributeValues: {
        ":taskName": taskName,
        ":initiator": initiator,
        ":startDate": startDate
      }
    });
  }

  async addToEstimations(
    name: string,
    connectionId: string,
    value: string
  ): Promise<void> {
    await this.client.update({
      tableName: this.roomsTableName,
      partitionKey: { name },
      updateExpression: "ADD currentEstimates :newEstimate",
      expressionAttributeValues: {
        ":newEstimate": this.client.createSetExpression([
          JSON.stringify({
            connectionId,
            value
          })
        ])
      }
    });
  }

  async finishEstimation(name: string) {
    throw new Error("Method not implemented.");
  }

  private prepareRoom(roomItem: any): Room {
    return {
      name: roomItem.name,
      participants: roomItem.participants?.values ?? [],
      currentEstimationTaskName: roomItem.currentEstimationTaskName,
      currentEstimationStartDate: roomItem.currentEstimationStartDate,
      currentEstimationInitiator: roomItem.currentEstimationInitiator,
      currentEstimates: roomItem.currentEstimates
        ? roomItem.currentEstimates.values.map(JSON.parse)
        : []
    };
  }
}
