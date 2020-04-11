import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { buildLogger } from "../lib/buildLogger";
import {
  APIGatewayWebsocketInvocationRequest,
  LambdaResponse,
} from "./lambdaTypes";
import ParticipantRepository from "../repositories/ParticipantRepository";
import RoomRepository from "../repositories/RoomRepository";
import { PokerEventInteractor } from "../interactors/PokerEventInteractor";

const participantRepository = new ParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);

const pokerEventInteractor = new PokerEventInteractor(
  participantRepository,
  new RoomRepository(process.env.ROOMS_TABLENAME!),
  new ApiGatewayManagementClient(process.env.API_GW_DOMAINNAME!)
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
      const payload = JSON.parse(event.body);
      console.log("Handling message", payload);
      await pokerEventInteractor.handleIncomingEvent(payload, connectionId);
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
