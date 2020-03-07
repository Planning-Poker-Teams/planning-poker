import { APIGatewayWebsocketInvocationRequest } from "../handlers/handleWebsocketEvents";
import { Repository } from "./Repository";
import { Logger } from "../buildLogger";
import { ApiGatewayManagementClient } from "../ApiGatewayManagementClient";

export const convertToPokerEvent = (
  event: APIGatewayWebsocketInvocationRequest,
  log: Logger
): PokerEvent | undefined => {
  // if not MESSAGE: create userJoined/userLeft event
  // convert incoming message to PokerEvent
  // handle event with PokerRoom
  // trigger side-effects (broadcast messages)

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const { room, name, isSpectator } = event.queryStringParameters ?? {};
      log(`User ${name} joined ${room}`);
      // we need to pass on the room name!

      const pokerEvent = { 
        eventType: "userJoined",
        userName: name,
        isSpectator: isSpectator
      };
      break;

    case "MESSAGE":
      log(`Incoming event`, { requestBody: event.body });
      // if (event.body) {
      //   // echo
      //   const { connectionId, domainName, stage } = event.requestContext;
      //   await gatewayClient.post(connectionId, event.body);
      // }
      break;

    case "DISCONNECT":
      log(`User left`);
      break;
  }

  const sampleEvent: UserJoined = {
    eventType: "userJoined",
    userName: "Foo",
    isSpectator: false
  };

  return sampleEvent;
};
