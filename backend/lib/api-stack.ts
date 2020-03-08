import * as path from "path";
import * as cdk from "@aws-cdk/core";
import { Runtime, Tracing } from "@aws-cdk/aws-lambda";
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
import { Table, AttributeType, BillingMode } from "@aws-cdk/aws-dynamodb";

// TODO: add custom domain (api.planningpoker.cc)
// https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html

interface ApiStackProps extends cdk.StackProps {
  stageName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Required for debugging API Gateway. Can be removed eventually:
    this.createCloudWatchLogRole();

    // API Gateway

    const api = new CfnApi(this, "Api", {
      name: "PlanningPoker-WebsocketApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.eventType"
    });

    // DynamoDB

    const defaultTableProps = {
      billingMode: BillingMode.PAY_PER_REQUEST,
      serverSideEncryption: true
    };

    const participantsTable = new Table(this, "ParticipantsTable", {
      tableName: "participants",
      partitionKey: { name: "connectionId", type: AttributeType.STRING },
      ...defaultTableProps
    });

    const roomsTable = new Table(this, "RoomsTable", {
      tableName: "rooms",
      partitionKey: { name: "roomName", type: AttributeType.STRING },
      ...defaultTableProps
    });

    // Lambda

    const lambda = new NodejsFunction(this, "HandleEvent", {
      functionName: `${props.stackName}-websocket-handler`,
      entry: path.join(__dirname, "../src/handlers/websocketHandler.ts"),
      runtime: Runtime.NODEJS_12_X,
      memorySize: 256,
      tracing: Tracing.ACTIVE,
      environment: {
        PARTICIPANTS_TABLENAME: participantsTable.tableName,
        ROOMS_TABLENAME: roomsTable.tableName
      }
    });

    participantsTable.grantReadWriteData(lambda);
    roomsTable.grantReadWriteData(lambda);
    lambda.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["execute-api:ManageConnections"],
        resources: [
          `arn:aws:execute-api:${this.region}:${this.account}:${api.ref}/*`
        ]
      })
    );

    // API Gateway (continued)

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

    const stage = new CfnStage(this, "Stage", {
      stageName: props.stageName,
      apiId: api.ref
    });

    // Outputs

    new CfnOutput(this, "WebSocketURI", {
      value: `wss://${api.ref}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`
    });

    // Note: When making changes to an existing stage it needs to be redeployed
    // manually: (API GW/Routes/Actions/Deploy API)
    // https://stackoverflow.com/questions/41423439/cloudformation-doesnt-deploy-to-api-gateway-stages-on-update
  }

  private createCloudWatchLogRole() {
    // The following role is required for allowing API Gateway to log to CloudWatch.
    // It has to be configured at the API GW Account. However `CfnAccount` seems
    // to be missing so for now I have set it manually in the Console.
    // https://github.com/awsdocs/aws-cloudformation-user-guide/blob/master/doc_source/aws-resource-apigateway-account.md

    const cloudWatchRole = new Role(this, "CloudWatchRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
        )
      ]
    });

    new CfnOutput(this, "CloudWatchRoleArn", {
      value: cloudWatchRole.roleArn
    });
  }
}
