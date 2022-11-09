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
    api_url = "${aws_apigatewayv2_api.websocket.id}.execute-api.eu-central-1.amazonaws.com/${aws_apigatewayv2_stage.prod.name}"
  })
  acl = "public-read"
}
