# Publishing the Website

Run all paths below from the `WebsiteSource` repo root unless a step says to work in another repo.

Build with `yarn build`, then follow the numbered steps in order.

## 1. WASM Preparation

WASM preparation can only be done on Linux. Unless explicit required, this step is skipped, which means when updating vczh-libraries.github.io repo WASM related files will remain unchanged:

- `<vczh-libraries.github.io repo>/wasm-fct/index.html`
- `<vczh-libraries.github.io repo>/wasm-fct/demo.css`
- `<vczh-libraries.github.io repo>/wasm-fct/demo.js`
- `<vczh-libraries.github.io repo>/wasm-fct/service-worker.js`
- `<vczh-libraries.github.io repo>/wasm-fct/app-size.json`
- `<vczh-libraries.github.io repo>/wasm-fct/app.wasm`
- `<vczh-libraries.github.io repo>/wasm-fct/app.mjs`
- `<vczh-libraries.github.io repo>/wasm-fct/app.worker.js`
- `<vczh-libraries.github.io repo>/wasm-fct/fullControlTestRaw.js`
- `<vczh-libraries.github.io repo>/wasm-fct/gacui.js`
- `<vczh-libraries.github.io repo>/wasm-fct/gacui.js.map`
- `<vczh-libraries.github.io repo>/wasm-fct/http.js`
- `<vczh-libraries.github.io repo>/wasm-fct/http.js.map`
- `<vczh-libraries.github.io repo>/wasm-fct/rvm.js`
- `<vczh-libraries.github.io repo>/wasm-fct/rvm.js.map`
- `<vczh-libraries.github.io repo>/wasm-fct/wasm.js`
- `<vczh-libraries.github.io repo>/wasm-fct/wasm.js.map`
- `<vczh-libraries.github.io repo>/wasm-fct/wasm-worker.js`
- `<vczh-libraries.github.io repo>/wasm-fct/wasm-worker.js.map`

Preserve the entire folder when skipping this step, including any additional files it contains. Do not create a partial demo if the folder is absent. Routine binary changes do not justify preparing or replacing it.

Only when explicitly required, run `bash packages/website/scripts/Copy-WASM.sh` after the website build, using the configured Linux environment. Sibling `GacJS` and `GacUI` repositories are required. The script builds GacJS and WasmFCT and prepares `<WebsiteSource repo>/packages/website/lib/dist/wasm-fct`. Do not rebuild the website afterward: its build clears `lib`, including the copied runtime files.

Copy the prepared demo into the sibling publishing repository as part of this step. Step 2 always excludes this folder from its general copy, preserving either this prepared version or the existing deployment.

```bash
python3 - <<'PY'
from pathlib import Path
import shutil

repo_root = Path.cwd()
pages_repo = (repo_root / '../vczh-libraries.github.io').resolve()
source = repo_root / 'packages/website/lib/dist/wasm-fct'
target = pages_repo / 'wasm-fct'

for required in (pages_repo / '.git', source / 'index.html', source / 'app.wasm',
                 source / 'app.mjs', source / 'app.worker.js', source / 'app-size.json'):
    if not required.exists():
        raise SystemExit(f'Missing required path: {required}')

if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)
PY
```

After Step 2 publishes this new or replaced demo, follow Web → Start WASM Now! and verify the download progress, rendered controls, input and Exit/Force Exit in a fresh browser context. The demo's scoped service worker supplies the isolation headers on static hosting; its initial automatic reload is expected. This verification is also skipped when preparation is skipped.

## 2. Publish Website

This step requires the `vczh-libraries.github.io` repo to exist as a sibling folder.

Run these commands one after another because the download commands both bind port 8080:

- Run `npm run download` in `website` makes `packages/website/lib/website`
- Run `npm run download` in `website-doc2` makes `packages/website-doc2/lib/website`
- Run `npm run markdown` in `website-doc2` makes `packages/website-doc2/lib/markdown`

These commands download the whole website to the dist, making it a static website that can be hosted by github io.
They also convert the latest GacUI document to markdown files so that they can be shipped in source repos.
Publishing output should be stable. If a no-op website publish shows only `\n` to `\r\n` changes inside generated HTML JSON strings in `../vczh-libraries.github.io`, do not commit it; restore those files or regenerate from a checkout with matching line-ending settings.

Run this PowerShell from the `WebsiteSource` repo root to prepare the website repo:

```powershell
$repoRoot = (Resolve-Path .).Path
$pagesRepo = (Resolve-Path ..\vczh-libraries.github.io).Path

$mainSource = Join-Path $repoRoot "packages\website\lib\website"
$docSource = Join-Path $repoRoot "packages\website-doc2\lib\website\doc\current"
$docTarget = [System.IO.Path]::GetFullPath((Join-Path $pagesRepo "doc\current"))
$pagesRepoRoot = [System.IO.Path]::GetFullPath($pagesRepo).TrimEnd("\")

if (-not $docTarget.StartsWith($pagesRepoRoot + "\", [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Unexpected doc target: $docTarget"
}

foreach ($path in @($mainSource, $docSource, $pagesRepo)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required path: $path"
    }
}

foreach ($item in Get-ChildItem -LiteralPath $mainSource) {
    if ($item.Name -eq "wasm-fct") {
        continue
    }
    Copy-Item -LiteralPath $item.FullName -Destination $pagesRepo -Recurse -Force
}

if (Test-Path -LiteralPath $docTarget) {
    Remove-Item -LiteralPath $docTarget -Recurse -Force
}

New-Item -ItemType Directory -Path $docTarget | Out-Null
Copy-Item -Path (Join-Path $docSource "*") -Destination $docTarget -Recurse -Force
```

On Linux/macOS, use this equivalent command instead:

```bash
python3 - <<'PY'
from pathlib import Path
import shutil

repo_root = Path.cwd()
pages_repo = (repo_root / '../vczh-libraries.github.io').resolve()
main_source = repo_root / 'packages/website/lib/website'
doc_source = repo_root / 'packages/website-doc2/lib/website/doc/current'

for required in (pages_repo / '.git', main_source, doc_source):
    if not required.exists():
        raise SystemExit(f'Missing required path: {required}')

for source in main_source.iterdir():
    target = pages_repo / source.name
    if source.name == 'wasm-fct':
        continue
    if source.is_dir():
        shutil.copytree(source, target, dirs_exist_ok=True)
    else:
        shutil.copy2(source, target)

doc_target = pages_repo / 'doc/current'
if doc_target.exists():
    shutil.rmtree(doc_target)
shutil.copytree(doc_source, doc_target)
PY
```

Commit and push all local changes in `../vczh-libraries.github.io` to its `master` branch.
Wait for the CI to run, the repo URL is `https://github.com/vczh-libraries/vczh-libraries.github.io`.
Open `https://vczh-libraries.github.io/` and make sure it has the latest content.

## 3. Publish Markdown Documents

This step requires these repos to exist as sibling folders:
- Tools
- Vlpp
- VlppOS
- VlppRegex
- VlppReflection
- VlppParser2
- Workflow
- GacUI
- Release

### Step 1.

Follow the prompt in `<Tools repo>/Jobs/job.Windows.copilotInitAll.prompt.md` first.

### Step 2.

Delete `../Tools/Copilot/KnowledgeBase/manual` completely.
Copy all files from `packages/website-doc2/lib/markdown/manual` to `../Tools/Copilot/KnowledgeBase/manual`.
Replace the whole `# Copy of Online Manual` section in `../Tools/Copilot/KnowledgeBase/Index.md` with `packages/website-doc2/lib/markdown/index.md` (this file has the title too). This section is the final section of the file, so replace from that heading to the end of the file.

### Step 3.

Follow the prompt in `<Tools repo>/Jobs/job.Windows.copilotInitAll.prompt.md` again but skip learning.

### Step 4.

Commit and push all changes in required repos to their master branches.
