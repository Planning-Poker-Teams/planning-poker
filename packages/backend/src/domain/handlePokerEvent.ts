import uniqueName from '../helpers/uniqueName';
import log from '../log';
import { buildEstimationResult } from './buildEstimationResult';
import { CommandType, Command } from './commandTypes';
import { PokerRoom, Participant } from './types';

const {
  BROADCAST_MESSAGE,
  SEND_MESSAGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SEND_EXISTING_PARTICIPANTS,
  CHANGE_CARD_DECK,
  SET_TASK,
  RECORD_ESTIMATION,
  REVEAL_ROUND,
  BROADCAST_ESTIMATION_RESULT,
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
      const participantNames: string[] = room.participants.map(({ name }) => name);
      const newParticipantName = uniqueName(inputEvent.userName, participantNames);
      const renamed = newParticipantName !== inputEvent.userName;

      const newParticipant: Participant = {
        id: participantId,
        name: newParticipantName,
        isSpectator: inputEvent.isSpectator,
      };

      const userJoinedEvent: UserJoined = {
        eventType: 'userJoined',
        userName: newParticipantName,
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
        {
          type: SEND_MESSAGE,
          recipient: newParticipant,
          payload: [
            {
              eventType: 'changeCardDeck',
              cardDeck: room.cardDeck,
            },
          ],
        },
      ];

      if (renamed) {
        messagesToSend.push({
          type: SEND_MESSAGE,
          recipient: newParticipant,
          payload: [
            {
              eventType: 'userRenamed',
              userName: newParticipantName,
            },
          ],
        });
      }

      if (room.currentEstimation) {
        const startEstimationEvent: StartEstimation = {
          eventType: 'startEstimation',
          userName: room.currentEstimation.initiator?.name,
          startDate: room.currentEstimation.startDate,
          taskName: room.currentEstimation.taskName,
          allowVoteCorrectionAfterReveal:
            room.currentEstimation.allowVoteCorrectionAfterReveal,
        };

        if (room.currentEstimation.status === 'revealed') {
          return [
            ...messagesToSend,
            {
              type: SEND_MESSAGE,
              recipient: newParticipant,
              payload: [buildEstimationResult(room)],
            },
          ];
        }

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

    case 'removeUser': {
      return [
        {
          type: BROADCAST_MESSAGE,
          payload: {
            eventType: 'userLeft',
            userName: participant!.name,
          },
        },
        {
          type: REMOVE_PARTICIPANT,
          roomName: room.name,
          participant: participant!,
        },
      ];
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

    case 'changeCardDeck': {
      const cardsPlayed =
        room.participants.filter(p => p.currentEstimation !== undefined).length > 0;

      if (cardsPlayed) {
        log.info('Ignoring change-card-deck event (cards have been played)', { inputEvent });
        return [];
      } else {
        const changeCardDeck: ChangeCardDeck = {
          eventType: 'changeCardDeck',
          cardDeck: inputEvent.cardDeck,
        };
        return [
          { type: CHANGE_CARD_DECK, newCardDeck: inputEvent.cardDeck },
          { type: BROADCAST_MESSAGE, payload: changeCardDeck },
        ];
      }
    }

    case 'startEstimation': {
      const isEstimationOngoing =
        room.currentEstimation?.status !== 'revealed' &&
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
          allowVoteCorrectionAfterReveal: inputEvent.allowVoteCorrectionAfterReveal,
        };

        return [
          { type: BROADCAST_MESSAGE, payload: startEstimation },
          {
            type: SET_TASK,
            startDate: startEstimation.startDate,
            taskName: startEstimation.taskName,
            participantId: participantId,
            allowVoteCorrectionAfterReveal: startEstimation.allowVoteCorrectionAfterReveal,
          },
        ];
      }
    }

    case 'estimate': {
      if (inputEvent.taskName !== room.currentEstimation?.taskName) {
        log.info('Ignoring input event (taskName mismatch)', { inputEvent });
        return [];
      }
      if (!room.cardDeck.includes(inputEvent.estimate)) {
        log.info('Ignoring input event (estimate not included in card-deck)', { inputEvent });
        return [];
      }

      if (room.currentEstimation?.status === 'revealed') {
        if (!room.currentEstimation.allowVoteCorrectionAfterReveal) {
          log.info('Ignoring input event (post-reveal correction disabled)', { inputEvent });
          return [];
        }
        if (!room.currentEstimation.participantsAllowedToCorrectVote.includes(participantId)) {
          log.info('Ignoring input event (participant may not correct revealed vote)', {
            inputEvent,
            participantId,
          });
          return [];
        }

        return [
          {
            type: RECORD_ESTIMATION,
            roomName: room.name,
            taskName: inputEvent.taskName,
            estimate: inputEvent.estimate,
            participantId,
          },
          {
            type: BROADCAST_ESTIMATION_RESULT,
          },
        ];
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
      const endDate = new Date().toISOString();

      if (room.currentEstimation!.allowVoteCorrectionAfterReveal) {
        const participantIdsAllowedToCorrectVote = room.participants
          .filter(p => !p.isSpectator && p.currentEstimation !== undefined)
          .map(p => p.id);

        return [
          {
            type: REVEAL_ROUND,
            roomName: room.name,
            participantIdsAllowedToCorrectVote,
            endDate,
          },
          {
            type: BROADCAST_ESTIMATION_RESULT,
          },
        ];
      }

      const payload = buildEstimationResult(
        {
          ...room,
          currentEstimation: {
            ...room.currentEstimation!,
            endDate,
            status: 'revealed',
          },
        },
        false
      );
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
