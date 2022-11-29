resource "aws_dynamodb_table" "participants" {
  name         = "planning-poker-${var.environment}-participants"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "rooms" {
  name         = "planning-poker-${var.environment}-rooms"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "name"

  attribute {
    name = "name"
    type = "S"
  }
}

resource "aws_apigatewayv2_api" "websocket" {
  name                       = "planning-poker-${var.environment}-websocket-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

module "websocket_handler" {
  source = "terraform-aws-modules/lambda/aws"

  runtime       = "nodejs18.x"
  function_name = "planning-poker-${var.environment}-websocket-handler"
  handler       = "handleWebsocketEvents.handler"
  source_path = [
    "../packages/backend/dist/handleWebsocketEvents.js",
  ]

  environment_variables = {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1,
    PARTICIPANTS_TABLENAME              = aws_dynamodb_table.participants.name,
    ROOMS_TABLENAME                     = aws_dynamodb_table.rooms.name,
    API_GW_DOMAINNAME                   = "${aws_apigatewayv2_api.websocket.id}.execute-api.eu-central-1.amazonaws.com/${aws_apigatewayv2_stage.prod.name}",
  }

  publish                           = true
  memory_size                       = 1024 # More memory means also more CPU
  tracing_mode                      = "Active"
  cloudwatch_logs_retention_in_days = 30

  attach_policy_statements = true
  attach_tracing_policy    = true
  policy_statements = {
    dynamodb = {
      effect = "Allow",
      actions = [
        "dynamodb:BatchGetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:ConditionCheckItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
      ],
      resources = [
        aws_dynamodb_table.participants.arn,
        aws_dynamodb_table.rooms.arn,
      ]
    }
    api-gateway = {
      effect = "Allow",
      actions = [
        "execute-api:ManageConnections",
      ],
      resources = [
        "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.websocket.id}/${aws_apigatewayv2_stage.prod.name}/*",
      ]
    }
  }

  allowed_triggers = {
    websocket = {
      service    = "apigateway"
      source_arn = "${aws_apigatewayv2_api.websocket.execution_arn}/*/*"
    }
  }
}

module "prevent_client_timeout" {
  source = "terraform-aws-modules/lambda/aws"

  runtime       = "nodejs18.x"
  function_name = "planning-poker-${var.environment}-prevent-client-timeout"
  handler       = "preventClientTimeout.handler"
  source_path = [
    "../packages/backend/dist/preventClientTimeout.js",
  ]

  environment_variables = {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1,
    PARTICIPANTS_TABLENAME              = aws_dynamodb_table.participants.name,
    ROOMS_TABLENAME                     = aws_dynamodb_table.rooms.name,
    API_GW_DOMAINNAME                   = "${aws_apigatewayv2_api.websocket.id}.execute-api.eu-central-1.amazonaws.com/${aws_apigatewayv2_stage.prod.name}",
  }

  publish                           = true
  memory_size                       = 1024 # More memory means also more CPU
  tracing_mode                      = "Active"
  cloudwatch_logs_retention_in_days = 30

  attach_policy_statements = true
  attach_tracing_policy    = true
  policy_statements = {
    dynamodb = {
      effect = "Allow",
      actions = [
        "dynamodb:BatchGetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:ConditionCheckItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
      ],
      resources = [
        aws_dynamodb_table.participants.arn,
        aws_dynamodb_table.rooms.arn,
      ]
    }
    api-gateway = {
      effect = "Allow",
      actions = [
        "execute-api:ManageConnections",
      ],
      resources = [
        "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.websocket.id}/${aws_apigatewayv2_stage.prod.name}/*",
      ]
    }
  }

  allowed_triggers = {
    prevent-timeout-scheduler = {
      principal  = "events.amazonaws.com"
      source_arn = aws_cloudwatch_event_rule.prevent_client_timeout.arn
    }
  }
}

resource "aws_cloudwatch_event_rule" "prevent_client_timeout" {
  name                = "${var.environment}-prevent-timeout-event"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "prevent_client_timeout" {
  target_id = "${var.environment}-prevent-timeout-event-target"
  rule      = aws_cloudwatch_event_rule.prevent_client_timeout.name
  arn       = module.prevent_client_timeout.lambda_function_arn
}

resource "aws_apigatewayv2_integration" "websocket" {
  api_id           = aws_apigatewayv2_api.websocket.id
  integration_type = "AWS_PROXY"
  integration_uri  = module.websocket_handler.lambda_function_invoke_arn
}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.websocket.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = local.backendDomain

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.backend.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_route53_record" "api" {
  name    = aws_apigatewayv2_domain_name.api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.main.id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.websocket.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.prod.id
}
