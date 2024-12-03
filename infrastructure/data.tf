data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_route53_zone" "main" {
  name = "estim8.cards"
}

data "aws_acm_certificate" "backend" {
  domain = "*.${data.aws_route53_zone.main.name}"
}

data "aws_acm_certificate" "frontend" {
  domain   = "*.${data.aws_route53_zone.main.name}"
  provider = aws.virginia
}
