import { Given, When, Then, setWorldConstructor } from "cucumber";
import {
  PokerRoom,
  InternalEvent,
  InternalEventType
} from "../../poker/domainTypes";
import { handlePokerEvent } from "../../poker/handlePokerEvent";

declare module "cucumber" {
  interface World {
    room?: PokerRoom;
    lastInternalEvents?: InternalEvent[];
  }
}

const userJoinedEvent: UserJoined = {
  eventType: "userJoined",
  userName: "First user",
  isSpectator: false
};

const newParticipant = {
  id: "some-id",
  name: "First user",
  isSpectator: false
};

Given("there is an empty room", function() {
  this.room = {
    name: "Awesome Room",
    participants: [],
    currentTask: undefined
  };
});

When("a participant joins the room", function() {
  this.lastInternalEvents = handlePokerEvent(
    this.room!,
    userJoinedEvent,
    newParticipant
  );
});

Then("he should be recorded as a new participant", function() {
  expect(this.lastInternalEvents).toHaveLength(3);

  expect(this.lastInternalEvents).toContainEqual({
    type: InternalEventType.BROADCAST_MESSAGE,
    payload: userJoinedEvent
  });

  expect(this.lastInternalEvents).toContainEqual({
    type: InternalEventType.SEND_MESSAGE,
    recipient: newParticipant,
    payload: [userJoinedEvent]
  });

  expect(this.lastInternalEvents).toContainEqual({
    type: InternalEventType.ADD_PARTICIPANT,
    roomName: "Awesome Room"
  });
});
