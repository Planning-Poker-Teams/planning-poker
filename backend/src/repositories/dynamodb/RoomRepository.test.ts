import { DynamoDbClient } from './DynamoDbClient';
import RoomRepository from './RoomRepository';

const dynamoClientOptions = {
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: 'localhost',
  accessKeyId: 'foo',
  secretAccessKey: 'bar',
};

describe('RoomRepository', () => {
  const client = new DynamoDbClient(dynamoClientOptions);
  const repository = new RoomRepository('rooms', client);

  const ROOM_ID = 'test-room';
  const CONNECTION_ID = 'connection-id';
  const CONNECTION_ID_2 = 'connection-id-2';

  afterEach(async () => {
    await repository.deleteRoom(ROOM_ID);
  });

  it('creates a room with initial values if it does not exist', async () => {
    const room = await repository.getOrCreateRoom(ROOM_ID);

    expect(room.name).toEqual(ROOM_ID);
    expect(room.participants).toEqual([]);
    expect(room.currentEstimationInitiator).toBeUndefined();
    expect(room.currentEstimationStartDate).toBeUndefined();
    expect(room.currentEstimationTaskName).toBeUndefined();
    expect(room.currentEstimates).toEqual([]);
  });

  it('adds participants', async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([CONNECTION_ID]);
  });

  it('only adds the same participant once', async () => {
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([CONNECTION_ID]);
    expect(room.participants.length).toBe(1);
  });

  it('removes participants', async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    await repository.removeFromParticipants(ROOM_ID, CONNECTION_ID);
    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([]);
  });

  it('starts a new estimation', async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    await repository.startNewEstimation(
      ROOM_ID,
      'A new task',
      CONNECTION_ID,
      '2020-03-27T14:31:52.638Z'
    );

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.currentEstimationTaskName).toEqual('A new task');
    expect(room.currentEstimationInitiator).toEqual(CONNECTION_ID);
    expect(room.currentEstimationStartDate).toEqual('2020-03-27T14:31:52.638Z');
    expect(room.currentEstimates).toEqual([]);
  });

  it('can handle estimations', async () => {
    const TASK_NAME = 'A new task';
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID_2);
    await repository.startNewEstimation(
      ROOM_ID,
      TASK_NAME,
      CONNECTION_ID,
      '2020-03-27T14:31:52.638Z'
    );

    await repository.addToEstimations(ROOM_ID, CONNECTION_ID, '10');
    await repository.addToEstimations(ROOM_ID, CONNECTION_ID_2, '2');

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.currentEstimates).toEqual([
      {
        connectionId: CONNECTION_ID,
        timestamp: expect.anything(),
        value: '10',
      },
      {
        connectionId: CONNECTION_ID_2,
        timestamp: expect.anything(),
        value: '2',
      },
    ]);
  });

  it('records all estimation history for a user', async () => {
    const TASK_NAME = 'A new task';
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);
    await repository.startNewEstimation(
      ROOM_ID,
      TASK_NAME,
      CONNECTION_ID,
      '2020-03-27T14:31:52.638Z'
    );

    const firstTimestamp = new Date();
    firstTimestamp.setSeconds(20);
    const secondTimestamp = new Date();
    secondTimestamp.setSeconds(40);

    await repository.addToEstimations(ROOM_ID, CONNECTION_ID, '10', firstTimestamp);
    await repository.addToEstimations(ROOM_ID, CONNECTION_ID, '2', secondTimestamp);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.currentEstimates).toEqual([
      {
        connectionId: CONNECTION_ID,
        timestamp: firstTimestamp.toISOString(),
        value: '10',
      },
      {
        connectionId: CONNECTION_ID,
        timestamp: secondTimestamp.toISOString(),
        value: '2',
      },
    ]);
  });

  it('finishes an estimation', async () => {
    const TASK_NAME = 'A new task';
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);
    await repository.startNewEstimation(
      ROOM_ID,
      TASK_NAME,
      CONNECTION_ID,
      '2020-03-27T14:31:52.638Z'
    );
    await repository.addToEstimations(ROOM_ID, CONNECTION_ID, '10');

    await repository.finishEstimation(ROOM_ID);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.currentEstimationTaskName).toEqual(undefined);
    expect(room.currentEstimationInitiator).toEqual(undefined);
    expect(room.currentEstimationStartDate).toEqual(undefined);
    expect(room.currentEstimates).toEqual([]);
  });
});
