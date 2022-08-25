import * as path from 'path';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
  TableEncryption,
} from '@aws-cdk/aws-dynamodb';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { CfnOutput, Construct, Duration, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

interface ApiStackProps extends StackProps {
  stageName: string;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway
    const api = new WebSocketApi(this, 'PlanningPoker-WebsocketApi');
    new WebSocketStage(this, props.stageName, {
      webSocketApi: api,
      stageName: 'dev',
      autoDeploy: true,
    });

    // DynamoDB
    const defaultTableProps = {
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    };

    const participantsTable = new Table(this, 'ParticipantsTable', {
      tableName: 'participants',
      partitionKey: { name: 'connectionId', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      ...defaultTableProps,
    });

    const roomsTable = new Table(this, 'RoomsTable', {
      tableName: 'rooms',
      partitionKey: { name: 'name', type: AttributeType.STRING },
      ...defaultTableProps,
    });

    const websocketEventHandlerLambda = new NodejsFunction(this, 'HandleWebsocketEvent', {
      functionName: `${props.stackName}-websocket-handler`,
      entry: path.join(__dirname, '../src/handlers/handleWebsocketEvents.ts'),
      runtime: Runtime.NODEJS_14_X,
      memorySize: 512,
      tracing: Tracing.ACTIVE,
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        PARTICIPANTS_TABLENAME: participantsTable.tableName,
        ROOMS_TABLENAME: roomsTable.tableName,
        API_GW_DOMAINNAME: `${api.apiId}.execute-api.${this.region}.amazonaws.com/${props.stageName}`,
      },
    });

    participantsTable.grantReadWriteData(websocketEventHandlerLambda);
    roomsTable.grantReadWriteData(websocketEventHandlerLambda);

    websocketEventHandlerLambda.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

    const manageConnectionsPolicy = new PolicyStatement({
      actions: ['execute-api:ManageConnections'],
      resources: [
        `arn:aws:execute-api:${this.region}:${this.account}:${api.apiId}/${props.stageName}*`,
      ],
    });

    websocketEventHandlerLambda.addToRolePolicy(manageConnectionsPolicy);

    const preventClientTimeoutLambda = new NodejsFunction(this, 'PreventClientTimeoutLambda', {
      functionName: `${props.stackName}-prevent-client-timeout`,
      entry: path.join(__dirname, '../src/handlers/preventClientTimeout.ts'),
      runtime: Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: Duration.seconds(20),
      tracing: Tracing.ACTIVE,
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        PARTICIPANTS_TABLENAME: participantsTable.tableName,
        API_GW_DOMAINNAME: `${api.apiId}.execute-api.${this.region}.amazonaws.com/${props.stageName}`,
      },
    });

    participantsTable.grantReadWriteData(preventClientTimeoutLambda);

    // Manage connections lambda
    preventClientTimeoutLambda.addToRolePolicy(manageConnectionsPolicy);

    const preventClientTimeoutLambdaTrigger = new Rule(this, 'PreventClientTimeoutLambdaTrigger', {
      ruleName: `${props.stackName}-prevent-client-timeout-lambda-trigger`,
      schedule: Schedule.expression('rate(5 minutes)'),
    });

    preventClientTimeoutLambdaTrigger.addTarget(new LambdaFunction(preventClientTimeoutLambda));

    // API Gateway (continued)
    ['connect', 'disconnect', 'default'].forEach(routeKey =>
      api.addRoute(`$${routeKey}`, {
        integration: new WebSocketLambdaIntegration(
          `${routeKey}-LambdaIntegration`,
          websocketEventHandlerLambda
        ),
      })
    );

    // Outputs
    new CfnOutput(this, 'WebSocketURI', {
      value: `${api.apiEndpoint}/${props.stageName}`,
    });
  }
}
