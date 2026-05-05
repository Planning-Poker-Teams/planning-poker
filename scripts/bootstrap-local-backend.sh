#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_DIR="${ROOT_DIR}/.local"
BUILD_DIR="${LOCAL_DIR}/build"
FRONTEND_ENV_FILE="${ROOT_DIR}/packages/frontend/.env.local"
METADATA_FILE="${LOCAL_DIR}/local-backend.json"
AWS_ENDPOINT_URL="${AWS_ENDPOINT_URL:-http://localhost:4566}"
MINISTACK_INTERNAL_ENDPOINT="${MINISTACK_INTERNAL_ENDPOINT:-http://ministack:4566}"
AWS_REGION="${AWS_DEFAULT_REGION:-eu-central-1}"

PARTICIPANTS_TABLE_NAME="${PARTICIPANTS_TABLE_NAME:-estim8-local-participants}"
ROOMS_TABLE_NAME="${ROOMS_TABLE_NAME:-estim8-local-rooms}"
WEBSOCKET_API_NAME="${WEBSOCKET_API_NAME:-estim8-local-websocket}"
WEBSOCKET_HANDLER_NAME="${WEBSOCKET_HANDLER_NAME:-estim8-local-websocket-handler}"
PREVENT_TIMEOUT_HANDLER_NAME="${PREVENT_TIMEOUT_HANDLER_NAME:-estim8-local-prevent-client-timeout}"

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_DEFAULT_REGION="${AWS_REGION}"
export AWS_PAGER=""

aws_local() {
  aws --endpoint-url "${AWS_ENDPOINT_URL}" "$@"
}

run_yarn() {
  if command -v yarn >/dev/null 2>&1; then
    yarn "$@"
  else
    corepack yarn "$@"
  fi
}

ensure_requirements() {
  command -v aws >/dev/null 2>&1 || {
    echo "aws CLI is required" >&2
    exit 1
  }
  command -v zip >/dev/null 2>&1 || {
    echo "zip is required" >&2
    exit 1
  }
  command -v curl >/dev/null 2>&1 || {
    echo "curl is required" >&2
    exit 1
  }
}

wait_for_ministack() {
  echo "Waiting for MiniStack at ${AWS_ENDPOINT_URL}..."
  for _ in $(seq 1 30); do
    if curl --fail --silent "${AWS_ENDPOINT_URL}/_ministack/health" >/dev/null 2>&1; then
      return
    fi
    sleep 2
  done

  echo "MiniStack is not reachable. Start it with: corepack yarn local:backend:start" >&2
  exit 1
}

ensure_table() {
  local table_name="$1"
  local key_name="$2"

  if aws_local dynamodb describe-table --table-name "${table_name}" >/dev/null 2>&1; then
    return
  fi

  aws_local dynamodb create-table \
    --table-name "${table_name}" \
    --attribute-definitions "AttributeName=${key_name},AttributeType=S" \
    --key-schema "AttributeName=${key_name},KeyType=HASH" \
    --billing-mode PAY_PER_REQUEST >/dev/null
}

delete_existing_api() {
  local api_id
  api_id="$(
    aws_local apigatewayv2 get-apis \
      --query "Items[?Name=='${WEBSOCKET_API_NAME}'].ApiId | [0]" \
      --output text
  )"

  if [[ "${api_id}" != "None" && -n "${api_id}" ]]; then
    aws_local apigatewayv2 delete-api --api-id "${api_id}" >/dev/null
  fi
}

package_backend() {
  mkdir -p "${BUILD_DIR}"

  run_yarn workspace backend build >/dev/null

  cp "${ROOT_DIR}/packages/backend/dist/handleWebsocketEvents.js" \
    "${BUILD_DIR}/handleWebsocketEvents.js"
  cp "${ROOT_DIR}/packages/backend/dist/preventClientTimeout.js" \
    "${BUILD_DIR}/preventClientTimeout.js"

  (
    cd "${BUILD_DIR}"
    rm -f handleWebsocketEvents.zip preventClientTimeout.zip
    zip -q handleWebsocketEvents.zip handleWebsocketEvents.js
    zip -q preventClientTimeout.zip preventClientTimeout.js
  )
}

upsert_lambda() {
  local function_name="$1"
  local handler_name="$2"
  local zip_path="$3"
  local api_management_endpoint="$4"

  if aws_local lambda get-function --function-name "${function_name}" >/dev/null 2>&1; then
    aws_local lambda update-function-code \
      --function-name "${function_name}" \
      --zip-file "fileb://${zip_path}" >/dev/null
  else
    aws_local lambda create-function \
      --function-name "${function_name}" \
      --runtime nodejs24.x \
      --handler "${handler_name}" \
      --memory-size 1024 \
      --timeout 30 \
      --role arn:aws:iam::000000000000:role/lambda-role \
      --zip-file "fileb://${zip_path}" >/dev/null
  fi

  aws_local lambda update-function-configuration \
    --function-name "${function_name}" \
    --environment "Variables={AWS_NODEJS_CONNECTION_REUSE_ENABLED=1,PARTICIPANTS_TABLENAME=${PARTICIPANTS_TABLE_NAME},ROOMS_TABLENAME=${ROOMS_TABLE_NAME},API_GW_DOMAINNAME=${api_management_endpoint},DYNAMODB_ENDPOINT=${MINISTACK_INTERNAL_ENDPOINT}}" >/dev/null
}

create_websocket_api() {
  delete_existing_api

  local api_id
  api_id="$(
    aws_local apigatewayv2 create-api \
      --name "${WEBSOCKET_API_NAME}" \
      --protocol-type WEBSOCKET \
      --route-selection-expression '$request.body.action' \
      --query 'ApiId' \
      --output text
  )"

  aws_local apigatewayv2 create-stage \
    --api-id "${api_id}" \
    --stage-name 'prod' \
    --auto-deploy >/dev/null

  echo "${api_id}"
}

create_route() {
  local api_id="$1"
  local route_key="$2"
  local integration_id="$3"

  aws_local apigatewayv2 create-route \
    --api-id "${api_id}" \
    --route-key "${route_key}" \
    --target "integrations/${integration_id}" >/dev/null
}

main() {
  ensure_requirements
  wait_for_ministack
  package_backend
  ensure_table "${PARTICIPANTS_TABLE_NAME}" "connectionId"
  ensure_table "${ROOMS_TABLE_NAME}" "name"

  local api_id
  api_id="$(create_websocket_api)"

  local raw_api_endpoint
  raw_api_endpoint="$(
    aws_local apigatewayv2 get-api --api-id "${api_id}" --query 'ApiEndpoint' --output text
  )"

  local websocket_api_endpoint
  websocket_api_endpoint="${AWS_ENDPOINT_URL/http/ws}/_aws/execute-api/${api_id}/prod"

  local api_management_endpoint
  api_management_endpoint="${MINISTACK_INTERNAL_ENDPOINT}/_aws/execute-api/${api_id}/prod"

  upsert_lambda \
    "${WEBSOCKET_HANDLER_NAME}" \
    "handleWebsocketEvents.handler" \
    "${BUILD_DIR}/handleWebsocketEvents.zip" \
    "${api_management_endpoint}"
  upsert_lambda \
    "${PREVENT_TIMEOUT_HANDLER_NAME}" \
    "preventClientTimeout.handler" \
    "${BUILD_DIR}/preventClientTimeout.zip" \
    "${api_management_endpoint}"

  local websocket_handler_arn
  websocket_handler_arn="$(
    aws_local lambda get-function \
      --function-name "${WEBSOCKET_HANDLER_NAME}" \
      --query 'Configuration.FunctionArn' \
      --output text
  )"

  local integration_id
  integration_id="$(
    aws_local apigatewayv2 create-integration \
      --api-id "${api_id}" \
      --integration-type AWS_PROXY \
      --integration-method POST \
      --integration-uri "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${websocket_handler_arn}/invocations" \
      --query 'IntegrationId' \
      --output text
  )"

  create_route "${api_id}" '$connect' "${integration_id}"
  create_route "${api_id}" '$disconnect' "${integration_id}"
  create_route "${api_id}" '$default' "${integration_id}"

  mkdir -p "${LOCAL_DIR}"
  cat >"${METADATA_FILE}" <<EOF
{
  "emulator": "ministack",
  "apiId": "${api_id}",
  "rawApiEndpoint": "${raw_api_endpoint}",
  "websocketApiEndpoint": "${websocket_api_endpoint}",
  "apiManagementEndpoint": "${api_management_endpoint}",
  "dynamoDbEndpoint": "${MINISTACK_INTERNAL_ENDPOINT}",
  "participantsTableName": "${PARTICIPANTS_TABLE_NAME}",
  "roomsTableName": "${ROOMS_TABLE_NAME}"
}
EOF

  cat >"${FRONTEND_ENV_FILE}" <<EOF
VITE_API_URL=${websocket_api_endpoint}
EOF

  echo "MiniStack backend bootstrapped."
  echo "WebSocket endpoint: ${websocket_api_endpoint}"
  echo "Frontend override written to: ${FRONTEND_ENV_FILE}"
}

main "$@"
