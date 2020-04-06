import { ParticipantRepository } from "../repositories/ParticipantRepository";
import { Participant } from "../domain/types";

export class ConnectionEventInteractor {
  constructor(private participantRepository: ParticipantRepository) {}

  public async registerParticipant(
    newParticipant: Participant,
    roomName: string
  ) {
    await this.participantRepository.putParticipant(newParticipant, roomName);
  }

  public async unregisterParticipant(id: string) {
    await this.participantRepository.removeParticipant(id);
  }
}
