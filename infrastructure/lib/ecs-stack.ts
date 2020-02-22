import * as cdk from "@aws-cdk/core";
import {
  Cluster,
  ContainerImage,
  BaseService,
  FargateTaskDefinition,
  FargateService
} from "@aws-cdk/aws-ecs";
import { Vpc } from "@aws-cdk/aws-ec2";
import { ApplicationLoadBalancer } from "@aws-cdk/aws-elasticloadbalancingv2";

export interface ECSStackProps extends cdk.StackProps {
  image: ContainerImage;
}

export class ECSStack extends cdk.Stack {
  public readonly cluster: Cluster;
  public readonly ecsService: BaseService;

  constructor(scope: cdk.Construct, id: string, props: ECSStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "VPC", {
      maxAzs: 2,
      natGateways: 1
    });

    this.cluster = new Cluster(this, "ECSCluster", {
      clusterName: "ECSCluster",
      vpc
    });

    const taskDefinition = new FargateTaskDefinition(this, "TaskDefinition", {
      memoryLimitMiB: 1024,
      cpu: 512
    });

    const container = taskDefinition.addContainer("PlanningPokerBackend", {
      image: props.image
    });

    container.addPortMappings({
      containerPort: 8080
    });

    this.ecsService = new FargateService(this, "FargateService", {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: 1
    });

    const lb = new ApplicationLoadBalancer(this, "LB", {
      vpc: vpc,
      internetFacing: true
    });

    // TODO: HTTPS

    const listener = lb.addListener("HttpListener", {
      port: 80
    });

    listener.addTargets("DefaultTarget", {
      port: 8080,
      targets: [this.ecsService]
    });

    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: lb.loadBalancerDnsName
    });

    // const loadBalancedFargateService = new ApplicationLoadBalancedFargateService(
    //   this,
    //   "FargateService",
    //   {
    //     cluster: this.cluster,
    //     desiredCount: 1,
    //     memoryLimitMiB: 1024,
    //     cpu: 512,
    //     taskImageOptions: {
    //       image: props!.image,
    //       containerPort: 8080
    //     }
    //   }
    // );
    // this.ecsService = loadBalancedFargateService.service;
  }
}
