import { Repository } from "../poker/Repository";
import { ApiGatewayManagementClient } from "../ApiGatewayManagementClient";
import { buildLogger, Severity } from "../buildLogger";
import { convertToPokerEvent } from "../poker/convertToPokerEvent";
import { PokerRoom } from "../poker/PokerRoom";

/**
 * Each incoming message sent through a websocket connection (MESSAGE).
 * If a user connects or disconnects (CONNECT/DISCONNECT) body will be empty.
 *
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

const repository = new Repository(
  process.env.PARTICIPANTS_TABLENAME!,
  process.env.ROOMS_TABLENAME!
);

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
        isBase64Encoded: false,
        headers: {},
        statusCode: 400,
        body: "Missing mandatory query parameters: room, name"
      };
    }
  }

  try {
    const pokerRoom = new PokerRoom(repository, gatewayClient, log);
    const pokerEvent = convertToPokerEvent(event, log);
    if (pokerEvent) {
      await pokerRoom.processEvent(pokerEvent);
    }
  } catch (error) {
    log(Severity.ERROR, "Unexpected error ", error);
    return {
      isBase64Encoded: false,
      headers: {},
      statusCode: 500,
      body: "Unexpected error while handling event"
    };
  }

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  };
};
