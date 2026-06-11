#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_DIR="${ROOT_DIR}/.local"
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

delete_if_exists() {
  local command=("$@")
  "${command[@]}" >/dev/null 2>&1 || true
}

main() {
  local api_id
  api_id="$(
    aws_local apigatewayv2 get-apis \
      --query "Items[?Name=='${WEBSOCKET_API_NAME}'].ApiId | [0]" \
      --output text 2>/dev/null || echo "None"
  )"

  if [[ "${api_id}" != "None" && -n "${api_id}" ]]; then
    delete_if_exists aws_local apigatewayv2 delete-api --api-id "${api_id}"
  fi

  delete_if_exists aws_local lambda delete-function --function-name "${WEBSOCKET_HANDLER_NAME}"
  delete_if_exists aws_local lambda delete-function --function-name "${PREVENT_TIMEOUT_HANDLER_NAME}"
  delete_if_exists aws_local dynamodb delete-table --table-name "${PARTICIPANTS_TABLE_NAME}"
  delete_if_exists aws_local dynamodb delete-table --table-name "${ROOMS_TABLE_NAME}"

  rm -rf "${LOCAL_DIR}/build"
  rm -f "${LOCAL_DIR}/local-backend.json"
  rm -f "${FRONTEND_ENV_FILE}"

  echo "MiniStack backend resources reset."
}

main "$@"
