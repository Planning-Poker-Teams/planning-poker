import log from "../../log";
import DynamoDbParticipantRepository from "../repositories/dynamodb/ParticipantRepository";
import { ApiGatewayMessageSender } from "../repositories/apigw/MessageSender";

const participantRepository = new DynamoDbParticipantRepository(
  process.env.PARTICIPANTS_TABLENAME!
);
const messageSender = new ApiGatewayMessageSender(
  process.env.API_GW_DOMAINNAME!
);

export const handler = async (): Promise<any> => {
  const message = JSON.stringify({
    eventType: "keepAlive",
  });

  const participants = await participantRepository.getAllParticipants();
  const allConnectionIds = participants.map((p) => p.id);
  await Promise.all(
    allConnectionIds.map(async (id) => {
      try {
        await messageSender.post(id, message);
      } catch (error) {
        log.error(error);
      }
    })
  );

  log.info(
    `Successfully sent heartbeat to ${participants.length} participants`
  );
};
