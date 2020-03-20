import { Command } from "../../domain/commandTypes";
import { PokerRoom, Participant } from "../../domain/types";

declare module "cucumber" {
  interface World {
    room?: PokerRoom;
    inputEvent?: PokerEvent;
    outgoingCommands?: Command[];
    newParticipant?: Participant;
    leavingParticipant?: Participant;
    estimationStartDate?: string;
  }
}

export const buildParticipant = (name: string) => ({
  id: "some-id",
  name,
  isSpectator: false
});

export const ROOM_NAME = "Awesome room";