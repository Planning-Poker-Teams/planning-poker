import { ApiGatewayMessageSender } from "../repositories/apigw/MessageSender";
import { buildLogger } from "../../buildLogger";
import {
  APIGatewayWebsocketInvocationRequest,
  LambdaResponse,
} from "./lambdaTypes";
import DynamoDbRoomRepository from "../repositories/dynamodb/RoomRepository";
import DynamoDbParticipantRepository from "../repositories/dynamodb/ParticipantRepository";
import PokerEventInteractor from "../interactors/PokerEventInteractor";

const pokerEventInteractor = new PokerEventInteractor(
  new DynamoDbParticipantRepository(process.env.PARTICIPANTS_TABLENAME!),
  new DynamoDbRoomRepository(process.env.ROOMS_TABLENAME!),
  new ApiGatewayMessageSender(process.env.API_GW_DOMAINNAME!)
);

export const handler = async (
  event: APIGatewayWebsocketInvocationRequest
): Promise<LambdaResponse> => {
  const { connectionId, requestId, eventType } = event.requestContext;
  const log = buildLogger(connectionId, requestId);

  switch (eventType) {
    case "CONNECT":
      console.log(`New connection established ${connectionId}`);
      break;

    case "MESSAGE":
      try {
        const payload = JSON.parse(event.body);
        console.log("Handling message", payload);
        await pokerEventInteractor.handleIncomingEvent(payload, connectionId);
      } catch (error) {
        console.log("Message could not be processed", error);
      }
      break;

    case "DISCONNECT":
      console.log(`Disconnected ${connectionId}`);
      await pokerEventInteractor.handleUserLeft(connectionId);
      break;
  }

  return {
    isBase64Encoded: false,
    headers: {},
    statusCode: 200,
    body: "",
  };
};
