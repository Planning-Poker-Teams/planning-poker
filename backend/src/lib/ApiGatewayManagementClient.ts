import AWSXRay from "aws-xray-sdk-core";
import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";
import { Severity } from "./buildLogger";

export class ApiGatewayManagementClient {
  private managementApi: ApiGatewayManagementApi;

  constructor(endpoint: string) {
    this.managementApi = AWSXRay.captureAWSClient(
      new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint
      })
    ) as ApiGatewayManagementApi;
  }

  async broadcast(connectionIds: string[], data: string) {
    await Promise.all(connectionIds.map(id => this.post(id, data)));
  }

  async post(connectionId: string, data: string) {
    try {
      return await this.managementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: data
        })
        .promise();
    } catch (error) {
      console.error(Severity.ERROR, "Error sending websocket message", {
        error
      });
      return Promise.resolve();
    }
  }
}
