provider "aws" {
  default_tags {
    tags = {
      Terraform = "true"
      "Environment" : var.environment,
    }
  }
}
