import * as cdk from "@aws-cdk/core";
import { SecretValue } from "@aws-cdk/core";
import { CfnApp, CfnBranch } from "@aws-cdk/aws-amplify";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const oauthToken = SecretValue.secretsManager(
      "planning-poker-github-oauth-token",
      { jsonField: "token" }
    );

    const webApp = new CfnApp(this, "WebApp", {
      name: `${props?.stackName}-amplify-app`,
      repository: "https://github.com/c-st/planning-poker-web",
      accessToken: oauthToken.toString(),
      customRules: [
        {
          source:
            "</^((?!.(css|gif|ico|jpg|js|json|png|txt|svg|woff|ttf|map)$).)*$/>",
          target: "/",
          status: "200"
        }
      ]
    });

    new CfnBranch(this, "WebAppRepoBranch", {
      branchName: "master",
      appId: webApp.attrAppId
    });
  }
}
