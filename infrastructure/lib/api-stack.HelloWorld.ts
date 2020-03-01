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
  queryStringParameters?: any;
  multiValueQueryStringParameters?: any;
  body?: any;
  isBase64Encoded: boolean;
}

interface ProxiedLambdaResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string; // stringified JSON
}

export const buildLogger = (connectionId: string, requestId: string) => (
  message: string,
  metadata?: object
) => {
  console.log(
    JSON.stringify({
      message,
      metadata,
      connectionId,
      requestId
    })
  );
};

export const handler = async (
  event: APIGatewayLambdaInvocation
): Promise<ProxiedLambdaResponse> => {
  // console.log(JSON.stringify(event));

  const { connectionId, requestId } = event.requestContext;
  const log = buildLogger(connectionId, requestId);

  switch (event.requestContext.eventType) {
    case "CONNECT":
      const { room, name, isSpectator } = event.queryStringParameters ?? {};
      // 
      log(`User ${name} joined ${room}`);
      break;

    case "MESSAGE":
      log(`Incoming event`, { requestBody: event.body });
      break;

    case "DISCONNECT":
      log(`User left`);
      break;
  }

  // If we received a message we echo it back 🦜
  if (event.body && event.requestContext.eventType == "MESSAGE") {
    const { connectionId, domainName, stage } = event.requestContext;
    const managementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: `${domainName}/${stage}`
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
    body: ""
  };
};
