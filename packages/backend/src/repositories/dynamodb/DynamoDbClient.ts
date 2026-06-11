import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  BatchGetCommandInput,
  BatchGetCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  NativeAttributeValue,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

interface QueryIndexParameters {
  tableName: string;
  indexName: string;
  keyConditionExpression: string;
  keyValues: Record<string, NativeAttributeValue>;
  limit: number;
  scanIndexForward?: boolean;
  startKeyObject?: Record<string, NativeAttributeValue>;
}

interface BaseParameters {
  tableName: string;
  partitionKey: Record<string, NativeAttributeValue>;
  conditionExpression?: string;
  expressionAttributeValues?: Record<string, NativeAttributeValue>;
  expressionAtributeNames?: Record<string, string>;
}

type DeleteParameters = BaseParameters;

interface UpdateParameters extends BaseParameters {
  updateExpression: string;
  returnValues?: UpdateCommandInput['ReturnValues'];
}

type KeyInfo = Record<string, NativeAttributeValue>;
type AttributeMap = Record<string, NativeAttributeValue>;
type TFilterExpression = {
  FilterExpression: string;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: Record<string, NativeAttributeValue>;
};
type TFilterObject = Record<string, NativeAttributeValue>;

const inTestEnvironment = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

export class DynamoDbClient {
  private client: DynamoDBDocumentClient;

  constructor(config: DynamoDBClientConfig | undefined = undefined) {
    const localEndpoint = process.env.DYNAMODB_ENDPOINT;
    const defaultConfig: DynamoDBClientConfig = localEndpoint
      ? {
          endpoint: localEndpoint,
          region: process.env.AWS_DEFAULT_REGION || 'eu-central-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
          },
        }
      : {};

    const dynamoDbClient = new DynamoDBClient({
      ...defaultConfig,
      ...config,
    });
    const tracedClient = inTestEnvironment
      ? dynamoDbClient
      : AWSXRay.captureAWSv3Client(dynamoDbClient);

    this.client = DynamoDBDocumentClient.from(tracedClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  private filterExpression(filter: TFilterObject): TFilterExpression {
    const expression: TFilterExpression = {
      FilterExpression: '',
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    expression.FilterExpression = Object.keys(filter)
      .map(attr => `#${attr} = :${attr}`)
      .join(' AND ');

    for (const attr in filter) {
      expression.ExpressionAttributeNames[`#${attr}`] = attr;
      expression.ExpressionAttributeValues[`:${attr}`] = filter[attr];
    }

    return expression;
  }

  async put(tableName: string, item: Record<string, NativeAttributeValue>): Promise<PutCommandOutput> {
    return this.client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );
  }

  async scan(tableName: string, filter?: TFilterObject): Promise<AttributeMap[]> {
    const args: ScanCommandInput = {
      TableName: tableName,
    };

    if (filter) {
      Object.assign(args, this.filterExpression(filter));
    }

    const items: AttributeMap[] = [];
    let pagedItems;

    do {
      pagedItems = await this.client.send(new ScanCommand(args));
      pagedItems.Items?.forEach(item => items.push(item));
      args.ExclusiveStartKey = pagedItems.LastEvaluatedKey;
    } while (pagedItems.LastEvaluatedKey);

    return items;
  }

  get(tableName: string, keyInfo: KeyInfo, consistentRead = false): Promise<GetCommandOutput> {
    const args: GetCommandInput = {
      TableName: tableName,
      Key: keyInfo,
      ConsistentRead: consistentRead,
    };

    return this.client.send(new GetCommand(args));
  }

  batchGet(tableName: string, fieldName: string, ids: string[]): Promise<BatchGetCommandOutput> {
    const args: BatchGetCommandInput = {
      RequestItems: {
        [tableName]: {
          Keys: ids.map(id => ({ [fieldName]: id })),
        },
      },
    };

    return this.client.send(new BatchGetCommand(args));
  }

  update(parameters: UpdateParameters): Promise<UpdateCommandOutput> {
    const args: UpdateCommandInput = {
      TableName: parameters.tableName,
      Key: parameters.partitionKey,
      ConditionExpression: parameters.conditionExpression,
      ExpressionAttributeNames: parameters.expressionAtributeNames,
      ExpressionAttributeValues: parameters.expressionAttributeValues,
      UpdateExpression: parameters.updateExpression,
      ReturnValues: parameters.returnValues,
    };

    return this.client.send(new UpdateCommand(args));
  }

  delete(parameters: DeleteParameters): Promise<DeleteCommandOutput> {
    const args: DeleteCommandInput = {
      TableName: parameters.tableName,
      Key: parameters.partitionKey,
      ConditionExpression: parameters.conditionExpression,
      ExpressionAttributeValues: parameters.expressionAttributeValues,
    };

    return this.client.send(new DeleteCommand(args));
  }

  queryIndex(parameters: QueryIndexParameters): Promise<QueryCommandOutput> {
    return this.client.send(
      new QueryCommand({
        TableName: parameters.tableName,
        IndexName: parameters.indexName,
        KeyConditionExpression: parameters.keyConditionExpression,
        ExpressionAttributeValues: parameters.keyValues,
        ScanIndexForward:
          parameters.scanIndexForward !== undefined ? parameters.scanIndexForward : true,
        Limit: parameters.limit,
        ExclusiveStartKey: parameters.startKeyObject,
      })
    );
  }

  createSetExpression(values: NativeAttributeValue[]): Set<NativeAttributeValue> {
    return new Set(values);
  }
}
