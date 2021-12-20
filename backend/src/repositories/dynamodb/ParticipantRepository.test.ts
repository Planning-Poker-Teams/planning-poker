import { DynamoDbClient } from './DynamoDbClient';
import ParticipantRepository from './ParticipantRepository';

const dynamoClientOptions = {
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: 'localhost',
  accessKeyId: 'foo',
  secretAccessKey: 'bar',
};

describe('ParticipantRepository', () => {
  const client = new DynamoDbClient(dynamoClientOptions);
  const repository = new ParticipantRepository('participants', client);

  const exampleRoomName = 'Test';
  const exampleParticipant = {
    id: 'connection-id1',
    name: 'Gustavo',
    isSpectator: false,
  };

  it('returns all participants', async () => {
    await repository.putParticipant(exampleParticipant, exampleRoomName);
    const participants = await repository.getAllParticipants();
    expect(participants.length).toBeGreaterThanOrEqual(1);
  });

  it('inserts a participant', async () => {
    await repository.putParticipant(exampleParticipant, exampleRoomName);
  });

  it('fetches a participant', async () => {
    const participantInfo = await repository.fetchParticipantInfo('connection-id1');
    expect(participantInfo!.participant).toEqual(exampleParticipant);
    expect(participantInfo!.roomName).toEqual(exampleRoomName);
  });

  it('can deal with a non-existing participant', async () => {
    const participantInfo = await repository.fetchParticipantInfo('unknown-connection-id');
    expect(participantInfo).toBeUndefined();
  });

  it('can handle existing and non-existing entries in a batchGet', async () => {
    const participants = await repository.fetchParticipants(['connection-id1', 'unknown']);

    expect(participants).toEqual([exampleParticipant]);
  });

  it('returns multiple participants in a batchGet', async () => {
    const otherParticipant = {
      ...exampleParticipant,
      id: 'connection-id2',
      name: 'Rodolfo',
    };
    await repository.putParticipant(otherParticipant, exampleRoomName);

    const participants = await repository.fetchParticipants(['connection-id1', 'connection-id2']);

    expect(participants.length).toBe(2);
    expect(participants).toContainEqual(exampleParticipant);
    expect(participants).toContainEqual(otherParticipant);
  });

  it('removes participants', async () => {
    await repository.removeParticipant('connection-id1');
    await repository.removeParticipant('connection-id2');

    const participants = await repository.fetchParticipants(['connection-id1', 'connection-id2']);

    expect(participants.length).toBe(0);
  });
});
