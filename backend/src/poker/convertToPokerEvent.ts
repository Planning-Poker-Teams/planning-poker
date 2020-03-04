import { APIGatewayWebsocketInvocationRequest } from "../handlers/handleWebsocketEvents";
import { PokerRepository } from "./PokerRepository";
import { Logger } from "../buildLogger";
import { ApiGatewayManagementClient } from "../ApiGatewayManagementClient";

export const convertToPokerEvent = async (
  event: APIGatewayWebsocketInvocationRequest,
  gatewayClient: ApiGatewayManagementClient,
  repository: PokerRepository,
  log: Logger
) => {
  // if not MESSAGE: create userJoined/userLeft event
  // convert incoming message to PokerEvent
  // handle event with PokerRoom
  // trigger side-effects (broadcast messages)

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const { room, name, isSpectator } = event.queryStringParameters ?? {};
      log(`User ${name} joined ${room}`);
      break;

    case "MESSAGE":
      log(`Incoming event`, { requestBody: event.body });
      if (event.body) {
        // echo
        const { connectionId, domainName, stage } = event.requestContext;
        await gatewayClient.post(connectionId, event.body);
      }
      break;

    case "DISCONNECT":
      log(`User left`);
      break;
  }
};
