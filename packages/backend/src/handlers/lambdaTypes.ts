export interface APIGatewayWebsocketInvocationRequest {
  requestContext: {
    connectionId: string;
    eventType: 'CONNECT' | 'MESSAGE' | 'DISCONNECT';
    connectedAt: number;
    requestTimeEpoch: number;
    requestId: string;
    apiId: string;
    domainName: string;
    stage: string;
  };
  queryStringParameters?: {
    [key: string]: string;
  };
  multiValueQueryStringParameters?: any;
  body?: any;
  isBase64Encoded: boolean;
}

export interface LambdaResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string; // stringified JSON
}
