import AWSXRay from "aws-xray-sdk-core";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { ScanInput } from "aws-sdk/clients/dynamodb";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import BatchGetItemInput = DocumentClient.BatchGetItemInput;
import GetItemInput = DocumentClient.GetItemInput;
import DeleteItemInput = DocumentClient.DeleteItemInput;
import ExpressionAttributeValueMap = DocumentClient.ExpressionAttributeValueMap;
import ExpressionAttributeNameMap = DocumentClient.ExpressionAttributeNameMap;
import UpdateItemInput = DocumentClient.UpdateItemInput;
import UpdateItemOutput = DocumentClient.UpdateItemOutput;
import DeleteItemOutput = DocumentClient.DeleteItemOutput;
import BatchGetItemOutput = DocumentClient.BatchGetItemOutput;
import GetItemOutput = DocumentClient.GetItemOutput;
import PutItemOutput = DocumentClient.PutItemOutput;
import QueryOutput = DocumentClient.QueryOutput;
import AttributeMap = DocumentClient.AttributeMap;

interface QueryIndexParameters {
  tableName: string;
  indexName: string;
  keyConditionExpression: string;
  keyValues: object;
  limit: number;
  scanIndexForward?: boolean;
  startKeyObject?: object;
}

interface BaseParameters {
  tableName: string;
  partitionKey: object; // { id: '123' }
  conditionExpression?: string;
  expressionAttributeValues?: ExpressionAttributeValueMap;
  expressionAtributeNames?: ExpressionAttributeNameMap;
}

interface DeleteParameters extends BaseParameters {}

interface UpdateParameters extends BaseParameters {
  updateExpression: string;
  returnValues?: string;
}

type KeyInfo = { [key: string]: any };

export class DynamoDbClient {
  private client: DocumentClient;

  constructor(enableXRay: boolean = true) {
    if (enableXRay) {
      // Workaround for https://github.com/aws/aws-xray-sdk-node/issues/23
      this.client = new DynamoDB.DocumentClient({
        service: new DynamoDB({ apiVersion: "2012-10-08" }),
      });
      AWSXRay.captureAWSClient((this.client as any).service);
    } else {
      this.client = new DynamoDB.DocumentClient();
    }
  }

  put(tableName: string, item: object): Promise<PutItemOutput> {
    const args = {
      TableName: tableName,
      Item: item,
    };

    return this.client.put(args).promise();
  }

  async scan(tableName: string): Promise<AttributeMap[]> {
    const args: ScanInput = {
      TableName: tableName,
    };

    let items: AttributeMap[] = [];
    let pagedItems;

    do {
      pagedItems = await this.client.scan(args).promise();
      pagedItems.Items?.forEach((item) => items.push(item));
      args.ExclusiveStartKey = pagedItems.LastEvaluatedKey;
    } while (pagedItems.LastEvaluatedKey);

    return items;
  }

  get(
    tableName: string,
    keyInfo: KeyInfo,
    consistentRead: boolean = false
  ): Promise<GetItemOutput> {
    const args: GetItemInput = {
      TableName: tableName,
      Key: keyInfo,
      ConsistentRead: consistentRead,
    };

    return this.client.get(args).promise();
  }

  batchGet(
    tableName: string,
    fieldName: string,
    ids: string[]
  ): Promise<BatchGetItemOutput> {
    const args: BatchGetItemInput = {
      RequestItems: {
        [tableName]: {
          Keys: ids.map((id) => ({ [fieldName]: id })),
        },
      },
    };

    return this.client.batchGet(args).promise();
  }

  update(parameters: UpdateParameters): Promise<UpdateItemOutput> {
    const args: UpdateItemInput = {
      TableName: parameters.tableName,
      Key: parameters.partitionKey,
      ConditionExpression: parameters.conditionExpression,
      ExpressionAttributeValues: parameters.expressionAttributeValues,
      UpdateExpression: parameters.updateExpression,
      ReturnValues: parameters.returnValues,
    };

    return this.client.update(args).promise();
  }

  delete(parameters: DeleteParameters): Promise<DeleteItemOutput> {
    const args: DeleteItemInput = {
      TableName: parameters.tableName,
      Key: parameters.partitionKey,
      ConditionExpression: parameters.conditionExpression,
      ExpressionAttributeValues: parameters.expressionAttributeValues,
    };

    return this.client.delete(args).promise();
  }

  queryIndex(parameters: QueryIndexParameters): Promise<QueryOutput> {
    const args = {
      TableName: parameters.tableName,
      IndexName: parameters.indexName,
      KeyConditionExpression: parameters.keyConditionExpression,
      ExpressionAttributeValues: parameters.keyValues,
      ScanIndexForward:
        parameters.scanIndexForward !== undefined
          ? parameters.scanIndexForward
          : true,
      Limit: parameters.limit,
      ExclusiveStartKey: parameters.startKeyObject,
    };

    return this.client.query(args).promise();
  }

  createSetExpression(values: any) {
    // see https://stackoverflow.com/questions/37194794/how-to-update-an-item-in-dynamodb-of-type-string-set-ss
    return this.client.createSet(values);
  }
}