import { DynamoDBStreamEvent } from "aws-lambda";
import { Participant } from "../domain/types";
import { PokerEventInteractor } from "../interactors/PokerEventInteractor";
import { ParticipantRepository } from "../repositories/ParticipantRepository";
import { RoomRepository } from "../repositories/RoomRepository";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";

const participantRepository = new ParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);

const roomRepository = new RoomRepository(process.env.ROOMS_TABLENAME!);

const gatewayClient = new ApiGatewayManagementClient(
  process.env.API_GW_DOMAINNAME!
);

const pokerEventInteractor = new PokerEventInteractor(
  participantRepository,
  roomRepository,
  gatewayClient
);

export const handler = async (event: DynamoDBStreamEvent): Promise<any> => {
  await Promise.all(
    event.Records.map(async record => {
      switch (record.eventName) {
        case "INSERT":
          const newImage = record.dynamodb!.NewImage!;
          const newParticipant: Participant = {
            id: newImage.connectionId.S!,
            name: newImage.name.S!,
            isSpectator: newImage.isSpectator.BOOL!
          };
          const userJoinedEvent: UserJoined = {
            eventType: "userJoined",
            userName: newParticipant.name,
            isSpectator: newParticipant.isSpectator
          };
          await pokerEventInteractor.handleIncomingEvent(
            userJoinedEvent,
            newParticipant.id
          );
          break;

        case "REMOVE":
          const oldImage = record.dynamodb!.OldImage!;
          const oldParticipant: Participant = {
            id: oldImage.connectionId.S!,
            name: oldImage.name.S!,
            isSpectator: oldImage.isSpectator.BOOL!
          };
          const roomName = oldImage.roomName.S!;
          await pokerEventInteractor.handleUserLeft(oldParticipant, roomName);
          break;

        default:
          return Promise.resolve();
      }
    })
  );

  return {
    isBase64Encoded: false,
    headers: {},
    statusCode: 200,
    body: ""
  };
};
