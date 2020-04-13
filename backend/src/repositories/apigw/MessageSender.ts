import AWSXRay from "aws-xray-sdk-core";
import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";
import { Severity } from "../../../buildLogger";
import { MessageSender } from "../types";

export class ApiGatewayMessageSender implements MessageSender {
  private managementApi: ApiGatewayManagementApi;

  constructor(endpoint: string) {
    this.managementApi = AWSXRay.captureAWSClient(
      new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint,
      })
    ) as ApiGatewayManagementApi;
  }

  async broadcast(recipientIds: string[], data: string) {
    await Promise.all(recipientIds.map((id) => this.post(id, data)));
  }

  async post(recipientId: string, data: string): Promise<void> {
    try {
      await this.managementApi
        .postToConnection({
          ConnectionId: recipientId,
          Data: data,
        })
        .promise();
    } catch (error) {
      console.error(Severity.ERROR, "Error sending websocket message", {
        error,
      });
      return Promise.resolve();
    }
  }
}
