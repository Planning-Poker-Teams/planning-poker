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
import {
  ServicePrincipal,
  PolicyStatement,
  Role,
  ManagedPolicy
} from "@aws-cdk/aws-iam";

// TODO: add custom domain (api.planningpoker.cc)
// https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const api = new CfnApi(this, "Api", {
      name: "PlanningPoker-WebsocketApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.eventType" // not used
    });

    const lambda = new NodejsFunction(this, "HelloWorld");
    lambda.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["execute-api:ManageConnections"],
        resources: [
          `arn:aws:execute-api:${this.region}:${this.account}:${api.ref}/*`
        ]
      })
    );

    const routesToCreate: { prefix: string; routeKey: string }[] = [
      { prefix: "Connect", routeKey: "$connect" },
      { prefix: "Default", routeKey: "$default" },
      { prefix: "Disconnect", routeKey: "$disconnect" }
    ];

    routesToCreate.forEach(({ prefix, routeKey }) => {
      const integration = new CfnIntegration(this, `${prefix}Integration`, {
        apiId: api.ref,
        integrationType: "AWS_PROXY",
        integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambda.functionArn}/invocations`
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

    new CfnOutput(this, "WebSocketURI", {
      value: `wss://${api.ref}.execute-api.${this.region}.amazonaws.com/${devStage.stageName}`
    });

    // wss://g5ktyisvyf.execute-api.eu-central-1.amazonaws.com/dev?name=Test&room=MyRoom&spectator=false

    // When making changes to an existing stage it needs to be redeployed manually (API GW/Routes/Actions/Deploy API)
    // https://stackoverflow.com/questions/41423439/cloudformation-doesnt-deploy-to-api-gateway-stages-on-update
  }
}
