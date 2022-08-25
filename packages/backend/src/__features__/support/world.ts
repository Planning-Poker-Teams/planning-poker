import { Command } from '../../domain/commandTypes';
import { PokerRoom, Participant } from '../../domain/types';

declare module 'cucumber' {
  interface World {
    room?: PokerRoom;
    inputEvent?: PokerEvent;
    outgoingCommands?: Command[];
    newParticipant?: Participant;
    initiatingParticipant?: Participant;
    leavingParticipant?: Participant;
    estimationStartDate?: string;
  }
}

export const buildParticipant = (name: string, isSpectator = false): Participant => ({
  id: name,
  name,
  isSpectator,
});

export const ROOM_NAME = 'Awesome room';
