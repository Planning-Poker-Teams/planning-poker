import * as cdk from "@aws-cdk/core";
import { CfnApp, CfnBranch } from "@aws-cdk/aws-amplify";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const webApp = new CfnApp(this, "WebApp", {
      name: `${props?.stackName}-web-app`,
      repository: "https://github.com/c-st/planning-poker-web",
      accessToken: "CHANGE ME HERE"
    });

    new CfnBranch(this, "WebAppRepoBranch", {
      branchName: "master",
      appId: webApp.attrAppId
    });

    // The code that defines your stack goes here
  }
}
