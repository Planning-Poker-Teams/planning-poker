import * as ApiGatewayManagementApi from "aws-sdk/clients/apigatewaymanagementapi";

export const buildClient = (domainName: string, stage: string) => async (
  connectionId: string,
  data: string
) => {
  const managementApi = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: `${domainName}/${stage}`
  });

  await managementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: data
    })
    .promise();
};
