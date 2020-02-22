import * as cdk from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-ecr";

export class RepositoryStack extends cdk.Stack {
  public readonly repository: Repository;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new Repository(this, "Repository");
    this.repository.addLifecycleRule({
      maxImageAge: cdk.Duration.days(30)
    });
  }
}
