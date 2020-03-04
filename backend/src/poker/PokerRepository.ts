import AWSXRay from "aws-xray-sdk-core";
import DynamoDB = require("aws-sdk/clients/dynamodb");
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
  private client: DocumentClient;

  constructor(
    private participantsTableName: string,
    private roomsTableName: string
  ) {
    // Workaround for https://github.com/aws/aws-xray-sdk-node/issues/23
    this.client = new DynamoDB.DocumentClient({
      service: new DynamoDB({ apiVersion: "2012-10-08" })
    });
    AWSXRay.captureAWSClient((this.client as any).service);
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
