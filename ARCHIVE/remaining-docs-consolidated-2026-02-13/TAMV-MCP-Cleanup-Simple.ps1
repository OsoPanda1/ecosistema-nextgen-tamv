# TAMV MCP Cleanup Script - Simple Version
Write-Host "TAMV MCP Cleanup Script - Starting..." -ForegroundColor Green

# Step 1: Kill problematic MCP processes
Write-Host "Terminating MCP processes..." -ForegroundColor Yellow

$mcpProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*uvx*" -or 
    $_.ProcessName -like "*mcp*" -or
    $_.ProcessName -like "*stripe*" -or
    $_.ProcessName -like "*aws*"
} -ErrorAction SilentlyContinue

if ($mcpProcesses) {
    Write-Host "Found $($mcpProcesses.Count) MCP processes" -ForegroundColor Cyan
    $mcpProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Terminated MCP processes" -ForegroundColor Green
} else {
    Write-Host "No MCP processes found" -ForegroundColor Green
}

# Step 2: Clean temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow

$tempPaths = @(
    "$env:TEMP\*mcp*",
    "$env:TEMP\*uvx*",
    "$env:LOCALAPPDATA\Temp\*mcp*"
)

foreach ($path in $tempPaths) {
    try {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        # Ignore errors
    }
}

Write-Host "Temporary files cleaned" -ForegroundColor Green

# Step 3: Clean uvx cache
Write-Host "Cleaning uvx cache..." -ForegroundColor Yellow

try {
    if (Get-Command uvx -ErrorAction SilentlyContinue) {
        uvx cache clean 2>$null
        Write-Host "uvx cache cleaned" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not clean uvx cache" -ForegroundColor Yellow
}

# Step 4: Apply optimized MCP configuration
Write-Host "Applying optimized MCP configuration..." -ForegroundColor Yellow

$mcpConfigPath = "TAMV-FINAL-PRODUCTION-READY\.kiro\settings\mcp.json"
$mcpFixedPath = "TAMV-FINAL-PRODUCTION-READY\.kiro\settings\mcp-fixed.json"

if (Test-Path $mcpFixedPath) {
    if (Test-Path $mcpConfigPath) {
        $backupPath = "$mcpConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $mcpConfigPath $backupPath -ErrorAction SilentlyContinue
        Write-Host "Backup created: $backupPath" -ForegroundColor Cyan
    }
    
    Copy-Item $mcpFixedPath $mcpConfigPath -Force -ErrorAction SilentlyContinue
    Write-Host "Optimized MCP configuration applied" -ForegroundColor Green
} else {
    Write-Host "Optimized MCP configuration not found" -ForegroundColor Yellow
}

# Step 5: Verify final state
Write-Host "Verifying final state..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$remainingProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*uvx*" -or 
    $_.ProcessName -like "*mcp*"
} -ErrorAction SilentlyContinue

if ($remainingProcesses) {
    Write-Host "Warning: $($remainingProcesses.Count) MCP processes still active" -ForegroundColor Yellow
} else {
    Write-Host "No problematic MCP processes active" -ForegroundColor Green
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TAMV MCP Cleanup completed successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Restart Kiro to apply new MCP configuration" -ForegroundColor White
Write-Host "2. Verify that Kiro Powers work correctly" -ForegroundColor White
Write-Host "3. Monitor logs to confirm the issue is resolved" -ForegroundColor White