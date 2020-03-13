import { PokerRoom, Participant, InternalEvent, InternalEventType } from "./domainTypes";

const { BROADCAST_MESSAGE, SEND_MESSAGE, ADD_PARTICIPANT } = InternalEventType

export const handlePokerEvent = (
  room: PokerRoom,
  inputEvent: PokerEvent,
  participant: Participant
): InternalEvent[] => {
  switch(inputEvent.eventType) {
    case "userJoined":
      return [
        {
          type: BROADCAST_MESSAGE,
          payload: inputEvent
        },
        {
          type: SEND_MESSAGE,
          recipient: participant,
          payload: [inputEvent]
        },
        {
          type: ADD_PARTICIPANT,
          roomName: room.name,
          participant
        }
      ]
    default:
      return []
  }
};
