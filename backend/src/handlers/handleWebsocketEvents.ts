import log from '../../log';
import PokerEventInteractor from '../interactors/PokerEventInteractor';
import { ApiGatewayMessageSender } from '../repositories/apigw/MessageSender';
import DynamoDbParticipantRepository from '../repositories/dynamodb/ParticipantRepository';
import DynamoDbRoomRepository from '../repositories/dynamodb/RoomRepository';
import { APIGatewayWebsocketInvocationRequest, LambdaResponse } from './lambdaTypes';

const pokerEventInteractor = new PokerEventInteractor(
  new DynamoDbParticipantRepository(process.env.PARTICIPANTS_TABLENAME!),
  new DynamoDbRoomRepository(process.env.ROOMS_TABLENAME!),
  new ApiGatewayMessageSender(process.env.API_GW_DOMAINNAME!)
);

export const handler = async (
  event: APIGatewayWebsocketInvocationRequest
): Promise<LambdaResponse> => {
  const { connectionId, eventType } = event.requestContext;

  switch (eventType) {
    case 'CONNECT':
      log.info('User connected', { connectionId });
      break;

    case 'MESSAGE': {
      const incomingMessage = JSON.parse(event.body);
      await pokerEventInteractor.handleIncomingEvent(incomingMessage, connectionId);
      break;
    }

    case 'DISCONNECT':
      log.info('User disconnected');
      await pokerEventInteractor.handleUserLeft(connectionId);
      break;
  }

  return {
    isBase64Encoded: false,
    headers: {},
    statusCode: 200,
    body: '',
  };
};
