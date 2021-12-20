import log from '../../log';
import { CommandType, Command } from './commandTypes';
import { PokerRoom, Participant } from './types';

const {
  BROADCAST_MESSAGE,
  SEND_MESSAGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SEND_EXISTING_PARTICIPANTS,
  SET_TASK,
  RECORD_ESTIMATION,
  FINISH_ROUND,
} = CommandType;

const sortByName = (first: Participant, other: Participant): number => {
  if (first.name < other.name) return -1;
  if (first.name > other.name) return 1;
  return 0;
};

export const handlePokerEvent = (
  room: PokerRoom,
  inputEvent: PokerEvent,
  participantId: string,
  participant?: Participant
): Command[] => {
  switch (inputEvent.eventType) {
    case 'joinRoom': {
      const newParticipant: Participant = {
        id: participantId,
        name: inputEvent.userName,
        isSpectator: inputEvent.isSpectator,
      };

      const userJoinedEvent: UserJoined = {
        eventType: 'userJoined',
        userName: inputEvent.userName,
        isSpectator: inputEvent.isSpectator,
      };

      const messagesToSend: Command[] = [
        {
          type: BROADCAST_MESSAGE,
          payload: userJoinedEvent,
        },
        {
          type: ADD_PARTICIPANT,
          roomName: inputEvent.roomName,
          participant: newParticipant,
        },
        {
          type: SEND_EXISTING_PARTICIPANTS,
          roomName: inputEvent.roomName,
          recipient: newParticipant,
        },
      ];

      if (room.currentEstimation) {
        const startEstimationEvent: StartEstimation = {
          eventType: 'startEstimation',
          userName: room.currentEstimation.initiator?.name,
          startDate: room.currentEstimation.startDate,
          taskName: room.currentEstimation.taskName,
        };

        const userHasEstimatedEvents: UserHasEstimated[] = room.participants
          .filter(p => p.currentEstimation !== undefined)
          .sort(sortByName)
          .map(p => ({
            eventType: 'userHasEstimated',
            userName: p.name,
            taskName: room.currentEstimation!.taskName,
          }));

        return [
          ...messagesToSend,
          {
            type: SEND_MESSAGE,
            recipient: newParticipant,
            payload: [startEstimationEvent],
          },
          {
            type: SEND_MESSAGE,
            recipient: newParticipant,
            payload: userHasEstimatedEvents,
          },
        ];
      } else {
        return messagesToSend;
      }
    }

    case 'userLeft': {
      return [
        {
          type: REMOVE_PARTICIPANT,
          roomName: room.name,
          participant: participant!,
        },
        {
          type: BROADCAST_MESSAGE,
          payload: inputEvent,
        },
      ];
    }

    case 'startEstimation': {
      const isEstimationOngoing =
        room.currentEstimation?.taskName !== undefined &&
        !room.participants.every(p => p.currentEstimation);

      if (isEstimationOngoing) {
        log.info('Ignoring input event (estimation is ongoing)', {
          inputEvent,
        });
        return [];
      } else {
        const startEstimation: StartEstimation = {
          eventType: 'startEstimation',
          startDate: inputEvent.startDate || new Date().toISOString(),
          taskName: inputEvent.taskName,
          userName: inputEvent.userName,
        };

        return [
          { type: BROADCAST_MESSAGE, payload: startEstimation },
          {
            type: SET_TASK,
            startDate: startEstimation.startDate,
            taskName: startEstimation.taskName,
            participantId: participantId,
          },
        ];
      }
    }

    case 'estimate': {
      if (inputEvent.taskName !== room.currentEstimation?.taskName) {
        log.info('Ignoring input event (taskName mismatch)', { inputEvent });
        return [];
      }
      const recordEstimationCommand: Command = {
        type: RECORD_ESTIMATION,
        roomName: room.name,
        taskName: inputEvent.taskName,
        estimate: inputEvent.estimate,
        participantId: participantId,
      };
      const previousEstimation = room.participants.find(
        p => p.id === participant?.id
      )?.currentEstimation;
      if (!previousEstimation) {
        const userHasEstimated: UserHasEstimated = {
          eventType: 'userHasEstimated',
          userName: inputEvent.userName,
          taskName: inputEvent.taskName,
        };
        return [
          recordEstimationCommand,
          {
            type: BROADCAST_MESSAGE,
            payload: userHasEstimated,
          },
        ];
      } else {
        return [recordEstimationCommand];
      }
    }

    case 'showResult': {
      const estimatingParticipants = room.participants.filter(p => !p.isSpectator);

      const estimationCompleted = estimatingParticipants.every(p => p.currentEstimation);

      if (!estimationCompleted) {
        log.info('Ignoring input event (estimation is not completed!)', {
          inputEvent,
          estimatingParticipants,
        });
        return [];
      }

      const payload: EstimationResult = {
        eventType: 'estimationResult',
        taskName: room.currentEstimation!.taskName,
        startDate: room.currentEstimation!.startDate,
        endDate: new Date().toISOString(),
        estimates: estimatingParticipants.map(participant => ({
          userName: participant.name,
          estimate: participant.currentEstimation!,
        })),
      };
      return [
        {
          type: BROADCAST_MESSAGE,
          payload,
        },
        { type: FINISH_ROUND, roomName: room.name },
      ];
    }

    default:
      log.info('Ignoring input event (unknown event type)', {
        inputEvent,
      });
      return [];
  }
};
