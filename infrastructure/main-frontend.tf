resource "aws_s3_bucket" "frontend" {
  bucket = "planning-poker-${var.environment}-frontend"
}

resource "aws_s3_bucket_website_configuration" "registration-frontend" {
  bucket = aws_s3_bucket.frontend.bucket
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_acl" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  acl    = "public-read"
}

module "dist" {
  source = "hashicorp/dir/template"

  base_dir = "../packages/frontend/dist"
}

resource "aws_s3_object" "static_files" {
  for_each = module.dist.files

  bucket       = aws_s3_bucket.frontend.id
  key          = each.key
  content_type = each.value.content_type
  source       = each.value.source_path
  content      = each.value.content
  acl          = "public-read"
  etag         = each.value.digests.md5
}

resource "aws_s3_object" "environment_js" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "environment.js"
  content_type = "application/javascript"
  content = templatefile("environment.js.tftpl", {
    api_url = local.backendDomain
  })
  acl = "public-read"
}

resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "My awesome CloudFront can access"
}

locals {
  frontend_origin_id = "frontend_s3_origin"
}

resource "aws_cloudfront_response_headers_policy" "no_browser_caching" {
  name = "${var.environment}-no-client-cache"

  custom_headers_config {
    items {
      header   = "Cache-Control"
      override = true
      value    = "no-cache, no-store, must-revalidate"
    }

    items {
      header   = "Pragma"
      override = true
      value    = "no-cache"
    }

    items {
      header   = "Expires"
      override = true
      value    = "0"
    }
  }
}

resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = local.frontend_origin_id
  }

  enabled             = true
  default_root_object = "index.html"

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.frontend_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 0
    max_ttl                    = 0
    response_headers_policy_id = aws_cloudfront_response_headers_policy.no_browser_caching.id
    compress                   = false
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.frontend_origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 31536000
    default_ttl            = 31536000
    max_ttl                = 31536000
    compress               = true
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.frontend.arn
    ssl_support_method  = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  aliases = [
    local.frontendDomain,
  ]
}

data "aws_route53_zone" "selected" {
  name = "planningpoker.cc"
}

resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = local.frontendDomain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
