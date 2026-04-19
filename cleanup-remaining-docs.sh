#!/bin/bash

# TAMV Remaining Documentation Cleanup Script
# Archives redundant documentation files not covered by existing scripts

echo "=================================="
echo "TAMV Remaining Documentation Cleanup"
echo "=================================="
echo ""

# Create archive folder if it doesn't exist
ARCHIVE_FOLDER="ARCHIVE/remaining-docs-consolidated-2026-02-13"
mkdir -p "$ARCHIVE_FOLDER"

# Files to archive (redundant documentation)
FILES_TO_ARCHIVE=(
    "CGIFTS-TAMV-IMPLEMENTATION-SUMMARY.md"
    "CLEANUP-COMPLETE-REPORT.md"
    "CONSOLIDATION-SUMMARY.md"
    "CONTRIBUTING.md"
    "EDWIN-CASTILLO-TREJO-POSICIONAMIENTO-HISTORICO.md"
    "IMPLEMENTACION-PLAN-COMPLETO.md"
    "IMPLEMENTATION-PROGRESS-REPORT.md"
    "INSTRUCCIONES-DESPLIEGUE-RAPIDO.md"
    "INSTRUCCIONES-FINALES.md"
    "INSTRUCCIONES-GITHUB.md"
    "LEEME-PRIMERO.md"
    "LOGROS-HOY.md"
    "PLAN-EJECUCION-INMEDIATO.md"
    "PLAN-EJECUCION-TAMV-FUNCIONAL.md"
    "README-GITHUB.md"
    "REPORTE-AVANCE-TECNICO-COMPLETO.md"
    "RESUMEN-EJECUTIVO-FINAL.md"
    "RESUMEN-FINAL-SESION.md"
    "ROADMAP-7-DIAS.md"
    "SAAS-BUILDER-SETUP-COMPLETE.md"
    "TAMV-BACKEND-COMPLETE.md"
    "TAMV-COMPLETE-IMPLEMENTATION-PLAN.md"
    "TAMV-DREAMWORLD-V1-IMPLEMENTACION-COMPLETA.md"
    "TAMV-FRONTEND-BACKEND-COMPLETO.md"
    "TAMV-MCP-Cleanup-Auto.ps1"
    "TAMV-MCP-Cleanup.ps1"
    "TAMV-MCP-Cleanup-Simple.ps1"
    "TAMV-UNIFICATION-STATUS.md"
    "TAMV-VISUAL-EXPERIENCE-SPEC.md"
    "add-uv-to-path-permanent.ps1"
    "cleanup-readme-files.ps1"
    "cleanup-tamv-docs.ps1"
    "commit-changes.ps1"
    "crear-repo-tamv.ps1"
    "install-saas-builder-prerequisites.ps1"
    "setup-github-repo.ps1"
    "setup-tamv-github.ps1"
)

# Files to KEEP in root (essential documentation)
FILES_TO_KEEP=(
    "README.md"
    "TAMV-MASTER-DOCUMENTATION.md"
    "TAMV-DEPLOYMENT-PREREQUISITES.md"
    "SECURITY.md"
    "CONTRIBUTING.md"  # Keep this one as it's standard
)

echo "Files to archive:"
for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done
echo ""

# Move files to archive
MOVED_COUNT=0
NOT_FOUND_COUNT=0

for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_FOLDER/"
        echo -e "\033[32m[ARCHIVED]\033[0m $file"
        ((MOVED_COUNT++))
    else
        echo -e "\033[33m[NOT FOUND]\033[0m $file"
        ((NOT_FOUND_COUNT++))
    fi
done

echo ""
echo "Summary:"
echo "  Files archived: $MOVED_COUNT"
echo "  Files not found: $NOT_FOUND_COUNT"
echo ""

echo "Active documentation files:"
for file in "${FILES_TO_KEEP[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  - \033[32m$file\033[0m"
    fi
done
echo ""

echo "Archived files location:"
echo "  $ARCHIVE_FOLDER"
echo ""

echo "Cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Review README.md (main entry point)"
echo "  2. All documentation is in TAMV-MASTER-DOCUMENTATION.md"
echo "  3. Deployment info is in TAMV-DEPLOYMENT-PREREQUISITES.md"
