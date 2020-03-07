import { APIGatewayWebsocketInvocationRequest } from "../handlers/handleWebsocketEvents";
import { Logger, Severity } from "../buildLogger";

export const convertToPokerEvent = (
  event: APIGatewayWebsocketInvocationRequest,
  log: Logger
): PokerEvent | ConnectionRelatedEvent | undefined => {
  const { connectionId } = event.requestContext;
  const { room, name, isSpectator } = event.queryStringParameters ?? {};

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const userJoinedEvent = {
        eventType: "userJoined",
        userName: name,
        isSpectator: isSpectator
      };
      return {
        ...userJoinedEvent,
        connectionId,
        roomName: room
      } as ConnectionRelatedEvent;

    case "MESSAGE":
      log(Severity.INFO, `Incoming event`, { requestBody: event.body });
      if (!event.body || !event.body.eventType) {
        log(Severity.ERROR, "Could not handle event", event);
        break;
      }
      // todo: add event validation
      return event.body as PokerEvent;

    case "DISCONNECT":
      // name is not known on a disconnection (fetch from repo)
      const userLeftEvent = {
        eventType: "userLeft",
        userName: name
      };
      return {
        ...userLeftEvent,
        connectionId
      } as ConnectionRelatedEvent;
  }

  return undefined;
};
