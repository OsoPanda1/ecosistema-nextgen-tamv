#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "rabbitmq-server" ] && [ "$(id -u)" = "0" ]; then
  if command -v gosu >/dev/null 2>&1; then
    exec gosu rabbitmq "$@"
  fi
  if command -v su-exec >/dev/null 2>&1; then
    exec su-exec rabbitmq "$@"
  fi
fi

exec "$@"
