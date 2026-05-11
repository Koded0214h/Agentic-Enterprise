#!/usr/bin/env bash
# Create backend/.venv and install deps. PyTorch is installed separately so you can
# choose CPU wheels (small, default) vs CUDA wheels from PyPI (large).
set -euo pipefail

BACKEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="${BACKEND_ROOT}/.venv"
TORCH="${TORCH_FLAVOR:-cpu}"

python3 -m venv "${VENV}"
PIP=( "${VENV}/bin/python" -m pip )
"${PIP[@]}" install --upgrade pip

case "${TORCH}" in
  cpu)
    "${PIP[@]}" install torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu
    ;;
  cuda)
    "${PIP[@]}" install torch==2.6.0
    ;;
  *)
    echo "TORCH_FLAVOR must be cpu or cuda (got ${TORCH})" >&2
    exit 1
    ;;
esac

"${PIP[@]}" install -r "${BACKEND_ROOT}/requirements.txt"

echo "Backend venv ready: ${VENV}"
echo "Activate: source ${VENV}/bin/activate"
