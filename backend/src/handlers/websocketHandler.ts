import { ParticipantRepository } from "../poker/ParticipantRepository";
import { ApiGatewayManagementClient } from "../lib/ApiGatewayManagementClient";
import { buildLogger, Severity } from "../lib/buildLogger";
import { convertToPokerEvent } from "../poker/convertToPokerEvent";
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

  // Verify that all request parameters have been set:
  if (event.requestContext.eventType == "CONNECT") {
    const { room, name, isSpectator } = event.queryStringParameters ?? {};
    if (!room || !name) {
      return {
        ...baseResponse,
        statusCode: 400,
        body: "Missing mandatory query parameters: room, name."
      };
    }
  }

  const pokerRoom = new PokerRoom(roomRepository, gatewayClient, log);
  const pokerEvent = await convertToPokerEvent(
    event,
    participantRepository,
    log
  );
  if (!pokerEvent) {
    log(Severity.ERROR, "Event could not be handled", { event });
    return {
      ...baseResponse,
      statusCode: 500,
      body: "Event could not be handled"
    };
  }

  await pokerRoom.processEvent(pokerEvent);

  return baseResponse;
};
