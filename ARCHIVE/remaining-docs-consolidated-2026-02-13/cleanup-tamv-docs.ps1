# TAMV Documentation Cleanup Script
# Consolidates all TAMV-*.md files into TAMV-MASTER-DOCUMENTATION.md
# and moves duplicates to ARCHIVE folder

Write-Host "TAMV Documentation Cleanup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Create ARCHIVE folder if it doesn't exist
$archiveFolder = "ARCHIVE/tamv-docs-consolidated-2026-02-02"
if (-not (Test-Path $archiveFolder)) {
    New-Item -ItemType Directory -Path $archiveFolder -Force | Out-Null
    Write-Host "Created archive folder: $archiveFolder" -ForegroundColor Green
}

# List of TAMV files to archive (all except MASTER and DEPLOYMENT-PREREQUISITES)
$filesToArchive = @(
    "TAMV-SISTEMA-INTEGRADO-COMPLETO.md",
    "TAMV-PROPUESTA-DEFINITIVA-SUPERIOR.md",
    "TAMV-ONLINE-DESCRIPCION-COMPLETA-OFICIAL.md",
    "TAMV-DREAMWORLD-V1-IMPLEMENTACION-COMPLETA.md",
    "TAMV-DESCRIPCION-COMPLETA-ACTUALIZADA.md",
    "TAMV-DEBUG-REPORT-CGIFTS.md",
    "TAMV-EXECUTIVE-BRIEF.md",
    "TAMV-SOLUCION-LOGS-PERSISTENTES.md",
    "TAMV-OFFICIAL-SYSTEM-DESCRIPTION.md"
)

Write-Host "Files to archive:" -ForegroundColor Yellow
$filesToArchive | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
Write-Host ""

# Move files to archive
$movedCount = 0
$notFoundCount = 0

foreach ($file in $filesToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $archiveFolder -Force
        Write-Host "[MOVED] $file" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "[NOT FOUND] $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files moved: $movedCount" -ForegroundColor Green
Write-Host "  Files not found: $notFoundCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Active documentation files:" -ForegroundColor Cyan
Write-Host "  - TAMV-MASTER-DOCUMENTATION.md (MAIN)" -ForegroundColor Green
Write-Host "  - TAMV-DEPLOYMENT-PREREQUISITES.md (DEPLOYMENT)" -ForegroundColor Green
Write-Host ""
Write-Host "Archived files location:" -ForegroundColor Cyan
Write-Host "  $archiveFolder" -ForegroundColor White
Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
