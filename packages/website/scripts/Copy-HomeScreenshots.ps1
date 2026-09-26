<#
.SYNOPSIS
Copies upstream platform screenshots into the homepage's private assets.
.DESCRIPTION
Run from any directory. The default repository root is the folder containing
WebsiteSource, GacUI, wGac, iGac, and GacJS. Existing destination files are
replaced; source screenshots and unrelated homepage assets are never changed.
Copied screenshots are grouped in homeres by their originating repository.
Use -MetadataPath to also export the platform data used by assets/index.json.
.EXAMPLE
./packages/website/scripts/Copy-HomeScreenshots.ps1
.EXAMPLE
./packages/website/scripts/Copy-HomeScreenshots.ps1 -MetadataPath "$env:TEMP/home-platforms.json"
#>
[CmdletBinding()]
param(
    [string]$RepositoryRoot,
    [string]$MetadataPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $RepositoryRoot) {
    $RepositoryRoot = Join-Path $PSScriptRoot '../../../..'
}
$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$destination = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets/homeres'))
$copies = [System.Collections.Generic.List[object]]::new()
$platforms = [System.Collections.Generic.List[object]]::new()

function Get-ImageInfo {
    param([string]$Source)

    $bytes = [System.IO.File]::ReadAllBytes($Source)
    if ($bytes.Length -ge 24 -and [System.BitConverter]::ToString($bytes, 0, 8) -eq '89-50-4E-47-0D-0A-1A-0A') {
        # PNG dimensions are stored in the IHDR header, in network byte order.
        return @{
            extension = '.png'
            width = [int64]$bytes[16] * 16777216 + [int64]$bytes[17] * 65536 + [int64]$bytes[18] * 256 + $bytes[19]
            height = [int64]$bytes[20] * 16777216 + [int64]$bytes[21] * 65536 + [int64]$bytes[22] * 256 + $bytes[23]
        }
    }
    if ($bytes.Length -ge 4 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8) {
        # Some upstream .png files contain JPEG data. Keep the original bytes,
        # but use the actual image format for the copied file's extension.
        $offset = 2
        $frameMarkers = @(0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF)
        while ($offset + 1 -lt $bytes.Length) {
            if ($bytes[$offset] -ne 0xFF) { break }
            while ($offset -lt $bytes.Length -and $bytes[$offset] -eq 0xFF) { $offset++ }
            if ($offset -ge $bytes.Length) { break }
            $marker = $bytes[$offset++]
            if ($marker -eq 0xDA -or $marker -eq 0xD9 -or $offset + 1 -ge $bytes.Length) { break }
            $length = [int]$bytes[$offset] * 256 + $bytes[$offset + 1]
            if ($length -lt 2 -or $offset + $length -gt $bytes.Length) { break }
            if ($marker -in $frameMarkers -and $length -ge 7) {
                return @{
                    extension = '.jpg'
                    width = [int]$bytes[$offset + 5] * 256 + $bytes[$offset + 6]
                    height = [int]$bytes[$offset + 3] * 256 + $bytes[$offset + 4]
                }
            }
            $offset += $length
        }
    }
    throw "Unsupported or invalid screenshot image: $Source"
}

function Add-Screenshot {
    param(
        [string]$Source,
        [string]$Repository,
        [string]$Filename,
        [string]$Id,
        [string]$Label,
        [string]$Alt
    )

    if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
        throw "Missing upstream screenshot: $Source"
    }

    $imageInfo = Get-ImageInfo -Source $Source
    $Filename = [System.IO.Path]::ChangeExtension($Filename, $imageInfo.extension)

    $copies.Add(@{ source = $Source; destination = (Join-Path $destination "$Repository/$Filename") })
    return [ordered]@{
        id = $Id
        label = $Label
        src = "/homeres/$Repository/$Filename"
        alt = $Alt
        width = $imageInfo.width
        height = $imageInfo.height
    }
}

$nativePlatforms = @(
    @{ id = 'windows'; label = 'Windows'; repository = 'GacUI'; description = 'Native desktop rendering with DirectX or GDI, and terminal rendering with TUI.' },
    @{ id = 'linux'; label = 'Linux'; repository = 'wGac'; description = 'Native Linux windows through Wayland, and terminal rendering with TUI.' },
    @{ id = 'macos'; label = 'macOS'; repository = 'iGac'; description = 'Native macOS windows through Cocoa, and terminal rendering with TUI.' }
)
$nativeModes = @(
    @{ id = 'gui'; label = 'GUI'; prefix = 'FCT_'; default = 'default'; example = 'FullControlTest' },
    @{ id = 'tui'; label = 'TUI'; prefix = 'TUI_'; default = 'skyblue'; example = 'TuiControlTest' }
)

foreach ($platform in $nativePlatforms) {
    $modes = [System.Collections.Generic.List[object]]::new()
    $sourceDirectory = Join-Path $RepositoryRoot ($platform.repository + '/Screenshots')
    foreach ($mode in $nativeModes) {
        $themes = [System.Collections.Generic.List[object]]::new()
        $sources = @(Get-ChildItem -LiteralPath $sourceDirectory -Filter ($mode.prefix + '*.png') -File | Sort-Object Name)
        if ($sources.Count -eq 0) {
            throw "No $($mode.label) screenshots found in $sourceDirectory"
        }
        foreach ($source in $sources) {
            $name = $source.BaseName.Substring($mode.prefix.Length) -replace '\s*\(default\)', ''
            $themeId = ($name.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
            $themeLabel = if ($themeId -eq 'skyblue') { 'Sky blue (default)' } else { $name }
            $filename = "$($platform.id)-$($mode.id)-$themeId.png"
            $themes.Add((Add-Screenshot -Source $source.FullName -Repository $platform.repository -Filename $filename -Id $themeId -Label $themeLabel -Alt "$($platform.label) $($mode.example) using the $themeLabel color theme."))
        }
        $sortedThemes = @($themes | Sort-Object @{ Expression = { if ($_.id -eq $mode.default) { 0 } else { 1 } } }, @{ Expression = { $_.label } })
        $modes.Add([ordered]@{ id = $mode.id; label = $mode.label; themes = $sortedThemes })
    }
    $platforms.Add([ordered]@{
        id = $platform.id
        label = $platform.label
        description = $platform.description
        modes = @($modes.ToArray())
    })
}

$browserThemes = [System.Collections.Generic.List[object]]::new()
$browserSources = @(
    @{ id = 'windows'; label = 'Windows host'; file = 'RPT_Windows.png'; alt = 'GacJS rendering a remote GacUI application hosted on Windows in a browser.' },
    @{ id = 'linux'; label = 'Linux host'; file = 'RPT_Ubuntu.png'; alt = 'GacJS rendering a remote GacUI application hosted on Ubuntu Linux in a browser.' },
    @{ id = 'macos'; label = 'macOS host'; file = 'RPT_macOS.png'; alt = 'GacJS rendering a remote GacUI application hosted on macOS in a browser.' }
)
foreach ($source in $browserSources) {
    $browserThemes.Add((Add-Screenshot -Source (Join-Path $RepositoryRoot ('GacJS/' + $source.file)) -Repository 'GacJS' -Filename "html5-$($source.id).png" -Id $source.id -Label $source.label -Alt $source.alt))
}
$platforms.Add([ordered]@{
    id = 'html5'
    label = 'HTML5'
    description = 'GacJS renders GacUI applications in the browser through the Remote Protocol, with the application core running on Windows, Linux, or macOS.'
    modes = @([ordered]@{ id = 'gui'; label = 'HTML5'; themes = @($browserThemes.ToArray()) })
})

# Validate the complete input set before replacing any existing assets.
$duplicateTargets = @($copies | Group-Object { $_.destination } | Where-Object Count -gt 1)
if ($duplicateTargets.Count -ne 0) {
    throw "Multiple screenshots normalize to the same destination: $($duplicateTargets[0].Name)"
}
foreach ($directory in @($copies | ForEach-Object { Split-Path -Parent $_.destination } | Sort-Object -Unique)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}
foreach ($copy in $copies) {
    Copy-Item -LiteralPath $copy.source -Destination $copy.destination -Force
}

if ($MetadataPath) {
    $metadata = ConvertTo-Json -InputObject @($platforms.ToArray()) -Depth 10
    $metadataDestination = [System.IO.Path]::GetFullPath($MetadataPath)
    [System.IO.File]::WriteAllText($metadataDestination, $metadata + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Wrote platform metadata to $metadataDestination"
}
Write-Host "Copied $($copies.Count) screenshots to $destination"
