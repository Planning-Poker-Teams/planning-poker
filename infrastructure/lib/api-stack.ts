import * as cdk from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // CfnApi (protocolType = websocket)
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html

    new NodejsFunction(this, "HelloWorldFunction", {
      entry: "./handlers/helloWorld.ts",
      handler: "handler"
    });
  }
}
