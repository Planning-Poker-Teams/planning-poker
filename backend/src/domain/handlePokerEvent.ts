import { CommandType, Command } from "./commandTypes";
import { PokerRoom, Participant } from "./types";

const {
  BROADCAST_MESSAGE,
  SEND_MESSAGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SET_TASK,
  RECORD_ESTIMATION,
  FINISH_ROUND
} = CommandType;

export const handlePokerEvent = (
  room: PokerRoom,
  inputEvent: PokerEvent,
  participant: Participant
): Command[] => {
  switch (inputEvent.eventType) {
    case "userJoined":
      const userJoinedEvents: UserJoined[] = room.participants.map(
        participant => ({
          eventType: "userJoined",
          userName: participant.name,
          isSpectator: participant.isSpectator
        })
      );

      const messagesToSend: Command[] = [
        {
          type: BROADCAST_MESSAGE,
          payload: inputEvent
        },
        {
          type: ADD_PARTICIPANT,
          roomName: room.name,
          participant
        },
        {
          type: SEND_MESSAGE,
          recipient: participant,
          payload: userJoinedEvents
        }
      ];

      if (room.currentEstimation) {
        const startEstimationEvent: RequestStartEstimation = {
          eventType: "startEstimation",
          userName: room.currentEstimation.initiator.name,
          startDate: room.currentEstimation.startDate,
          taskName: room.currentEstimation.taskName
        };

        const userHasEstimatedEvents: UserHasEstimated[] = room.participants
          .filter(p => p.currentEstimation !== undefined)
          .sort(sortByName)
          .map(p => ({
            eventType: "userHasEstimated",
            userName: p.name,
            taskName: room.currentEstimation!.taskName
          }));

        return [
          ...messagesToSend,
          {
            type: SEND_MESSAGE,
            recipient: participant,
            payload: [startEstimationEvent]
          },
          {
            type: SEND_MESSAGE,
            recipient: participant,
            payload: userHasEstimatedEvents
          }
        ];
      } else {
        return messagesToSend;
      }

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

    case "startEstimation":
      const isEstimationOngoing =
        room.currentEstimation?.taskName !== undefined &&
        !room.participants.every(p => p.currentEstimation);

      if (isEstimationOngoing) {
        return [];
      } else {
        return [
          { type: BROADCAST_MESSAGE, payload: inputEvent },
          {
            type: SET_TASK,
            startDate: inputEvent.startDate,
            taskName: inputEvent.taskName
          }
        ];
      }

    case "estimate":
      if (inputEvent.taskName !== room.currentEstimation?.taskName) {
        return [];
      }
      const userHasEstimated: UserHasEstimated = {
        eventType: "userHasEstimated",
        userName: inputEvent.userName,
        taskName: inputEvent.taskName
      };
      return [
        {
          type: RECORD_ESTIMATION,
          roomName: room.name,
          taskName: inputEvent.taskName,
          estimate: inputEvent.estimate
        },
        {
          type: BROADCAST_MESSAGE,
          payload: userHasEstimated
        }
      ];

    case "showResult":
      const estimationCompleted = room.participants.every(
        p => p.currentEstimation
      );
      if (!estimationCompleted) {
        return [];
      }
      const payload: EstimationResult = {
        eventType: "estimationResult",
        taskName: room.currentEstimation!.taskName,
        startDate: room.currentEstimation!.startDate,
        endDate: new Date().toISOString(),
        estimates: room.participants.map(participant => ({
          userName: participant.name,
          estimate: participant.currentEstimation!
        }))
      };
      return [
        {
          type: BROADCAST_MESSAGE,
          payload
        },
        { type: FINISH_ROUND, roomName: room.name }
      ];

    default:
      return [];
  }
};

export const sortByName = (first: Participant, other: Participant): number => {
  if (first.name < other.name) return -1;
  if (first.name > other.name) return 1;
  return 0;
};
