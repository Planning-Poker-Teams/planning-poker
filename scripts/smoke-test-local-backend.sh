#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_ENV_FILE="${ROOT_DIR}/packages/frontend/.env.local"
AWS_ENDPOINT_URL="${AWS_ENDPOINT_URL:-http://localhost:4566}"
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

main() {
  curl --fail --silent "${AWS_ENDPOINT_URL}/_ministack/health" >/dev/null
  aws_local dynamodb describe-table --table-name "${PARTICIPANTS_TABLE_NAME}" >/dev/null
  aws_local dynamodb describe-table --table-name "${ROOMS_TABLE_NAME}" >/dev/null
  aws_local lambda get-function --function-name "${WEBSOCKET_HANDLER_NAME}" >/dev/null
  aws_local lambda get-function --function-name "${PREVENT_TIMEOUT_HANDLER_NAME}" >/dev/null

  local api_id
  api_id="$(
    aws_local apigatewayv2 get-apis \
      --query "Items[?Name=='${WEBSOCKET_API_NAME}'].ApiId | [0]" \
      --output text
  )"

  local api_endpoint
  api_endpoint="$(
    aws_local apigatewayv2 get-api --api-id "${api_id}" --query 'ApiEndpoint' --output text
  )"

  if [[ "${api_id}" == "None" || -z "${api_id}" ]]; then
    echo "WebSocket API not found" >&2
    exit 1
  fi

  if [[ "${api_endpoint}" == "None" || -z "${api_endpoint}" ]]; then
    echo "WebSocket API endpoint not found" >&2
    exit 1
  fi

  aws_local apigatewayv2 get-stage --api-id "${api_id}" --stage-name prod >/dev/null

  test -f "${FRONTEND_ENV_FILE}"
  grep -Eq '^VITE_API_URL=ws://localhost:4566/_aws/execute-api/[^/]+/prod$' "${FRONTEND_ENV_FILE}"

  echo "MiniStack backend smoke test passed."
}

main "$@"
