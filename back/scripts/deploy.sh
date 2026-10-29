#!/usr/bin/env bash
# O deploy é centralizado na raiz do monorepo.
set -euo pipefail
exec bash "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)/scripts/deploy.sh" "$@"
