#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ECSStack } from "../lib/ecs-stack";
import { CodePipelineStack } from "../lib/code-pipeline-stack";
import { RepositoryStack } from "../lib/repository-stack";
import { ContainerImage } from "@aws-cdk/aws-ecs";
import { ApiStack } from "../lib/api-stack";

const app = new cdk.App();

const stackProps = {
  env: {
    region: "eu-central-1"
  }
};

new ApiStack(app, "ApiStack", {});

// const { repository } = new RepositoryStack(app, "RepositoryStack", {
//   stackName: "planning-poker-backend-repository",
//   ...stackProps
// });

// const { cluster, ecsService } = new ECSStack(app, "ECSStack", {
//   stackName: "planning-poker-backend-ecs",
//   // image: ContainerImage.fromRegistry("nginx"),
//   image: ContainerImage.fromEcrRepository(repository, "latest"),
//   ...stackProps
// });

// new CodePipelineStack(app, "CodePipelineStack", {
//   stackName: "planning-poker-backend-pipeline",
//   repository,
//   cluster,
//   ecsService,
//   ...stackProps
// });

/**
 * https://github.com/rix0rrr/cdk-ecs-demo/blob/master/lib/code-pipeline-stack.ts
 */
