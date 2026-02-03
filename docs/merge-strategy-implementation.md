# Merge Strategy Implementation

## Overview

The merge strategy implementation provides automated consolidation of duplicate folders based on quality scores. It handles file-level merging, conflict resolution, and archiving of deprecated content.

**Requirements:** 1.2, 1.3

## Features

### 1. Quality-Based File Selection

The merge strategy uses quality scores calculated by the duplicate analysis system to determine which version of a file to keep when conflicts occur:

- **Quality Score Components:**
  - Completeness (40%): File count, directory structure, configuration files
  - Recency (30%): Last modified date with time-based decay
  - Code Quality (30%): Test coverage, TypeScript usage, linting configuration

- **Conflict Resolution:**
  - Primary: Select source with highest overall quality score
  - Tiebreaker: If multiple sources have the same score, select most recently modified

### 2. Merge Conflict Handling

All merge conflicts are:
- Automatically resolved based on quality scores
- Logged with detailed information for review
- Documented with resolution reasoning

**Conflict Log Contents:**
- File path
- Resolution strategy
- Winner folder
- Reason for selection
- All source folders with metadata (quality score, last modified, size)

### 3. Archive Directory

Deprecated folders are archived rather than deleted:
- Moved to `.archive/` directory
- Timestamped to prevent naming conflicts
- Preserves original content for recovery if needed

**Archive Format:** `.archive/{folder-name}-{timestamp}`

## Usage

### Prerequisites

1. Run duplicate analysis:
   ```bash
   npm run analyze
   ```

2. Review the analysis report:
   ```bash
   cat duplicate-analysis-report.json
   ```

### Dry Run (Recommended First)

Preview what the merge would do without making changes:

```bash
npm run merge
```

This will:
- Show which files would be merged
- Display conflict resolutions
- Indicate which folders would be archived
- Generate a preview of the merge result

### Execute Merge

After reviewing the dry run output, execute the actual merge:

```bash
npm run merge -- --execute
```

**Warning:** This will make actual changes to your file system!

### Help

View usage information:

```bash
npm run merge -- --help
```

## Output Files

### 1. merge-conflicts.log

Detailed log of all merge conflicts and their resolutions:

```
═══════════════════════════════════════════════════════════════
                    MERGE CONFLICTS LOG
═══════════════════════════════════════════════════════════════
Generated: 2024-01-15T10:30:00.000Z
Total Conflicts: 42

File: src/api/user-management.ts
Resolution: quality_score
Winner: TAMV-ENHANCED-ARCHITECTURE
Reason: Selected source with highest quality score: 85
Sources:
  - TAMV-COMPLETE-PROJECT
    Quality Score: 70
    Last Modified: 2024-01-01T00:00:00.000Z
    Size: 5432 bytes
  - TAMV-ENHANCED-ARCHITECTURE
    Quality Score: 85
    Last Modified: 2024-01-10T00:00:00.000Z
    Size: 6789 bytes
...
```

### 2. merge-result.json

Machine-readable merge result for automation:

```json
{
  "success": true,
  "mergedFiles": 156,
  "conflicts": [...],
  "archivedFolders": [
    "TAMV-COMPLETE-PROJECT",
    "TAMV-ENHANCED-ARCHITECTURE",
    "TAMV-FINAL-PRODUCTION-READY",
    "tamv-enhanced-complete-bundle"
  ],
  "errors": [],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Implementation Details

### File-Level Merge Algorithm

1. **Build Conflict Map:**
   - Scan all duplicate folders
   - Identify files that exist in multiple folders
   - Create conflict entry for each overlapping file

2. **Resolve Conflicts:**
   - Sort sources by quality score (highest first)
   - Check for ties in quality score
   - Apply tiebreaker (recency) if needed
   - Select winner and document reason

3. **Execute Merge:**
   - Copy winning file to target directory
   - Create necessary parent directories
   - Preserve file metadata where possible

4. **Archive Deprecated:**
   - Move entire duplicate folder to archive
   - Add timestamp to prevent conflicts
   - Preserve original structure

### Safety Features

- **Dry Run Mode:** Default mode shows what would happen without making changes
- **Archiving:** Deprecated folders are moved, not deleted
- **Conflict Logging:** All decisions are logged for review
- **Error Handling:** Graceful failure with detailed error messages
- **Validation:** Checks for required files and permissions before proceeding

### Excluded Directories

The following directories are excluded from merging:
- `node_modules/`
- `.git/`
- `.kiro/`
- `.vscode/`
- `.husky/`
- `.archive/`

## Testing

The merge strategy includes comprehensive unit tests:

```bash
npm test -- tests/unit/merge-strategy.test.ts
```

**Test Coverage:**
- File discovery and filtering
- Conflict identification
- Quality-based resolution
- Tiebreaker logic
- Edge cases (special characters, long paths, empty scores)
- Conflict logging format

## API Reference

### mergeFolders()

Main function to execute merge strategy.

```typescript
function mergeFolders(
  folders: DuplicateFolder[],
  options?: MergeOptions
): MergeResult
```

**Parameters:**
- `folders`: Array of duplicate folders with quality scores
- `options`: Merge configuration (optional)

**Returns:** `MergeResult` with success status, merged file count, conflicts, and errors

### identifyConflicts()

Identify merge conflicts for a specific file path.

```typescript
function identifyConflicts(
  filePath: string,
  folders: DuplicateFolder[]
): MergeConflict | null
```

**Parameters:**
- `filePath`: Relative file path to check
- `folders`: Array of duplicate folders

**Returns:** `MergeConflict` if file exists in multiple folders, `null` otherwise

### buildConflictMap()

Build a complete map of all file conflicts.

```typescript
function buildConflictMap(
  folders: DuplicateFolder[]
): Map<string, MergeConflict>
```

**Parameters:**
- `folders`: Array of duplicate folders

**Returns:** Map of file paths to their conflicts

## Troubleshooting

### Issue: "duplicate-analysis-report.json not found"

**Solution:** Run the analysis first:
```bash
npm run analyze
```

### Issue: "Failed to copy file"

**Possible Causes:**
- Insufficient permissions
- Disk space full
- File locked by another process

**Solution:** Check permissions and available disk space

### Issue: "Failed to archive folder"

**Possible Causes:**
- Folder is in use
- Insufficient permissions
- Archive directory not writable

**Solution:** Close any programs using the folder, check permissions

### Issue: Unexpected merge results

**Solution:** 
1. Review `merge-conflicts.log` for conflict resolutions
2. Check quality scores in `duplicate-analysis-report.json`
3. Run in dry-run mode first to preview changes
4. Restore from `.archive/` if needed

## Best Practices

1. **Always run dry-run first:** Review what will happen before executing
2. **Review quality scores:** Ensure the analysis produced reasonable scores
3. **Check conflict log:** Verify conflict resolutions make sense
4. **Keep archives:** Don't delete `.archive/` until you're confident in the merge
5. **Test after merge:** Run tests to ensure nothing broke
6. **Commit frequently:** Use version control to track changes

## Future Enhancements

Potential improvements for future versions:

- **Interactive mode:** Allow manual conflict resolution
- **Selective merge:** Merge only specific folders or file patterns
- **Diff preview:** Show file differences before merging
- **Rollback support:** Automated rollback from archive
- **Parallel processing:** Speed up large merges
- **Custom scoring:** Allow user-defined quality score weights

## Related Documentation

- [Duplicate Analysis Implementation](./duplicate-analysis-summary.md)
- [Quality Scoring Implementation](./quality-scoring-implementation.md)
- [Project Cleanup Specification](../.kiro/specs/tamv-project-cleanup-and-consolidation/requirements.md)
