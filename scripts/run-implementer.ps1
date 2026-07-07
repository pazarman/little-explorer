# Little Explorer — Local Implementer Agent
# Runs every Thursday. Resumes automatically if a previous session was interrupted.

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$BacklogFile = Join-Path $ProjectRoot "docs\GAME_BACKLOG.md"
$LogFile     = Join-Path $ProjectRoot "scripts\implementer.log"
$PromptFile  = Join-Path $ProjectRoot "scripts\implementer-prompt.md"

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding utf8
}

Log "Implementer started"

# --- Check backlog state ---
$backlog = Get-Content $BacklogFile -Raw -Encoding utf8

$hasInProgress = $backlog -match '\[IN_PROGRESS\]'
$hasReady      = $backlog -match '\[READY\]'

if (-not $hasInProgress -and -not $hasReady) {
    Log "No READY or IN_PROGRESS items in backlog. Nothing to implement."
    exit 0
}

# --- Run or resume ---
Set-Location $ProjectRoot

if ($hasInProgress) {
    Log "Found IN_PROGRESS item — resuming previous session with --continue"
    $resumeMsg = "Resume the interrupted implementation. Check docs/GAME_BACKLOG.md for the [IN_PROGRESS] item and continue from where you left off. Follow the implementer prompt in scripts/implementer-prompt.md for the remaining steps."
    claude --continue -p $resumeMsg 2>&1 | Tee-Object -Append -FilePath $LogFile
} else {
    Log "Found READY item — starting fresh implementation"
    $prompt = Get-Content $PromptFile -Raw -Encoding utf8
    claude -p $prompt 2>&1 | Tee-Object -Append -FilePath $LogFile
}

$exitCode = $LASTEXITCODE
Log "Implementer finished (exit $exitCode)"
exit $exitCode
