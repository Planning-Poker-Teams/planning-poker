locals {
  shortenedEnvironment = format("%.20s", var.environment)
  backendDomain        = var.environment == "production" ? "api.${data.aws_route53_zone.main.name}" : "${local.shortenedEnvironment}-api.${data.aws_route53_zone.main.name}"
  frontendDomain       = var.environment == "production" ? data.aws_route53_zone.main.name : "${local.shortenedEnvironment}.${data.aws_route53_zone.main.name}"
}
