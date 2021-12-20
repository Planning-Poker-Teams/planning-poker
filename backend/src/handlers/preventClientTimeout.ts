import log from '../../log';
import { ApiGatewayMessageSender } from '../repositories/apigw/MessageSender';
import DynamoDbParticipantRepository from '../repositories/dynamodb/ParticipantRepository';

const participantRepository = new DynamoDbParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);
const messageSender = new ApiGatewayMessageSender(process.env.API_GW_DOMAINNAME!);

export const handler = async (): Promise<any> => {
  const message = JSON.stringify({
    eventType: 'keepAlive',
  });

  const participants = await participantRepository.getAllParticipants();
  if (participants.length == 0) {
    return;
  }

  const allConnectionIds = participants.map(p => p.id);
  await Promise.all(
    allConnectionIds.map(async id => {
      try {
        const isStillAlive = await messageSender.hasConnection(id);
        if (isStillAlive) {
          await messageSender.post(id, message);
        } else {
          log.error(`Caught a 🧟‍♂️ user for ${id}`);
          await participantRepository.removeParticipant(id);
        }
      } catch (error) {
        log.error(error as any);
      }
    })
  );

  log.info(`Successfully sent heartbeat to ${participants.length} participants`);
};
