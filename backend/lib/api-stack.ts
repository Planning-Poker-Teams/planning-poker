import * as path from "path";
import * as cdk from "@aws-cdk/core";
import { Runtime, Tracing } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import {
  CfnApi,
  CfnRoute,
  CfnIntegration,
  CfnDeployment,
  CfnStage,
} from "@aws-cdk/aws-apigatewayv2";
import { CfnOutput, Duration } from "@aws-cdk/core";
import { ServicePrincipal, PolicyStatement } from "@aws-cdk/aws-iam";
import {
  Table,
  AttributeType,
  BillingMode,
  StreamViewType,
} from "@aws-cdk/aws-dynamodb";
import { Rule, Schedule } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";

interface ApiStackProps extends cdk.StackProps {
  domainName: string;
  stageName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway

    const api = new CfnApi(this, "Api", {
      name: "PlanningPoker-WebsocketApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.eventType",
    });

    // DynamoDB

    const defaultTableProps = {
      billingMode: BillingMode.PAY_PER_REQUEST,
      serverSideEncryption: true,
    };

    const participantsTable = new Table(this, "ParticipantsTable", {
      tableName: "participants",
      partitionKey: { name: "connectionId", type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      ...defaultTableProps,
    });

    const roomsTable = new Table(this, "RoomsTable", {
      tableName: "rooms",
      partitionKey: { name: "name", type: AttributeType.STRING },
      ...defaultTableProps,
    });

    const websocketEventHandlerLambda = new NodejsFunction(
      this,
      "HandleWebsocketEvent",
      {
        functionName: `${props.stackName}-websocket-handler`,
        entry: path.join(
          __dirname,
          "../src/handlers/handleWebsocketEvents.ts"
        ),
        runtime: Runtime.NODEJS_14_X,
        memorySize: 512,
        tracing: Tracing.ACTIVE,
        environment: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          PARTICIPANTS_TABLENAME: participantsTable.tableName,
          ROOMS_TABLENAME: roomsTable.tableName,
          API_GW_DOMAINNAME: `${props.domainName}/${props.stageName}`,
        },
      }
    );

    participantsTable.grantReadWriteData(websocketEventHandlerLambda);
    roomsTable.grantReadWriteData(websocketEventHandlerLambda);

    websocketEventHandlerLambda.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );

    const manageConnectionsPolicy = new PolicyStatement({
      actions: ["execute-api:ManageConnections"],
      resources: [
        `arn:aws:execute-api:${this.region}:${this.account}:${api.ref}/*`,
      ],
    });

    websocketEventHandlerLambda.addToRolePolicy(manageConnectionsPolicy);

    const preventClientTimeoutLambda = new NodejsFunction(
      this,
      "PreventClientTimeoutLambda",
      {
        functionName: `${props.stackName}-prevent-client-timeout`,
        entry: path.join(__dirname, "../src/handlers/preventClientTimeout.ts"),
        runtime: Runtime.NODEJS_14_X,
        memorySize: 128,
        timeout: Duration.seconds(20),
        tracing: Tracing.ACTIVE,
        environment: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          PARTICIPANTS_TABLENAME: participantsTable.tableName,
          API_GW_DOMAINNAME: `${props.domainName}/${props.stageName}`,
        },
      }
    );

    participantsTable.grantReadWriteData(preventClientTimeoutLambda);

    // Manage connections lambda
    preventClientTimeoutLambda.addToRolePolicy(manageConnectionsPolicy);

    const preventClientTimeoutLambdaTrigger = new Rule(
      this,
      "PreventClientTimeoutLambdaTrigger",
      {
        ruleName: `${props.stackName}-prevent-client-timeout-lambda-trigger`,
        schedule: Schedule.expression("rate(5 minutes)"),
      }
    );

    preventClientTimeoutLambdaTrigger.addTarget(
      new LambdaFunction(preventClientTimeoutLambda)
    );

    // API Gateway (continued)

    const routesToCreate: { prefix: string; routeKey: string }[] = [
      { prefix: "Connect", routeKey: "$connect" },
      { prefix: "Default", routeKey: "$default" },
      { prefix: "Disconnect", routeKey: "$disconnect" },
    ];

    routesToCreate.forEach(({ prefix, routeKey }) => {
      const integration = new CfnIntegration(this, `${prefix}Integration`, {
        apiId: api.ref,
        integrationType: "AWS_PROXY",
        integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${websocketEventHandlerLambda.functionArn}/invocations`,
      });

      new CfnRoute(this, `${prefix}Route`, {
        routeKey,
        apiId: api.ref,
        apiKeyRequired: false,
        authorizationType: "NONE",
        target: `integrations/${integration.ref}`,
      });
    });

    new CfnDeployment(this, "Deployment", {
      apiId: api.ref,
    });

    const stage = new CfnStage(this, "Stage", {
      stageName: props.stageName,
      apiId: api.ref,
    });

    // Outputs

    new CfnOutput(this, "WebSocketURI", {
      value: `wss://${api.ref}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`,
    });

    // Note: When making changes to an existing stage it needs to be redeployed
    // manually: (API GW/Routes/Actions/Deploy API)
    // https://stackoverflow.com/questions/41423439/cloudformation-doesnt-deploy-to-api-gateway-stages-on-update
  }
}
