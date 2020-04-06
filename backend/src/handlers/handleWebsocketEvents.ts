import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { buildLogger } from "../lib/buildLogger";
import {
  APIGatewayWebsocketInvocationRequest,
  LambdaResponse
} from "./lambdaTypes";
import { ParticipantRepository } from "../repositories/ParticipantRepository";
import { RoomRepository } from "../repositories/RoomRepository";
import { PokerEventInteractor } from "../interactors/PokerEventInteractor";
import { ConnectionEventInteractor } from "../interactors/ConnectionEventInteractor";

const participantRepository = new ParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);

const roomRepository = new RoomRepository(process.env.ROOMS_TABLENAME!);

const connectionEventInteractor = new ConnectionEventInteractor(
  participantRepository
);

const gatewayClient = new ApiGatewayManagementClient(
  process.env.API_GW_DOMAINNAME!
);

const pokerEventInteractor = new PokerEventInteractor(
  participantRepository,
  roomRepository,
  gatewayClient
);

export const handler = async (
  event: APIGatewayWebsocketInvocationRequest
): Promise<LambdaResponse> => {
  const { connectionId, requestId } = event.requestContext;
  const log = buildLogger(connectionId, requestId);

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const parameters = extractQueryParameters(event.queryStringParameters);
      if (!parameters) {
        return {
          isBase64Encoded: false,
          headers: {},
          statusCode: 400,
          body: "Missing mandatory query parameters: room, name."
        };
      }
      const { room, name, isSpectator } = parameters;
      const participant = {
        id: connectionId,
        name,
        isSpectator
      };
      await connectionEventInteractor.registerParticipant(participant, room);
      break;

    case "DISCONNECT":
      await connectionEventInteractor.unregisterParticipant(connectionId);
      break;

    case "MESSAGE":
      await pokerEventInteractor.handleIncomingEvent(event.body, connectionId);
      break;
  }

  return {
    isBase64Encoded: false,
    headers: {},
    statusCode: 200,
    body: ""
  };
};

const extractQueryParameters = (
  params: any
): { room: string; name: string; isSpectator: boolean } | undefined => {
  const { room, name } = params ?? {};
  const isSpectator = params.isSpectator?.toLowerCase() == "true" ?? false;
  if (!room || !name) {
    return undefined;
  }
  return { room, name, isSpectator };
};
