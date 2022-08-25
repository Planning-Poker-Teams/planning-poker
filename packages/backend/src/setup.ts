import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { GenericContainer } from 'testcontainers';

const createTable = async (
  dynamoDbClient: AWS.DynamoDB,
  name: string,
  pkName: string
): Promise<void> => {
  const params = {
    TableName: name,
    KeySchema: [{ AttributeName: pkName, KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: pkName, AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  await dynamoDbClient.createTable(params).promise();
};

module.exports = async (): Promise<void> => {
  // See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html
  const container = await new GenericContainer('amazon/dynamodb-local')
    .withCmd([
      '-Djava.library.path=./DynamoDBLocal_lib',
      '-jar',
      'DynamoDBLocal.jar',
      '-inMemory',
      '-sharedDb',
    ])
    .withExposedPorts(8000)
    .start();

  (global as any).__DYNAMODB_CONTAINER__ = container;

  process.env.DYNAMODB_ENDPOINT = `http://${container.getContainerIpAddress()}:${container.getMappedPort(
    8000
  )}`;
  const dynamoClientOptions: ServiceConfigurationOptions = {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: 'localhost',
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
  };

  const dynamoDbClient = new AWS.DynamoDB(dynamoClientOptions);
  await createTable(dynamoDbClient, 'participants', 'connectionId');
  await createTable(dynamoDbClient, 'rooms', 'name');

  console.log('Started DynamoDB local.');
};
