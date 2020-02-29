import * as cdk from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import {
  CfnApi,
  CfnRoute,
  CfnIntegration,
  CfnDeployment,
  CfnStage
} from "@aws-cdk/aws-apigatewayv2";
import { CfnOutput } from "@aws-cdk/core";

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "HelloWorld");

    // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-integration-requests.html

    const api = new CfnApi(this, "Api", {
      name: "PlanningPoker-WebsocketApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.eventType"
    });

    const routesToCreate: { prefix: string; routeKey: string }[] = [
      { prefix: "Connect", routeKey: "$connect" },
      { prefix: "Default", routeKey: "$default" },
      { prefix: "Disconnect", routeKey: "$disconnect" }
    ];

    routesToCreate.forEach(({ prefix, routeKey }) => {
      const integration = new CfnIntegration(this, `${prefix}Integration`, {
        apiId: api.ref,
        integrationType: "AWS_PROXY",
        integrationUri: lambda.functionArn
      });

      new CfnRoute(this, `${prefix}Route`, {
        routeKey,
        apiId: api.ref,
        apiKeyRequired: false,
        authorizationType: "NONE",
        target: `integrations/${integration.ref}`
      });
    });

    new CfnDeployment(this, "Deployment", {
      apiId: api.ref
    });

    const devStage = new CfnStage(this, "Stage", {
      stageName: "dev",
      apiId: api.ref
    });

    // TODO: get region dynamically
    new CfnOutput(this, "WebSocketURI", {
      value: `wss://${api.ref}.execute-api.eu-central-1.amazonaws.com/${devStage.stageName}`
    });
  }
}
