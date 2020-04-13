import PokerEventInteractor from "./PokerEventInteractor";

describe("PokerEventInteractor", () => {
  const participantRepositoryMock = {
    fetchParticipantInfo: jest.fn().mockReturnValue(undefined),
    fetchParticipants: jest.fn()
  };
  const roomRepositoryMock = {
    getOrCreateRoom: jest.fn(),
  };
  const messageSenderMock = jest.fn();

  const interactor = new PokerEventInteractor(
    participantRepositoryMock as any,
    roomRepositoryMock as any,
    messageSenderMock as any
  );

  it("handles joining users", () => {
    const connectionId = "id-1";
    const event: JoinRoom = {
      eventType: "joinRoom",
      userName: "Foo",
      roomName: "Test",
      isSpectator: false,
    };

    interactor.handleIncomingEvent(event, connectionId);
  });
});
