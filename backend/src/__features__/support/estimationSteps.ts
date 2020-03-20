import { Given, When, Then } from "cucumber";
import { buildParticipant, ROOM_NAME } from "./cucumberWorld";
import { handlePokerEvent } from "../../domain/handlePokerEvent";
import { CommandType, BroadcastMessage } from "../../domain/commandTypes";

const estimations = new Map<string, string>();
const participants = [
  buildParticipant("Jimmy"),
  buildParticipant("John"),
  buildParticipant("Fred")
];

Given("there is a room with no ongoing estimation", function() {
  estimations.clear();
  this.room = {
    name: ROOM_NAME,
    participants,
    currentTask: undefined
  };
});

Given("there is a room with an ongoing estimation for {string}", function(
  task: string
) {
  estimations.clear();
  this.room = {
    name: ROOM_NAME,
    participants,
    currentTask: task
  };
});

Given("{string} estimated {string}", function(
  userName: string,
  estimation: string
) {
  estimations.set(userName, estimation);

  this.room!.participants = this.room!.participants.map(participant => {
    if (participant.name == userName) {
      return {
        ...participant,
        currentEstimation: estimation
      };
    }
    return participant;
  });
});

When("a participant initiates a new estimation", function() {
  const participant = this.room!.participants[0];
  this.inputEvent = {
    eventType: "startEstimation",
    userName: participant.name,
    taskName: "Implement the things",
    startDate: new Date().toISOString()
  };

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    participant
  );
});

When("{string} estimates {string} for {string}", function(
  userName: string,
  estimate: string,
  taskName: string
) {
  const participant = this.room!.participants.find(p => p.name === userName)!;
  estimations.set(participant.name, estimate);

  this.inputEvent = {
    eventType: "estimate",
    userName: participant.name,
    taskName,
    estimate
  };

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    participant
  );
});

When("showing the result is requested", function() {
  const participant = this.room!.participants[0];

  this.inputEvent = {
    eventType: "showResult",
    userName: participant.name
  };

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    participant
  );
});

Then("all participants should be informed to start estimating", function() {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.BROADCAST_MESSAGE,
    payload: this.inputEvent
  });
});

Then(
  "the other participants get informed that {string} has estimated",
  function(userName: string) {
    const payload = {
      eventType: "userHasEstimated",
      userName,
      taskName: this.room!.currentTask!
    };

    expect(this.outgoingCommands).toContainEqual({
      type: CommandType.BROADCAST_MESSAGE,
      payload
    });
  }
);

Then("the estimation of {string} gets recorded", function(userName: string) {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.RECORD_ESTIMATION,
    roomName: this.room!.name,
    taskName: this.room!.currentTask,
    estimate: estimations.get(userName)
  });
});

Then("all participants get informed about the estimation result", function() {
  const broadcastCommand = this.outgoingCommands!.find(
    command =>
      command.type === CommandType.BROADCAST_MESSAGE &&
      command.payload.eventType === "estimationResult"
  ) as BroadcastMessage;
  const payload = broadcastCommand.payload as EstimationResult;

  expect(payload).toMatchObject({
    taskName: this.room!.currentTask!
  });

  const allKeys = Array.from(estimations.keys());

  expect(payload.estimates).toHaveLength(allKeys.length);

  allKeys.forEach(name => {
    expect(payload.estimates).toContainEqual({
      userName: name,
      estimate: estimations.get(name)
    });
  });
});

Then("no action should be performed", function() {
  expect(this.outgoingCommands).toEqual([]);
});

Then("the estimation round is ended", function() {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.FINISH_ROUND,
    roomName: this.room!.name
  });
});
