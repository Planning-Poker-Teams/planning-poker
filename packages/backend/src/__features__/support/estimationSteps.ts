import { Given, When, Then } from 'cucumber';
import { CommandType, BroadcastMessage } from '../../domain/commandTypes';
import { handlePokerEvent } from '../../domain/handlePokerEvent';
import { buildParticipant, ROOM_NAME } from './world';

const sortByName = (first: string, other: string): number => {
  if (first < other) return -1;
  if (first > other) return 1;
  return 0;
};

const estimations = new Map<string, string>();
const participants = [
  buildParticipant('Jimmy'),
  buildParticipant('John'),
  buildParticipant('Fred'),
];

Given('there is a room with no ongoing estimation', function () {
  estimations.clear();
  this.room = {
    name: ROOM_NAME,
    participants,
    currentEstimation: undefined,
    cardDeck: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '???'],
  };
});

Given('there is a room with an ongoing estimation for {string}', function (taskName: string) {
  estimations.clear();
  this.room = {
    name: ROOM_NAME,
    participants,
    currentEstimation: {
      taskName,
      startDate: new Date().toISOString(),
      initiator: participants[0],
    },
    cardDeck: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '???'],
  };
});

Given('a participant named {string} has joined the room as spectator', function (userName: string) {
  this.room!.participants = [...this.room!.participants, buildParticipant(userName, true)];
});

Given('{string} estimated {string}', function (userName: string, estimation: string) {
  estimations.set(userName, estimation);

  this.room!.participants = this.room!.participants.map(participant => {
    if (participant.name == userName) {
      return {
        ...participant,
        currentEstimation: estimation,
      };
    } else {
      return participant;
    }
  });
});

When('a participant initiates a new estimation for {string}', function (taskName: string) {
  this.initiatingParticipant = this.room!.participants[0];
  this.estimationStartDate = new Date().toISOString();

  this.inputEvent = {
    eventType: 'startEstimation',
    userName: this.initiatingParticipant.name,
    taskName,
    startDate: this.estimationStartDate,
  };

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    this.initiatingParticipant.id,
    this.initiatingParticipant
  );
});

When(
  '{string} estimates {string} for {string}',
  function (userName: string, estimate: string, taskName: string) {
    const participant = this.room!.participants.find(p => p.name === userName)!;
    estimations.set(participant.name, estimate);

    this.inputEvent = {
      eventType: 'estimate',
      userName: participant.name,
      taskName,
      estimate,
    };

    this.outgoingCommands = handlePokerEvent(
      this.room!,
      this.inputEvent,
      participant.id,
      participant
    );
  }
);

When('showing the result is requested', function () {
  const participant = this.room!.participants[0];

  this.inputEvent = {
    eventType: 'showResult',
    userName: participant.name,
  };

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    participant.id,
    participant
  );
});

Then('the current task name should be set to {string}', function (taskName: string) {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.SET_TASK,
    taskName,
    startDate: this.estimationStartDate,
    participantId: this.initiatingParticipant!.id,
  });
});

Then('all participants should be informed to start estimating', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.BROADCAST_MESSAGE,
    payload: this.inputEvent,
  });
});

Then(
  'the other participants get informed that {string} has estimated',
  function (userName: string) {
    const payload = {
      eventType: 'userHasEstimated',
      userName,
      taskName: this.room?.currentEstimation?.taskName,
    };

    expect(this.outgoingCommands).toContainEqual({
      type: CommandType.BROADCAST_MESSAGE,
      payload,
    });
  }
);

Then(
  'the other participants do not get informed that {string} has estimated',
  function (userName: string) {
    const broadcastEvent = this.outgoingCommands?.find(
      e =>
        e.type == CommandType.BROADCAST_MESSAGE &&
        e.payload.eventType == 'userHasEstimated' &&
        e.payload.userName == userName
    );

    expect(broadcastEvent).toBeUndefined();
  }
);

Then('the estimation of {string} gets recorded', function (userName: string) {
  const participant = participants.find(p => p.name === userName);

  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.RECORD_ESTIMATION,
    roomName: this.room?.name,
    taskName: this.room?.currentEstimation?.taskName,
    participantId: participant!.id,
    estimate: estimations.get(userName),
  });
});

Then('he should receive information about the task', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.SEND_MESSAGE,
    recipient: this.newParticipant,
    payload: [
      {
        eventType: 'startEstimation',
        userName: this.room?.currentEstimation?.initiator?.name,
        startDate: this.room?.currentEstimation?.startDate,
        taskName: this.room?.currentEstimation?.taskName,
      },
    ],
  });
});

Then('he should receive information about who has already estimated', function () {
  const currentEstimationEvents = Array.from(estimations.keys())
    .sort(sortByName)
    .map(userName => ({
      eventType: 'userHasEstimated',
      userName,
      taskName: this.room?.currentEstimation?.taskName,
    }));

  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.SEND_MESSAGE,
    recipient: this.newParticipant,
    payload: currentEstimationEvents,
  });
});

Then('all participants get informed about the estimation result', function () {
  const broadcastCommand = this.outgoingCommands!.find(
    command =>
      command.type === CommandType.BROADCAST_MESSAGE &&
      command.payload.eventType === 'estimationResult'
  ) as BroadcastMessage;

  if (!broadcastCommand) {
    throw new Error('No matching command was broadcasted');
  }

  const payload = broadcastCommand.payload as EstimationResult;

  expect(payload).toMatchObject({
    taskName: this.room?.currentEstimation?.taskName,
  });

  const allKeys = Array.from(estimations.keys());

  expect(payload.estimates).toHaveLength(allKeys.length);

  allKeys.forEach(name => {
    expect(payload.estimates).toContainEqual({
      userName: name,
      estimate: estimations.get(name),
    });
  });
});

Then('no action should be performed', function () {
  expect(this.outgoingCommands).toEqual([]);
});

Then('the estimation round is ended', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.FINISH_ROUND,
    roomName: this.room!.name,
  });
});
