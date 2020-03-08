import { ParticipantRepository } from "../poker/ParticipantRepository";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { buildLogger, Severity } from "../lib/buildLogger";
import { PokerRoom } from "../poker/PokerRoom";
import { RoomRepository } from "../poker/RoomRepository";

/**
 * Each incoming message sent through a websocket connection (MESSAGE).
 * If a user connects or disconnects (CONNECT/DISCONNECT) body will be empty.
 * `connectionId` is used to send message back to the connected user
 */
export interface APIGatewayWebsocketInvocationRequest {
  requestContext: {
    connectionId: string;
    eventType: "CONNECT" | "MESSAGE" | "DISCONNECT";
    connectedAt: number;
    requestTimeEpoch: number;
    requestId: string;
    apiId: string;
    domainName: string;
    stage: string;
  };
  queryStringParameters?: {
    [key: string]: string;
  };
  multiValueQueryStringParameters?: any;
  body?: any;
  isBase64Encoded: boolean;
}

/**
 * Expected Lambda response for API Gateway.
 */
interface LambdaResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string; // stringified JSON
}

const baseResponse = {
  isBase64Encoded: false,
  headers: {},
  statusCode: 200,
  body: ""
};

const participantRepository = new ParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);
const roomRepository = new RoomRepository(process.env.ROOMS_TABLENAME!);

export const handler = async (
  event: APIGatewayWebsocketInvocationRequest
): Promise<LambdaResponse> => {
  const { connectionId, requestId, domainName, stage } = event.requestContext;
  const log = buildLogger(connectionId, requestId);
  const gatewayClient = new ApiGatewayManagementClient(
    `${domainName}/${stage}`
  );

  const pokerRoom = new PokerRoom(
    roomRepository,
    participantRepository,
    gatewayClient,
    log
  );

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const { room, name } = event.queryStringParameters ?? {};
      const isSpectator =
        event.queryStringParameters?.isSpectator.toLowerCase() == "true" ??
        false;
      if (!room || !name) {
        return {
          ...baseResponse,
          statusCode: 400,
          body: "Missing mandatory query parameters: room, name."
        };
      }
      const newParticipant = {
        connectionId,
        roomName: room,
        name,
        isSpectator
      };
      await pokerRoom.joinRoom(newParticipant);
      break;

    case "DISCONNECT":
      const leavingParticipant = await participantRepository.fetchParticipant(
        connectionId
      );
      await pokerRoom.leaveRoom(leavingParticipant!);
      break;

    case "MESSAGE":
      const participant = await participantRepository.fetchParticipant(
        connectionId
      );

      if (!participant) {
        log(Severity.ERROR, "Unknown participant", { event });
        return {
          ...baseResponse,
          statusCode: 500,
          body: "Unknown participant"
        };
      }

      console.log("Handling incoming event with participant", {
        participant,
        event
      });
      const pokerEvent = event.body as PokerEvent;
      await pokerRoom.handleEvent(pokerEvent, participant); // validate payload
      break;
  }

  return baseResponse;
};
