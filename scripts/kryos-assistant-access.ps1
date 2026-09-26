param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('create', 'hash', 'send')]
  [string] $Action,
  [string] $RequestFile
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$privateDir = Join-Path $projectRoot '.private'
$vaultFile = Join-Path $privateDir 'assistant-token.dpapi'

if ($Action -eq 'create') {
  if (Test-Path -LiteralPath $vaultFile) { throw 'Assistant access already exists locally. Revoke it before replacing it.' }
  New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $token = 'kryos_' + [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
  $sha = [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($token))
  $hash = [Convert]::ToHexString($sha).ToLowerInvariant()
  $secure = ConvertTo-SecureString $token -AsPlainText -Force
  $sealed = ConvertFrom-SecureString $secure
  [System.IO.File]::WriteAllText($vaultFile, $sealed)
  Write-Output $hash
  exit 0
}

if (-not (Test-Path -LiteralPath $vaultFile)) { throw 'No encrypted assistant access found.' }
$secure = ConvertTo-SecureString ([System.IO.File]::ReadAllText($vaultFile))
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $env:KRYOS_ASSISTANT_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  if ($Action -eq 'hash') {
    $digest = [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($env:KRYOS_ASSISTANT_TOKEN))
    Write-Output ([Convert]::ToHexString($digest).ToLowerInvariant())
    exit 0
  }
  if (-not $RequestFile -or -not (Test-Path -LiteralPath $RequestFile)) { throw 'Provide an existing JSON request file.' }
  Get-Content -LiteralPath $RequestFile -Raw | node (Join-Path $PSScriptRoot 'kryos-ingest.mjs')
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:KRYOS_ASSISTANT_TOKEN -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}
