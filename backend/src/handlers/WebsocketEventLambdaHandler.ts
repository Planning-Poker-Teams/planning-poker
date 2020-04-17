import log from "../../log";
import { ApiGatewayMessageSender } from "../repositories/apigw/MessageSender";
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
  const { connectionId, eventType } = event.requestContext;
  log.options.meta.connectionId = connectionId;

  switch (eventType) {
    case "CONNECT":
      log.info("User connected");
      break;

    case "MESSAGE":
      try {
        const incomingMessage = JSON.parse(event.body);
        await pokerEventInteractor.handleIncomingEvent(
          incomingMessage,
          connectionId
        );
      } catch (error) {
        log.error("Incoming message could not be parsed", {
          incomingMessage: event.body,
        });
      }
      break;

    case "DISCONNECT":
      log.info("User disconnected");
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
