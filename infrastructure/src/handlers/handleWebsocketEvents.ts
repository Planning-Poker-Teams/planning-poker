import { PokerRepository } from "../PokerRepository";
import { WebsocketClient } from '../WebsocketClient';

interface APIGatewayLambdaInvocation {
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

interface ProxiedLambdaResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string; // stringified JSON
}

export const buildLogger = (connectionId: string, requestId: string) => (
  message: string,
  metadata?: object
) => {
  console.log(
    JSON.stringify({
      message,
      metadata,
      connectionId,
      requestId
    })
  );
};

const { PARTICIPANTS_TABLE, ROOMS_TABLE } = process.env;

const pokerRepository = new PokerRepository(
  PARTICIPANTS_TABLE ?? "unknown",
  ROOMS_TABLE ?? "unknown"
);

export const handler = async (
  event: APIGatewayLambdaInvocation
): Promise<ProxiedLambdaResponse> => {
  const { connectionId, requestId, domainName, stage } = event.requestContext;
  const log = buildLogger(connectionId, requestId);
  const websocketClient = new WebsocketClient(`${domainName}/${stage}`);

  // if not MESSAGE: create userJoined/userLeft event
  // convert incoming message to PokerEvent
  // handle event with PokerRoom
  // trigger side-effects (broadcast messages)

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const { room, name, isSpectator } = event.queryStringParameters ?? {};
      if (!room || !name) {
        return {
          isBase64Encoded: false,
          headers: {},
          statusCode: 400,
          body: "Missing mandatory query parameters: room, name"
        };
      }
      log(`User ${name} joined ${room}`);
      break;

    case "MESSAGE":
      log(`Incoming event`, { requestBody: event.body });
      if (event.body) {
        // echo
        const { connectionId, domainName, stage } = event.requestContext;
        await websocketClient.sendMessage(connectionId, event.body);
      }
      break;

    case "DISCONNECT":
      log(`User left`);
      break;
  }

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: ""
  };
};
