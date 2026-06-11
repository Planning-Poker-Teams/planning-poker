import { CreateTableCommand, DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GenericContainer } from 'testcontainers';

const createTable = async (
  dynamoDbClient: DynamoDBClient,
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

  await dynamoDbClient.send(new CreateTableCommand(params));
};

export default async function setup(): Promise<() => Promise<void>> {
  // See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html
  const container = await new GenericContainer('amazon/dynamodb-local')
    .withCommand([
      '-Djava.library.path=./DynamoDBLocal_lib',
      '-jar',
      'DynamoDBLocal.jar',
      '-inMemory',
      '-sharedDb',
    ])
    .withExposedPorts(8000)
    .start();

  process.env.DYNAMODB_ENDPOINT = `http://${container.getHost()}:${container.getMappedPort(
    8000
  )}`;
  const dynamoClientOptions: DynamoDBClientConfig = {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: 'localhost',
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
    },
  };

  const dynamoDbClient = new DynamoDBClient(dynamoClientOptions);
  await createTable(dynamoDbClient, 'participants', 'connectionId');
  await createTable(dynamoDbClient, 'rooms', 'name');

  console.log('Started DynamoDB local.');

  return async () => {
    await container.stop();
    console.log('Stopped DynamoDB local.');
  };
}
