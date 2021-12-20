import PokerEventInteractor from './PokerEventInteractor';

xdescribe('PokerEventInteractor', () => {
  const participantRepositoryMock = {
    fetchParticipantInfo: jest.fn().mockReturnValue(undefined),
    fetchParticipants: jest.fn(),
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

  it('handles joining users', async () => {
    const connectionId = 'id-1';
    const event: JoinRoom = {
      eventType: 'joinRoom',
      userName: 'Foo',
      roomName: 'Test',
      isSpectator: false,
    };

    await interactor.handleIncomingEvent(event, connectionId);
  });
});
