# README Files Cleanup Script
# Consolidates duplicate README files and archives them

Write-Host "README Files Cleanup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Create ARCHIVE folder if it doesn't exist
$archiveFolder = "ARCHIVE/readme-files-consolidated-2026-02-02"
if (-not (Test-Path $archiveFolder)) {
    New-Item -ItemType Directory -Path $archiveFolder -Force | Out-Null
    Write-Host "Created archive folder: $archiveFolder" -ForegroundColor Green
}

# List of README files to archive (keeping only main README.md)
$filesToArchive = @(
    @{Source = "README-GITHUB.md"; Dest = "README-GITHUB.md"},
    @{Source = "TAMV-COMPLETE-PROJECT/README.md"; Dest = "TAMV-COMPLETE-PROJECT-README.md"},
    @{Source = "TAMV-COMPLETE-PROJECT/README-DEPLOYMENT.md"; Dest = "TAMV-COMPLETE-PROJECT-README-DEPLOYMENT.md"},
    @{Source = "TAMV-FINAL-PRODUCTION-READY/README.md"; Dest = "TAMV-FINAL-PRODUCTION-READY-README.md"},
    @{Source = "tamv-enhanced-complete-bundle/README.md"; Dest = "tamv-enhanced-complete-bundle-README.md"},
    @{Source = "TAMV-ENHANCED-ARCHITECTURE/README.md"; Dest = "TAMV-ENHANCED-ARCHITECTURE-README.md"}
)

Write-Host "Files to archive:" -ForegroundColor Yellow
$filesToArchive | ForEach-Object { Write-Host "  - $($_.Source)" -ForegroundColor White }
Write-Host ""

# Move files to archive
$movedCount = 0
$notFoundCount = 0

foreach ($fileInfo in $filesToArchive) {
    $sourcePath = $fileInfo.Source
    $destPath = Join-Path $archiveFolder $fileInfo.Dest
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "[ARCHIVED] $sourcePath -> $($fileInfo.Dest)" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "[NOT FOUND] $sourcePath" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files archived: $movedCount" -ForegroundColor Green
Write-Host "  Files not found: $notFoundCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Active README files:" -ForegroundColor Cyan
Write-Host "  - README.md (MAIN - Root)" -ForegroundColor Green
Write-Host "  - TAMV-MASTER-DOCUMENTATION.md (Complete docs)" -ForegroundColor Green
Write-Host "  - TAMV-DEPLOYMENT-PREREQUISITES.md (Deployment)" -ForegroundColor Green
Write-Host ""
Write-Host "Project-specific READMEs (kept):" -ForegroundColor Cyan
Write-Host "  - saas-example/README.md" -ForegroundColor White
Write-Host "  - example-lambda-api/README.md" -ForegroundColor White
Write-Host "  - simulations/README.md" -ForegroundColor White
Write-Host ""
Write-Host "Archived files location:" -ForegroundColor Cyan
Write-Host "  $archiveFolder" -ForegroundColor White
Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review README.md (main entry point)" -ForegroundColor White
Write-Host "  2. All documentation is in TAMV-MASTER-DOCUMENTATION.md" -ForegroundColor White
Write-Host "  3. Deployment info is in TAMV-DEPLOYMENT-PREREQUISITES.md" -ForegroundColor White
