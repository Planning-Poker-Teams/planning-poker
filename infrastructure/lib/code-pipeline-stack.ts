import * as cdk from "@aws-cdk/core";
import { Pipeline, Artifact } from "@aws-cdk/aws-codepipeline";
import {
  GitHubSourceAction,
  CodeBuildAction
} from "@aws-cdk/aws-codepipeline-actions";
import { Bucket } from "@aws-cdk/aws-s3";
import { Project, BuildSpec, LinuxBuildImage } from "@aws-cdk/aws-codebuild";
import { Repository } from "@aws-cdk/aws-ecr";
import { SecretValue } from "@aws-cdk/core";
import { Cluster, BaseService } from "@aws-cdk/aws-ecs";
import { PolicyStatement } from "@aws-cdk/aws-iam";

export interface CodePipelineStackProps extends cdk.StackProps {
  repository: Repository;
  cluster: Cluster;
  ecsService: BaseService;
}

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CodePipelineStackProps) {
    super(scope, id, props);

    const artifactBucket = new Bucket(this, "ArtifactsBucket", {
      bucketName: "planning-poker-backend-build"
    });

    const oauthToken = SecretValue.secretsManager(
      "planning-poker-github-oauth-token",
      { jsonField: "token" }
    );

    const codeArtifact = new Artifact("code");

    const codeBuildProject = new Project(this, "CodeBuildProject", {
      projectName: "planning-poker-backend",
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_DOCKER_18_09_0,
        privileged: true
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands:
              "$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)"
          },
          build: {
            commands: [
              "docker build --tag $REPOSITORY_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION --tag $REPOSITORY_URI:latest ."
            ]
          },
          post_build: {
            commands: [
              "docker push $REPOSITORY_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION",
              "docker push $REPOSITORY_URI:latest",
              "aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --force-new-deployment"
            ]
          }
        }
      }),
      environmentVariables: {
        REPOSITORY_URI: {
          value: props.repository.repositoryUri
        },
        ECS_CLUSTER_NAME: {
          value: props.cluster.clusterName
        },
        ECS_SERVICE_NAME: {
          value: props.ecsService.serviceName
        }
      }
    });

    props.repository.grantPullPush(codeBuildProject);
    codeBuildProject.addToRolePolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["ecs:UpdateService"]
      })
    );

    new Pipeline(this, "Pipeline", {
      pipelineName: "planning-poker-backend",
      artifactBucket,
      stages: [
        {
          stageName: "Source",
          actions: [
            new GitHubSourceAction({
              actionName: "GithubAction",
              owner: "c-st",
              output: codeArtifact,
              repo: "planning-poker-backend",
              oauthToken
            })
          ]
        },
        {
          stageName: "Build",
          actions: [
            new CodeBuildAction({
              actionName: "Build",
              input: codeArtifact,
              project: codeBuildProject
            })
          ]
        }
      ]
    });
  }
}
