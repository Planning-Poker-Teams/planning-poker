locals {
  backendDomain  = var.environment == "production" ? "api.${data.aws_route53_zone.main.name}" : "${var.environment}-api.${data.aws_route53_zone.main.name}"
  frontendDomain = var.environment == "production" ? data.aws_route53_zone.main.name : "${var.environment}.${data.aws_route53_zone.main.name}"
}
