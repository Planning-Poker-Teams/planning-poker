import { Given, When, Then } from 'cucumber';
import { CommandType } from '../../domain/commandTypes';
import { handlePokerEvent } from '../../domain/handlePokerEvent';
import { buildParticipant, ROOM_NAME } from './world';

Given('there is an {word} room', function (roomStatus: 'empty' | 'occupied') {
  const participants =
    roomStatus === 'empty' ? [] : [{ id: 'another-id', name: 'Jimmy', isSpectator: false }];

  this.room = {
    name: ROOM_NAME,
    participants,
  };
});

Given('there is a room with a few participants', function () {
  const participants = [
    buildParticipant('Jimmy'),
    buildParticipant('John'),
    buildParticipant('Fred'),
  ];

  this.room = {
    name: ROOM_NAME,
    participants,
  };
});

When('a participant named {string} joins the room', function (userName: string) {
  this.inputEvent = {
    eventType: 'joinRoom',
    userName,
    roomName: this.room!.name,
    isSpectator: false,
  };
  this.newParticipant = buildParticipant(userName);

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    this.newParticipant.id,
    this.newParticipant
  );
});

When('a participant named {string} leaves the room', function (userName: string) {
  this.inputEvent = {
    eventType: 'userLeft',
    userName,
  };

  const leavingParticipant = this.room?.participants.find(p => p.name === userName);
  if (!leavingParticipant) {
    throw Error('Participant not found in room');
  }

  this.leavingParticipant = leavingParticipant;

  this.outgoingCommands = handlePokerEvent(
    this.room!,
    this.inputEvent,
    leavingParticipant.id,
    leavingParticipant
  );
});

Then('he should be added as a new participant', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.ADD_PARTICIPANT,
    roomName: this.room!.name,
    participant: this.newParticipant,
  });
});

Then('he should be removed from the participants', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.REMOVE_PARTICIPANT,
    roomName: this.room!.name,
    participant: this.leavingParticipant,
  });
});

Then('he should receive information about the existing participants', function () {
  // const payload = this.room?.participants.map((participant) => ({
  //   eventType: "userJoined",
  //   userName: participant.name,
  //   isSpectator: participant.isSpectator,
  // }));
  // expect(this.outgoingCommands).toContainEqual({
  //   type: CommandType.SEND_MESSAGE,
  //   recipient: this.newParticipant,
  //   payload,
  // });

  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.SEND_EXISTING_PARTICIPANTS,
    recipient: this.newParticipant,
    roomName: this.room!.name,
  });
});

Then('the existing participants should be informed about the new participant', function () {
  const userJoinedEvent: UserJoined = {
    eventType: 'userJoined',
    userName: this.newParticipant!.name,
    isSpectator: this.newParticipant!.isSpectator,
  };

  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.BROADCAST_MESSAGE,
    payload: userJoinedEvent,
  });
});

Then('the remaining participants should be informed the leaving participant', function () {
  expect(this.outgoingCommands).toContainEqual({
    type: CommandType.BROADCAST_MESSAGE,
    payload: this.inputEvent,
  });
});
