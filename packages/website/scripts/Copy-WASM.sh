#!/bin/bash
set -euo pipefail

WEBSITE_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
GACJS_ROOT="${WEBSITE_ROOT}/../GacJS"
GACUI_ROOT="${WEBSITE_ROOT}/../GacUI"
DIST_ROOT="${WEBSITE_ROOT}/packages/website/lib/dist/wasm-fct"
WASM_ROOT="${GACUI_ROOT}/Test/Linux/WasmFCT"
WASM_FILES=(app.wasm app.mjs app.worker.js)
BROWSER_FILES=(gacui.js wasm.js http.js rvm.js wasm-worker.js)

for REPO_ROOT in "${GACJS_ROOT}" "${GACUI_ROOT}"; do
    if [ ! -d "${REPO_ROOT}" ]; then
        echo "Missing required repository: ${REPO_ROOT}" >&2
        exit 1
    fi
done
if [ ! -f "${DIST_ROOT}/index.html" ]; then
    echo "Build WebsiteSource before running Copy-WASM.sh." >&2
    exit 1
fi

(cd "${GACJS_ROOT}/Gaclib" && yarn build)

WASM_BUILD=-bw
for WASM_FILE in "${WASM_FILES[@]}"; do
    if [ ! -s "${WASM_ROOT}/Bin/${WASM_FILE}" ]; then
        WASM_BUILD=-fbw
    fi
done
# The supported wrapper prepares vmake, then calls vbuild with the selected flag.
(cd "${WASM_ROOT}" && "${GACUI_ROOT}/.github/Ubuntu/build.sh" "${WASM_BUILD}")

for BROWSER_FILE in "${BROWSER_FILES[@]}"; do
    cp "${GACJS_ROOT}/Gaclib/website/entry/lib/dist/${BROWSER_FILE}" "${DIST_ROOT}/"
    if [ -f "${GACJS_ROOT}/Gaclib/website/entry/lib/dist/${BROWSER_FILE}.map" ]; then
        cp "${GACJS_ROOT}/Gaclib/website/entry/lib/dist/${BROWSER_FILE}.map" "${DIST_ROOT}/"
    fi
done
for WASM_FILE in "${WASM_FILES[@]}"; do
    cp "${WASM_ROOT}/Bin/${WASM_FILE}" "${DIST_ROOT}/"
done
# The decoded size keeps download progress accurate even on compressed HTTP responses.
WASM_BYTES="$(wc -c < "${WASM_ROOT}/Bin/app.wasm" | tr -d '[:space:]')"
printf '{"bytes":%s}\n' "${WASM_BYTES}" > "${DIST_ROOT}/app-size.json"
echo "WasmFCT is ready in ${DIST_ROOT}"
