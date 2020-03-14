import { PokerRoom, Participant, CommandType, Command } from "./domainTypes";

const {
  BROADCAST_MESSAGE,
  SEND_MESSAGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
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

    case "startEstimation":
      const isEstimationOngoing =
        room.currentTask !== undefined &&
        !room.participants.every(p => p.currentEstimation);

      if (isEstimationOngoing) {
        return [];
      } else {
        return [{ type: BROADCAST_MESSAGE, payload: inputEvent }];
      }

    case "estimate":
      if (inputEvent.taskName !== room.currentTask) {
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
        taskName: room.currentTask!,
        startDate: room.startDate?.toISOString() ?? "", //
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
