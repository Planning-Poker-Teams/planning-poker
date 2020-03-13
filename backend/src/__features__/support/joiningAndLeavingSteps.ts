import { Given, When, Then } from "cucumber";
import {
  PokerRoom,
  InternalEvent,
  InternalEventType,
  Participant
} from "../../poker/domainTypes";
import { handlePokerEvent } from "../../poker/handlePokerEvent";

declare module "cucumber" {
  interface World {
    room?: PokerRoom;
    inputEvent?: PokerEvent;
    outputEvents?: InternalEvent[];
    newParticipant?: Participant;
  }
}

Given("there is an {word} room named {string}", function(
  roomStatus: "empty" | "occupied",
  name: string
) {
  const participants =
    roomStatus === "empty"
      ? []
      : [{ id: "another-id", name: "Jimmy", isSpectator: false }];

  this.room = {
    name,
    participants
  };
});

When("a participant named {string} joins the room", function(userName: string) {
  this.inputEvent = {
    eventType: "userJoined",
    userName,
    isSpectator: false
  };

  this.newParticipant = {
    id: "some-id",
    name: userName,
    isSpectator: false
  };

  this.outputEvents = handlePokerEvent(
    this.room!,
    this.inputEvent,
    this.newParticipant
  );
});

Then("he should be added as a new participant", function() {
  expect(this.outputEvents).toContainEqual({
    type: InternalEventType.ADD_PARTICIPANT,
    roomName: this.room!.name,
    participant: this.newParticipant
  });
});

Then(
  "he should receive information about the existing participants",
  function() {
    expect(this.outputEvents).toContainEqual({
      type: InternalEventType.BROADCAST_MESSAGE,
      payload: this.inputEvent
    });
  }
);

Then(
  "the existing participants should be informed about the new participant",
  function() {
    expect(this.outputEvents).toContainEqual({
      type: InternalEventType.SEND_MESSAGE,
      recipient: this.newParticipant,
      payload: [this.inputEvent]
    });
  }
);
