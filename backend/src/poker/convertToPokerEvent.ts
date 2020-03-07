import { APIGatewayWebsocketInvocationRequest } from "../handlers/websocketHandler";
import { Logger, Severity } from "../lib/buildLogger";
import { ParticipantRepository } from "./ParticipantRepository";

export const convertToPokerEvent = async (
  event: APIGatewayWebsocketInvocationRequest,
  participantRepository: ParticipantRepository,
  log: Logger
): Promise<PokerEvent | undefined> => {
  const { connectionId } = event.requestContext;
  const { room, name } = event.queryStringParameters ?? {};
  const isSpectator =
    event.queryStringParameters?.isSpectator.toLowerCase() == "true" ?? false;

  switch (event.requestContext.eventType) {
    case "CONNECT":
      await participantRepository.putParticipant({
        connectionId,
        roomName: room,
        name,
        isSpectator
      });

      return {
        eventType: "userJoined",
        userName: name,
        isSpectator
      };

    case "MESSAGE":
      log(Severity.INFO, `Incoming event`, { requestBody: event.body });
      if (!event.body || !event.body.eventType) {
        log(Severity.ERROR, "Could not handle event", event);
        break;
      }
      // todo: add event validation
      return event.body as PokerEvent;

    case "DISCONNECT":
      const participant = await participantRepository.fetchParticipant(
        connectionId
      );
      await participantRepository.removeParticipant(connectionId);

      return {
        eventType: "userLeft",
        userName: participant!.name
      };
  }

  return undefined;
};
