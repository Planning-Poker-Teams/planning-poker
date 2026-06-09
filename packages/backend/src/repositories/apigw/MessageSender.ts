import {
  ApiGatewayManagementApiClient,
  GetConnectionCommand,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import * as AWSXRay from 'aws-xray-sdk-core';
import log from '../../log';
import { MessageSender } from '../types';

/**
 * The AWS SDK v3 `ApiGatewayManagementApiClient` parses `endpoint` as a full URL and
 * requires a scheme. The deployed `API_GW_DOMAINNAME` is a bare host (e.g.
 * `abc.execute-api.eu-central-1.amazonaws.com/prod`), so we default it to `https://`.
 * Local setups already pass a scheme (`http://...`), which is preserved.
 */
const normalizeEndpoint = (endpoint: string): string =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;

export class ApiGatewayMessageSender implements MessageSender {
  private managementApi: ApiGatewayManagementApiClient;

  constructor(endpoint: string) {
    this.managementApi = AWSXRay.captureAWSv3Client(
      new ApiGatewayManagementApiClient({
        endpoint: normalizeEndpoint(endpoint),
      })
    );
  }

  async broadcast(recipientIds: string[], data: string): Promise<void> {
    await Promise.all(recipientIds.map(id => this.post(id, data)));
  }

  async post(recipientId: string, data: string): Promise<void> {
    try {
      await this.managementApi.send(
        new PostToConnectionCommand({
          ConnectionId: recipientId,
          Data: data,
        })
      );
    } catch (error) {
      log.error(error as any);
      return Promise.resolve();
    }
  }

  async hasConnection(connectionId: string): Promise<boolean> {
    try {
      await this.managementApi.send(
        new GetConnectionCommand({
          ConnectionId: connectionId,
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
