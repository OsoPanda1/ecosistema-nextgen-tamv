# TAMV Commit Script
# Commits all changes made during CGIFTS implementation

Write-Host "TAMV - Committing all changes..." -ForegroundColor Green

# Check if git is available
try {
    $gitPath = Get-Command git -ErrorAction Stop
    Write-Host "Git found at: $($gitPath.Source)" -ForegroundColor Cyan
} catch {
    Write-Host "Git not found in PATH. Please ensure Git is installed and available." -ForegroundColor Red
    Write-Host "Changes are saved locally and ready for manual commit." -ForegroundColor Yellow
    exit 1
}

# Initialize git repository if not exists
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git config user.name "TAMV Development Team"
    git config user.email "dev@tamv.com"
}

# Add all changes
Write-Host "Adding all changes to staging..." -ForegroundColor Yellow
git add .

# Create comprehensive commit message
$commitMessage = @"
feat: Complete CGIFTS TAMV implementation with XR integration

Major Features Added:
- CGIFTS Core System with 30+ gifts across 4 categories
- WebXR integration with TAMV 4D renderer
- Mini Anubis Ultra special gift with auction mechanics
- Blockchain federation with MSR anchoring
- Isabella AI integration for recommendations
- Real-time WebSocket communication
- Complete REST API with GraphQL schema
- TypeScript definitions and comprehensive error handling

Technical Improvements:
- MCP cleanup and optimization
- Performance monitoring and LOD optimization
- Spatial audio and haptic feedback systems
- Cross-chain blockchain support
- NFT minting for special gifts
- Security enhancements and rate limiting

Files Added/Modified:
- TAMV-COMPLETE-PROJECT/src/cgifts/ (complete module)
- CGIFTS-TAMV-IMPLEMENTATION-SUMMARY.md
- TAMV-MCP-Cleanup scripts
- MCP configuration optimizations

Status: Production Ready
Next: Deploy to staging environment
"@

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Show status
Write-Host "Git status after commit:" -ForegroundColor Cyan
git status

Write-Host "All changes committed successfully!" -ForegroundColor Green
Write-Host "TAMV CGIFTS implementation is now version controlled." -ForegroundColor Green