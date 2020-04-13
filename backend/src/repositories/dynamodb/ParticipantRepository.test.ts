import ParticipantRepository from "./ParticipantRepository";

// ⚠️ DynamoDB integration test (underlying AWS client is not mocked!)
describe("ParticipantRepository", () => {
  const repository = new ParticipantRepository("participants", false);

  const exampleRoomName = "Test";
  const exampleParticipant = {
    id: "connection-id1",
    name: "Gustavo",
    isSpectator: false
  };

  // beforeEach(async () => {
  //     // delete all possible rows
  //     // const client = new DynamoDB.DocumentClient();
  // })

  it("inserts a participant", async () => {
    await repository.putParticipant(exampleParticipant, exampleRoomName);
  });

  it("fetches a participant", async () => {
    const participantInfo = await repository.fetchParticipantInfo("connection-id1");
    expect(participantInfo!.participant).toEqual(exampleParticipant);
    expect(participantInfo!.roomName).toEqual(exampleRoomName);
  });

  it("can deal with a non-existing participant", async () => {
    const participantInfo = await repository.fetchParticipantInfo(
      "unknown-connection-id"
    );
    expect(participantInfo).toBeUndefined();
  });

  it("can handle existing and non-existing entries in a batchGet", async () => {
    const participants = await repository.fetchParticipants([
      "connection-id1",
      "unknown"
    ]);

    expect(participants).toEqual([exampleParticipant]);
  });

  it("returns multiple participants in a batchGet", async () => {
    const otherParticipant = {
      ...exampleParticipant,
      id: "connection-id2",
      name: "Rodolfo"
    };
    await repository.putParticipant(otherParticipant, exampleRoomName);

    const participants = await repository.fetchParticipants([
      "connection-id1",
      "connection-id2"
    ]);

    expect(participants.length).toBe(2);
    expect(participants).toContainEqual(exampleParticipant);
    expect(participants).toContainEqual(otherParticipant);
  });

  it("removes participants", async () => {
    await repository.removeParticipant("connection-id1");
    await repository.removeParticipant("connection-id2");

    const participants = await repository.fetchParticipants([
      "connection-id1",
      "connection-id2"
    ]);

    expect(participants.length).toBe(0);
  });
});
