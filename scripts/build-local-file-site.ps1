param(
  [switch]$SkipBundleInstall
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

$rubyBin = "C:\Ruby32-x64\bin"
if (Test-Path -LiteralPath $rubyBin) {
  $env:Path = "$rubyBin;$env:Path"
}

if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
  throw "Bundler not found. Install Ruby with DevKit, then reopen PowerShell."
}

if (-not $SkipBundleInstall) {
  & bundle check
  if ($LASTEXITCODE -ne 0) {
    & bundle install
    if ($LASTEXITCODE -ne 0) {
      throw "bundle install failed."
    }
  }
}

& bundle exec jekyll build --config "_config.yml,_config_docker.yml"
if ($LASTEXITCODE -ne 0) {
  throw "jekyll build failed."
}

$siteRoot = (Resolve-Path "_site").Path.TrimEnd("\")
$siteRootWithSep = $siteRoot + "\"

function Get-RelativePrefix {
  param(
    [string]$SiteRoot,
    [string]$DirectoryPath
  )

  $dir = $DirectoryPath.TrimEnd("\")
  if ($dir -eq $SiteRoot) {
    return "."
  }

  $relativeDir = $dir.Substring(($SiteRoot + "\").Length)
  $depth = ($relativeDir -split "[\\/]" | Where-Object { $_ -ne "" }).Count
  return (@("..") * $depth) -join "/"
}

function Test-HrefDirectoryIndex {
  param(
    [System.IO.FileInfo]$File,
    [string]$Href
  )

  if (-not $Href.EndsWith("/")) {
    return $false
  }

  if ($Href.Contains("?") -or $Href.Contains("#")) {
    return $false
  }

  if (-not ($Href -match "^(?:\./|\.\./)")) {
    return $false
  }

  $pathPart = $Href.TrimEnd("/") -replace "/", "\"
  $targetDir = [System.IO.Path]::GetFullPath((Join-Path $File.Directory.FullName $pathPart))

  $insideSite =
    ($targetDir -eq $script:siteRoot) -or
    $targetDir.StartsWith($script:siteRootWithSep, [System.StringComparison]::OrdinalIgnoreCase)

  if (-not $insideSite) {
    return $false
  }

  return Test-Path -LiteralPath (Join-Path $targetDir "index.html")
}

$rootRelativePattern = '(\b(?:href|src|content|action|poster|data-url)=["''])/(?!/)'
$hrefPattern = 'href=(["''])([^"'']*)\1'
$changed = 0
$files = Get-ChildItem -LiteralPath $siteRoot -Recurse -File -Include *.html

foreach ($file in $files) {
  $prefix = Get-RelativePrefix -SiteRoot $siteRoot -DirectoryPath $file.Directory.FullName
  $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

  $localized = [regex]::Replace(
    $content,
    $rootRelativePattern,
    { param($match) $match.Groups[1].Value + $prefix + "/" }
  )

  $localized = [regex]::Replace(
    $localized,
    $hrefPattern,
    {
      param($match)
      $quote = $match.Groups[1].Value
      $href = $match.Groups[2].Value
      if (Test-HrefDirectoryIndex -File $file -Href $href) {
        return "href=$quote$($href)index.html$quote"
      }
      return $match.Value
    }
  )

  if ($localized -ne $content) {
    Set-Content -LiteralPath $file.FullName -Value $localized -Encoding UTF8 -NoNewline
    $changed++
  }
}

Write-Output "Built local file site: $siteRoot\index.html"
Write-Output "Localized HTML files changed: $changed / $($files.Count)"
