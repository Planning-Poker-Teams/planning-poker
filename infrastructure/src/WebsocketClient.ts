const ApiGatewayManagementApi = require("aws-sdk/clients/apigatewaymanagementapi");

export class WebsocketClient {
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
        this.sendMessage(id, data);
      })
    );
  }

  async sendMessage(connectionId: string, data: string) {
    await this.managementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: data
      })
      .promise();
  }
}
