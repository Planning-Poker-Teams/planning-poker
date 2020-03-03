import ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";

export class ApiGatewayManagementClient {
  private managementApi: any;

  constructor(endpoint: string) {
    this.managementApi = new ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint
    });
  }

  async broadcast(connectionIds: string[], data: string) {
    await Promise.all(
      connectionIds.map(id => {
        this.post(id, data);
      })
    );
  }

  async post(connectionId: string, data: string) {
    await this.managementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: data
      })
      .promise();
  }
}
