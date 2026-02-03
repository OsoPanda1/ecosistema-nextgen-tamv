#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Merge Strategy Implementation for TAMV Project Cleanup
 * 
 * This script implements file-level merge based on quality scores,
 * handles merge conflicts with logging, and creates archive directory
 * for deprecated content.
 * 
 * Requirements: 1.2, 1.3
 */

import * as fs from 'fs';
import * as path from 'path';
import { DuplicateFolder } from './analyze-duplicates';

interface MergeConflict {
  filePath: string;
  sources: ConflictSource[];
  resolution: 'quality_score' | 'manual_required';
  winner?: string;
  reason: string;
}

interface ConflictSource {
  folder: string;
  qualityScore: number;
  lastModified: Date;
  size: number;
}

interface MergeResult {
  success: boolean;
  mergedFiles: number;
  conflicts: MergeConflict[];
  archivedFolders: string[];
  errors: string[];
  timestamp: Date;
}

interface MergeOptions {
  targetDirectory: string;
  archiveDirectory: string;
  dryRun: boolean;
  logConflicts: boolean;
}

/**
 * Default merge options
 */
const DEFAULT_MERGE_OPTIONS: MergeOptions = {
  targetDirectory: '.',
  archiveDirectory: '.archive',
  dryRun: false,
  logConflicts: true
};

/**
 * Directories to exclude from merging
 */
const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  '.kiro',
  '.vscode',
  '.husky',
  '.archive'
];

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          files.push(...getAllFiles(fullPath, relativePath));
        }
      } else {
        files.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
  
  return files;
}

/**
 * Get file metadata
 */
function getFileMetadata(filePath: string): { size: number; lastModified: Date } | null {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      lastModified: stats.mtime
    };
  } catch {
    return null;
  }
}

/**
 * Identify merge conflicts for a specific file path
 * 
 * A conflict occurs when the same relative file path exists in multiple
 * duplicate folders.
 */
function identifyConflicts(
  filePath: string,
  folders: DuplicateFolder[]
): MergeConflict | null {
  const sources: ConflictSource[] = [];
  
  // Check which folders contain this file
  for (const folder of folders) {
    const fullPath = path.join(folder.path, filePath);
    
    if (fs.existsSync(fullPath)) {
      const metadata = getFileMetadata(fullPath);
      
      if (metadata) {
        sources.push({
          folder: folder.name,
          qualityScore: folder.qualityScore?.overall || 0,
          lastModified: metadata.lastModified,
          size: metadata.size
        });
      }
    }
  }
  
  // No conflict if file exists in only one folder
  if (sources.length <= 1) {
    return null;
  }
  
  // Sort sources by quality score (highest first)
  sources.sort((a, b) => b.qualityScore - a.qualityScore);
  
  // Determine resolution strategy
  const topScore = sources[0].qualityScore;
  const hasMultipleTopScores = sources.filter(s => s.qualityScore === topScore).length > 1;
  
  let resolution: 'quality_score' | 'manual_required';
  let winner: string | undefined;
  let reason: string;
  
  if (hasMultipleTopScores) {
    // Multiple sources have the same top quality score
    // Use recency as tiebreaker
    const topSources = sources.filter(s => s.qualityScore === topScore);
    topSources.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    
    winner = topSources[0].folder;
    resolution = 'quality_score';
    reason = `Multiple sources with quality score ${topScore}. Selected most recent: ${winner}`;
  } else {
    // Clear winner based on quality score
    winner = sources[0].folder;
    resolution = 'quality_score';
    reason = `Selected source with highest quality score: ${topScore}`;
  }
  
  return {
    filePath,
    sources,
    resolution,
    winner,
    reason
  };
}

/**
 * Build a map of all file paths to their conflicts
 */
function buildConflictMap(folders: DuplicateFolder[]): Map<string, MergeConflict> {
  const conflictMap = new Map<string, MergeConflict>();
  
  // Get all unique file paths across all folders
  const allFilePaths = new Set<string>();
  
  for (const folder of folders) {
    const files = getAllFiles(folder.path);
    files.forEach(file => allFilePaths.add(file));
  }
  
  // Identify conflicts for each file path
  for (const filePath of allFilePaths) {
    const conflict = identifyConflicts(filePath, folders);
    
    if (conflict) {
      conflictMap.set(filePath, conflict);
    }
  }
  
  return conflictMap;
}

/**
 * Copy file with directory creation
 */
function copyFile(sourcePath: string, targetPath: string): boolean {
  try {
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    return true;
  } catch (error) {
    console.error(`Error copying file ${sourcePath} to ${targetPath}:`, error);
    return false;
  }
}

/**
 * Archive a folder by moving it to the archive directory
 */
function archiveFolder(
  folderPath: string,
  folderName: string,
  archiveDirectory: string,
  dryRun: boolean
): boolean {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(archiveDirectory, `${folderName}-${timestamp}`);
    
    if (dryRun) {
      console.log(`[DRY RUN] Would archive ${folderPath} to ${archivePath}`);
      return true;
    }
    
    // Create archive directory if it doesn't exist
    if (!fs.existsSync(archiveDirectory)) {
      fs.mkdirSync(archiveDirectory, { recursive: true });
    }
    
    // Move folder to archive
    fs.renameSync(folderPath, archivePath);
    console.log(`✅ Archived ${folderName} to ${archivePath}`);
    return true;
  } catch (error) {
    console.error(`Error archiving folder ${folderPath}:`, error);
    return false;
  }
}

/**
 * Merge duplicate folders into target directory
 */
function mergeFolders(
  folders: DuplicateFolder[],
  options: MergeOptions = DEFAULT_MERGE_OPTIONS
): MergeResult {
  const result: MergeResult = {
    success: false,
    mergedFiles: 0,
    conflicts: [],
    archivedFolders: [],
    errors: [],
    timestamp: new Date()
  };
  
  console.log('🔀 Starting merge process...\n');
  
  // Validate folders have quality scores
  const foldersWithScores = folders.filter(f => f.qualityScore !== undefined);
  
  if (foldersWithScores.length === 0) {
    result.errors.push('No folders with quality scores found');
    return result;
  }
  
  // Build conflict map
  console.log('🔍 Identifying merge conflicts...');
  const conflictMap = buildConflictMap(foldersWithScores);
  console.log(`   Found ${conflictMap.size} files with conflicts\n`);
  
  // Merge files based on conflict resolution
  console.log('📁 Merging files...');
  
  for (const [filePath, conflict] of conflictMap) {
    result.conflicts.push(conflict);
    
    if (conflict.winner) {
      // Find the winning folder
      const winningFolder = foldersWithScores.find(f => f.name === conflict.winner);
      
      if (winningFolder) {
        const sourcePath = path.join(winningFolder.path, filePath);
        const targetPath = path.join(options.targetDirectory, filePath);
        
        if (options.dryRun) {
          console.log(`[DRY RUN] Would copy ${sourcePath} to ${targetPath}`);
          result.mergedFiles++;
        } else {
          if (copyFile(sourcePath, targetPath)) {
            result.mergedFiles++;
          } else {
            result.errors.push(`Failed to copy ${filePath} from ${conflict.winner}`);
          }
        }
      }
    }
  }
  
  console.log(`   Merged ${result.mergedFiles} files\n`);
  
  // Archive deprecated folders
  console.log('📦 Archiving deprecated folders...');
  
  for (const folder of foldersWithScores) {
    if (archiveFolder(folder.path, folder.name, options.archiveDirectory, options.dryRun)) {
      result.archivedFolders.push(folder.name);
    } else {
      result.errors.push(`Failed to archive ${folder.name}`);
    }
  }
  
  console.log(`   Archived ${result.archivedFolders.length} folders\n`);
  
  // Log conflicts if requested
  if (options.logConflicts && result.conflicts.length > 0) {
    logConflicts(result.conflicts, options.targetDirectory);
  }
  
  // Determine overall success
  result.success = result.errors.length === 0;
  
  return result;
}

/**
 * Log merge conflicts to a file
 */
function logConflicts(conflicts: MergeConflict[], targetDirectory: string): void {
  const logPath = path.join(targetDirectory, 'merge-conflicts.log');
  
  try {
    let logContent = '═══════════════════════════════════════════════════════════════\n';
    logContent += '                    MERGE CONFLICTS LOG\n';
    logContent += '═══════════════════════════════════════════════════════════════\n';
    logContent += `Generated: ${new Date().toISOString()}\n`;
    logContent += `Total Conflicts: ${conflicts.length}\n\n`;
    
    for (const conflict of conflicts) {
      logContent += `File: ${conflict.filePath}\n`;
      logContent += `Resolution: ${conflict.resolution}\n`;
      logContent += `Winner: ${conflict.winner || 'N/A'}\n`;
      logContent += `Reason: ${conflict.reason}\n`;
      logContent += `Sources:\n`;
      
      for (const source of conflict.sources) {
        logContent += `  - ${source.folder}\n`;
        logContent += `    Quality Score: ${source.qualityScore}\n`;
        logContent += `    Last Modified: ${source.lastModified.toISOString()}\n`;
        logContent += `    Size: ${source.size} bytes\n`;
      }
      
      logContent += '\n';
    }
    
    logContent += '═══════════════════════════════════════════════════════════════\n';
    
    fs.writeFileSync(logPath, logContent, 'utf-8');
    console.log(`📝 Merge conflicts logged to: ${logPath}\n`);
  } catch (error) {
    console.error('Error writing conflict log:', error);
  }
}

/**
 * Print merge result summary
 */
function printMergeResult(result: MergeResult): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    MERGE RESULT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Timestamp: ${result.timestamp.toISOString()}\n`);
  
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Merged Files: ${result.mergedFiles}`);
  console.log(`Conflicts Resolved: ${result.conflicts.length}`);
  console.log(`Archived Folders: ${result.archivedFolders.length}`);
  console.log(`Errors: ${result.errors.length}\n`);
  
  if (result.archivedFolders.length > 0) {
    console.log('Archived Folders:');
    for (const folder of result.archivedFolders) {
      console.log(`  - ${folder}`);
    }
    console.log();
  }
  
  if (result.errors.length > 0) {
    console.log('Errors:');
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
    console.log();
  }
  
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save merge result to JSON file
 */
function saveMergeResult(result: MergeResult, outputPath: string): void {
  try {
    const jsonResult = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, jsonResult, 'utf-8');
    console.log(`✅ Merge result saved to: ${outputPath}\n`);
  } catch (error) {
    console.error(`❌ Error saving merge result: ${error}`);
  }
}

// Export for testing
export {
  mergeFolders,
  identifyConflicts,
  buildConflictMap,
  archiveFolder,
  copyFile,
  getAllFiles,
  printMergeResult,
  saveMergeResult,
  MergeConflict,
  ConflictSource,
  MergeResult,
  MergeOptions,
  DEFAULT_MERGE_OPTIONS
};
