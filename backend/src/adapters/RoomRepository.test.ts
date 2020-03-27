import { RoomRepository } from "./RoomRepository";

// ⚠️ DynamoDB integration test (underlying AWS client is not mocked!)
describe("RoomRepository", () => {
  const repository = new RoomRepository("rooms", false);
  const ROOM_ID = "test-room";
  const CONNECTION_ID = "connection-id";
  const CONNECTION_ID_2 = "connection-id-2";

  afterEach(async () => {
    await repository.deleteRoom(ROOM_ID);
  });

  it("creates a room with initial values if it does not exist", async () => {
    const room = await repository.getOrCreateRoom(ROOM_ID);

    expect(room.name).toEqual(ROOM_ID);
    expect(room.participants).toEqual([]);
    expect(room.currentEstimationInitiator).toBeUndefined();
    expect(room.currentEstimationStartDate).toBeUndefined();
    expect(room.currentEstimationTaskName).toBeUndefined();
    expect(room.currentEstimates).toEqual([]);
  });

  it("adds participants", async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([CONNECTION_ID]);
  });

  it("only adds the same participant once", async () => {
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([CONNECTION_ID]);
    expect(room.participants.length).toBe(1);
  });

  it("removes participants", async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    await repository.removeFromParticipants(ROOM_ID, CONNECTION_ID);
    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.participants).toEqual([]);
  });

  it("starts a new estimate", async () => {
    await repository.getOrCreateRoom(ROOM_ID);
    await repository.addToParticipants(ROOM_ID, CONNECTION_ID);

    await repository.startNewEstimation(
      ROOM_ID,
      "A new task",
      CONNECTION_ID,
      "2020-03-27T14:31:52.638Z"
    );

    const room = await repository.getOrCreateRoom(ROOM_ID);
    expect(room.currentEstimationTaskName).toEqual("A new task");
    expect(room.currentEstimationInitiator).toEqual(CONNECTION_ID);
    expect(room.currentEstimationStartDate).toEqual("2020-03-27T14:31:52.638Z");
    expect(room.currentEstimates).toEqual([])
  });

  // it("can handle estimations", async () => {});
  // it("starts a new estimation", async () => {});
});
