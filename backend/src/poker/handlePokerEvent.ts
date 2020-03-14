import {
  PokerRoom,
  Participant,
  CommandType,
  InternalCommand
} from "./domainTypes";

const {
  BROADCAST_MESSAGE,
  SEND_MESSAGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT
} = CommandType;

export const handlePokerEvent = (
  room: PokerRoom,
  inputEvent: PokerEvent,
  participant: Participant
): InternalCommand[] => {
  switch (inputEvent.eventType) {
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
      ];

    case "userLeft":
      return [
        {
          type: REMOVE_PARTICIPANT,
          roomName: room.name,
          participant
        },
        {
          type: BROADCAST_MESSAGE,
          payload: inputEvent
        }
      ];
    default:
      return [];
  }
};
