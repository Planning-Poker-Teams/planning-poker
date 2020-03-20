import { RoomRepository } from "./RoomRepository";

// ⚠️ DynamoDB integration test (underlying AWS client is not mocked!)
describe("RoomRepository", () => {
  const repository = new RoomRepository("rooms", false);
  const ROOM_ID = "test-room";
  const CONNECTION_ID = "connection-id";

  afterEach(async () => {
    await repository.deleteRoom(ROOM_ID);
  });

  it("creates a room if it does not exist", async () => {
    const room = await repository.getOrCreateRoom(ROOM_ID);

    expect(room.roomName).toEqual(ROOM_ID);
    expect(room.participants).toEqual([]);
    expect(room.estimates).toEqual([]);
    expect(room.currentTaskName).toBeUndefined();
  });

  // it("returns an existing room", async () => {
  // });

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

  // it("can handle estimations", async () => {});
  // it("starts a new estimation", async () => {});
});
