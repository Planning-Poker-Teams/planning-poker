interface APIGatewayLambdaInvocation {
  requestContext: {
    connectionId: string;
    eventType: "CONNECT" | "MESSAGE" | "DISCONNECT";
    connectedAt: number;
    requestTimeEpoch: number;
    requestId: string;
    apiId: string;
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

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: JSON.stringify("OK.")
  };
};
