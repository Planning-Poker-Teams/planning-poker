import * as AWS from "aws-sdk";

interface APIGatewayLambdaInvocation {
  requestContext: {
    connectionId: string;
    eventType: "CONNECT" | "MESSAGE" | "DISCONNECT";
    connectedAt: number;
    requestTimeEpoch: number;
    requestId: string;
    apiId: string;
    domainName: string;
    stage: string;
  };
  body?: any; // only when eventType == MESSAGE
  isBase64Encoded: boolean;
}

interface ProxiedLambdaResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string; // stringified JSON
}

export const handler = async (
  event: APIGatewayLambdaInvocation
): Promise<ProxiedLambdaResponse> => {
  console.log("Hello world. Invocation", JSON.stringify(event));
  console.log("Body:", event.body);

  // If we received a message we echo it back 🦜
  if (event.body && event.requestContext.eventType == "MESSAGE") {
    const { connectionId } = event.requestContext;
    const managementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint:
        event.requestContext.domainName + "/" + event.requestContext.stage
    });

    await managementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: event.body
      })
      .promise();
  }

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: JSON.stringify("OK.")
  };
};
