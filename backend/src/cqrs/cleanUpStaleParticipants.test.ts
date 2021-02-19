import { cleanUpStaleParticipants } from "./cleanUpStaleParticipants";
import { MessageSender, ParticipantRepository, RoomRepository } from "../repositories/types";

describe('cleanUpStaleParticipants', () => {
  it('should remove participants with stale web socket connection', async () => {
    const participantRepositoryMock = {
      removeParticipant: jest.fn().mockResolvedValue(null),
    } as unknown as ParticipantRepository;
    
    const roomRepositoryMock = {
      getOrCreateRoom: jest.fn().mockResolvedValue({
        name: 'Test',
        participants: ['STALE_PARTICIPANT', 'ACTIVE_PARTICIPANT'],
      }),
      removeFromParticipants: jest.fn().mockResolvedValue(null),
    } as unknown as RoomRepository;
    
    const messageSenderMock = {
        hasConnection: jest.fn().mockImplementation(connectionId =>
          connectionId === 'ACTIVE_PARTICIPANT' ? Promise.resolve(true) : Promise.resolve(false)),
    } as unknown as MessageSender;
    
    await cleanUpStaleParticipants('Test', roomRepositoryMock, participantRepositoryMock, messageSenderMock);
    
    expect(participantRepositoryMock.removeParticipant).toHaveBeenCalledWith('STALE_PARTICIPANT');
    expect(roomRepositoryMock.removeFromParticipants).toHaveBeenCalledWith('Test', 'STALE_PARTICIPANT');
  });
});
