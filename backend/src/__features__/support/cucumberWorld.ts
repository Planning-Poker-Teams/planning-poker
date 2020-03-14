import {
  Command,
  Participant,
  PokerRoom
} from "../../poker/domainTypes";

declare module "cucumber" {
  interface World {
    room?: PokerRoom;
    inputEvent?: PokerEvent;
    outgoingCommands?: Command[];
    newParticipant?: Participant;
    leavingParticipant?: Participant;
  }
}

export const buildParticipant = (name: string) => ({
  id: "some-id",
  name,
  isSpectator: false
});

export const ROOM_NAME = "Awesome room";
