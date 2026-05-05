import { vi } from 'vitest';
import PokerEventInteractor from './PokerEventInteractor';

describe.skip('PokerEventInteractor', () => {
  const participantRepositoryMock = {
    fetchParticipantInfo: vi.fn().mockReturnValue(undefined),
    fetchParticipants: vi.fn(),
  };
  const roomRepositoryMock = {
    getOrCreateRoom: vi.fn(),
  };
  const messageSenderMock = vi.fn();

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
