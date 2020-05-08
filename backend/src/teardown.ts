import { StartedTestContainer } from "testcontainers";

module.exports = async () => {
  const container: StartedTestContainer = (global as any).__DYNAMODB_CONTAINER__;
  await container.stop();
  console.log("Stopped DynamoDB local.");
};
