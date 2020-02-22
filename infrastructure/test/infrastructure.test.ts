import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import Infrastructure = require("../lib/code-pipeline-stack");

test("Empty Stack", () => {
  // const app = new cdk.App();
  // WHEN
  // const stack = new Infrastructure.InfrastructureStack(app, 'MyTestStack');
  // THEN
  // expectCDK(stack).to(matchTemplate({
  //   "Resources": {}
  // }, MatchStyle.EXACT))
});
