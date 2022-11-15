provider "aws" {
  default_tags {
    tags = {
      Terraform = "true"
      "Environment" : var.environment,
    }
  }
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}
