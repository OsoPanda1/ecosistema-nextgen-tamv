#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * File System Analyzer for TAMV Project Cleanup
 * 
 * This script identifies duplicate folders and files in the TAMV project
 * to support the consolidation effort.
 * 
 * Requirements: 1.2, 2.1, 2.2
 */

import * as fs from 'fs';
import * as path from 'path';

interface DuplicateFolder {
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
  lastModified: Date;
  isEmpty: boolean;
  qualityScore?: QualityScore;
}

interface QualityScore {
  completeness: number;      // 0-100
  recency: number;           // 0-100
  codeQuality: number;       // 0-100
  overall: number;           // 0-100 (weighted average)
}

interface DuplicateFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

interface DuplicateAnalysisReport {
  timestamp: Date;
  duplicateFolders: DuplicateFolder[];
  duplicateDocumentationFiles: DuplicateFile[];
  emptyDirectories: string[];
  summary: {
    totalDuplicateFolders: number;
    totalDuplicateFiles: number;
    totalEmptyDirectories: number;
    estimatedSpaceSavings: number;
  };
}

/**
 * Known duplicate project folders to scan
 */
const DUPLICATE_PROJECT_FOLDERS = [
  'TAMV-COMPLETE-PROJECT',
  'TAMV-ENHANCED-ARCHITECTURE',
  'TAMV-FINAL-PRODUCTION-READY',
  'tamv-enhanced-complete-bundle'
];

/**
 * Documentation file patterns to identify duplicates
 */
const DOCUMENTATION_PATTERNS = [
  /^README.*\.md$/i,
  /^LEEME.*\.md$/i,
  /^INSTRUCCIONES.*\.md$/i,
  /^PLAN.*\.md$/i,
  /^REPORTE.*\.md$/i,
  /^RESUMEN.*\.md$/i,
  /^IMPLEMENTACION.*\.md$/i,
  /^TAMV.*\.md$/i,
  /^ROADMAP.*\.md$/i,
  /^CONSOLIDATION.*\.md$/i,
  /^CLEANUP.*\.md$/i,
  /^DEPLOYMENT.*\.md$/i,
  /^LOGROS.*\.md$/i,
  /^CONTRIBUTING\.md$/i,
  /^SAAS.*\.md$/i,
  /^CGIFTS.*\.md$/i,
  /^EDWIN.*\.md$/i
];

/**
 * Directories to exclude from analysis
 */
const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  '.kiro',
  '.vscode',
  '.husky'
];

/**
 * Get file statistics
 */
function getFileStats(filePath: string): { size: number; lastModified: Date } | null {
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
 * Count files recursively in a directory
 */
function countFilesRecursive(dirPath: string): number {
  let count = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          count += countFilesRecursive(fullPath);
        }
      } else {
        count++;
      }
    }
  } catch {
    // Ignore errors (permission issues, etc.)
  }
  
  return count;
}

/**
 * Calculate total size of directory recursively
 */
function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          totalSize += calculateDirectorySize(fullPath);
        }
      } else {
        const stats = getFileStats(fullPath);
        if (stats) {
          totalSize += stats.size;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return totalSize;
}

/**
 * Get last modified date of directory (most recent file)
 */
function getDirectoryLastModified(dirPath: string): Date {
  let latestDate = new Date(0);
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          const dirDate = getDirectoryLastModified(fullPath);
          if (dirDate > latestDate) {
            latestDate = dirDate;
          }
        }
      } else {
        const stats = getFileStats(fullPath);
        if (stats && stats.lastModified > latestDate) {
          latestDate = stats.lastModified;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return latestDate;
}

/**
 * Check if directory is empty (recursively)
 */
function isDirectoryEmpty(dirPath: string): boolean {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    if (entries.length === 0) {
      return true;
    }
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          if (!isDirectoryEmpty(fullPath)) {
            return false;
          }
        }
      } else {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Find all empty directories recursively
 */
function findEmptyDirectories(rootPath: string, basePath: string = ''): string[] {
  const emptyDirs: string[] = [];
  
  try {
    const entries = fs.readdirSync(rootPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !EXCLUDED_DIRECTORIES.includes(entry.name)) {
        const fullPath = path.join(rootPath, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (isDirectoryEmpty(fullPath)) {
          emptyDirs.push(relativePath);
        } else {
          emptyDirs.push(...findEmptyDirectories(fullPath, relativePath));
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return emptyDirs;
}

/**
 * Analyze duplicate project folders
 */
function analyzeDuplicateFolders(projectRoot: string): DuplicateFolder[] {
  const duplicates: DuplicateFolder[] = [];
  
  for (const folderName of DUPLICATE_PROJECT_FOLDERS) {
    const folderPath = path.join(projectRoot, folderName);
    
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
      const fileCount = countFilesRecursive(folderPath);
      const totalSize = calculateDirectorySize(folderPath);
      const lastModified = getDirectoryLastModified(folderPath);
      const isEmpty = isDirectoryEmpty(folderPath);
      
      duplicates.push({
        name: folderName,
        path: folderPath,
        fileCount,
        totalSize,
        lastModified,
        isEmpty
      });
    }
  }
  
  return duplicates;
}

/**
 * Analyze duplicate documentation files at root level
 */
function analyzeDuplicateDocumentation(projectRoot: string): DuplicateFile[] {
  const duplicates: DuplicateFile[] = [];
  
  try {
    const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        // Check if file matches any documentation pattern
        const matchesPattern = DOCUMENTATION_PATTERNS.some(pattern => 
          pattern.test(entry.name)
        );
        
        if (matchesPattern) {
          const filePath = path.join(projectRoot, entry.name);
          const stats = getFileStats(filePath);
          
          if (stats) {
            duplicates.push({
              name: entry.name,
              path: filePath,
              size: stats.size,
              lastModified: stats.lastModified
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing documentation files:', error);
  }
  
  return duplicates;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate duplicate analysis report
 */
function generateAnalysisReport(projectRoot: string): DuplicateAnalysisReport {
  console.log('🔍 Analyzing TAMV project for duplicates...\n');
  
  // Analyze duplicate folders
  console.log('📁 Scanning for duplicate project folders...');
  let duplicateFolders = analyzeDuplicateFolders(projectRoot);
  console.log(`   Found ${duplicateFolders.length} duplicate project folders\n`);
  
  // Add quality scores to duplicate folders
  console.log('📊 Calculating quality scores for duplicate folders...');
  duplicateFolders = addQualityScores(duplicateFolders);
  console.log('   Quality scoring complete\n');
  
  // Analyze duplicate documentation
  console.log('📄 Scanning for duplicate documentation files...');
  const duplicateDocumentationFiles = analyzeDuplicateDocumentation(projectRoot);
  console.log(`   Found ${duplicateDocumentationFiles.length} duplicate documentation files\n`);
  
  // Find empty directories
  console.log('📂 Scanning for empty directories...');
  const emptyDirectories = findEmptyDirectories(projectRoot);
  console.log(`   Found ${emptyDirectories.length} empty directories\n`);
  
  // Calculate space savings
  const folderSpaceSavings = duplicateFolders.reduce((sum, folder) => sum + folder.totalSize, 0);
  const fileSpaceSavings = duplicateDocumentationFiles.reduce((sum, file) => sum + file.size, 0);
  const estimatedSpaceSavings = folderSpaceSavings + fileSpaceSavings;
  
  return {
    timestamp: new Date(),
    duplicateFolders,
    duplicateDocumentationFiles,
    emptyDirectories,
    summary: {
      totalDuplicateFolders: duplicateFolders.length,
      totalDuplicateFiles: duplicateDocumentationFiles.length,
      totalEmptyDirectories: emptyDirectories.length,
      estimatedSpaceSavings
    }
  };
}

/**
 * Print report to console
 */
function printReport(report: DuplicateAnalysisReport): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           TAMV PROJECT DUPLICATE ANALYSIS REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Generated: ${report.timestamp.toISOString()}\n`);
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Duplicate Project Folders: ${report.summary.totalDuplicateFolders}`);
  console.log(`Duplicate Documentation Files: ${report.summary.totalDuplicateFiles}`);
  console.log(`Empty Directories: ${report.summary.totalEmptyDirectories}`);
  console.log(`Estimated Space Savings: ${formatBytes(report.summary.estimatedSpaceSavings)}\n`);
  
  // Duplicate Folders
  if (report.duplicateFolders.length > 0) {
    console.log('📁 DUPLICATE PROJECT FOLDERS');
    console.log('───────────────────────────────────────────────────────────────');
    
    // Sort by quality score (highest first)
    const sortedFolders = [...report.duplicateFolders].sort(
      (a, b) => (b.qualityScore?.overall || 0) - (a.qualityScore?.overall || 0)
    );
    
    for (const folder of sortedFolders) {
      console.log(`\n${folder.name}`);
      console.log(`  Path: ${folder.path}`);
      console.log(`  Files: ${folder.fileCount}`);
      console.log(`  Size: ${formatBytes(folder.totalSize)}`);
      console.log(`  Last Modified: ${folder.lastModified.toISOString()}`);
      console.log(`  Empty: ${folder.isEmpty ? 'Yes' : 'No'}`);
      
      if (folder.qualityScore) {
        console.log(`  Quality Score:`);
        console.log(`    Overall: ${folder.qualityScore.overall}/100`);
        console.log(`    Completeness: ${folder.qualityScore.completeness}/100`);
        console.log(`    Recency: ${folder.qualityScore.recency}/100`);
        console.log(`    Code Quality: ${folder.qualityScore.codeQuality}/100`);
      }
    }
    console.log();
  }
  
  // Duplicate Documentation Files
  if (report.duplicateDocumentationFiles.length > 0) {
    console.log('📄 DUPLICATE DOCUMENTATION FILES (Root Level)');
    console.log('───────────────────────────────────────────────────────────────');
    
    // Sort by last modified date (newest first)
    const sortedFiles = [...report.duplicateDocumentationFiles].sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
    );
    
    for (const file of sortedFiles) {
      console.log(`\n${file.name}`);
      console.log(`  Size: ${formatBytes(file.size)}`);
      console.log(`  Last Modified: ${file.lastModified.toISOString()}`);
    }
    console.log();
  }
  
  // Empty Directories
  if (report.emptyDirectories.length > 0) {
    console.log('📂 EMPTY DIRECTORIES');
    console.log('───────────────────────────────────────────────────────────────');
    for (const dir of report.emptyDirectories) {
      console.log(`  ${dir}`);
    }
    console.log();
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      END OF REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save report to JSON file
 */
function saveReportToFile(report: DuplicateAnalysisReport, outputPath: string): void {
  try {
    const jsonReport = JSON.stringify(report, null, 2);
    fs.writeFileSync(outputPath, jsonReport, 'utf-8');
    console.log(`✅ Report saved to: ${outputPath}\n`);
  } catch (error) {
    console.error(`❌ Error saving report: ${error}`);
  }
}

/**
 * Calculate completeness score based on file count and implementation depth
 * 
 * Scoring criteria:
 * - File count: More files indicate more complete implementation
 * - Implementation depth: Presence of key directories (src, tests, docs, etc.)
 * - Configuration files: Presence of package.json, tsconfig.json, etc.
 * 
 * @param folderPath Path to the folder to score
 * @returns Completeness score (0-100)
 */
function calculateCompletenessScore(folderPath: string): number {
  let score = 0;
  
  // File count scoring (0-40 points)
  // More files generally indicate more complete implementation
  const fileCount = countFilesRecursive(folderPath);
  const fileCountScore = Math.min(40, (fileCount / 100) * 40);
  score += fileCountScore;
  
  // Implementation depth scoring (0-40 points)
  // Check for presence of key directories
  const keyDirectories = [
    'src',
    'backend',
    'frontend',
    'tests',
    'docs',
    'infrastructure',
    'database',
    'scripts'
  ];
  
  let foundDirectories = 0;
  for (const dir of keyDirectories) {
    const dirPath = path.join(folderPath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      foundDirectories++;
    }
  }
  
  const depthScore = (foundDirectories / keyDirectories.length) * 40;
  score += depthScore;
  
  // Configuration files scoring (0-20 points)
  // Check for presence of important configuration files
  const configFiles = [
    'package.json',
    'tsconfig.json',
    '.eslintrc.js',
    '.eslintrc.json',
    'jest.config.js',
    'jest.config.ts',
    'docker-compose.yml',
    'Dockerfile'
  ];
  
  let foundConfigFiles = 0;
  for (const file of configFiles) {
    const filePath = path.join(folderPath, file);
    if (fs.existsSync(filePath)) {
      foundConfigFiles++;
    }
  }
  
  const configScore = (foundConfigFiles / configFiles.length) * 20;
  score += configScore;
  
  return Math.round(score);
}

/**
 * Calculate recency score based on last modified date
 * 
 * Scoring criteria:
 * - More recent modifications get higher scores
 * - Score decays over time
 * - Maximum score for modifications within last 7 days
 * 
 * @param lastModified Last modified date
 * @returns Recency score (0-100)
 */
function calculateRecencyScore(lastModified: Date): number {
  const now = new Date();
  const daysSinceModified = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
  
  // Score decays over time
  // 0-7 days: 100 points
  // 7-30 days: 80-100 points (linear decay)
  // 30-90 days: 50-80 points (linear decay)
  // 90-180 days: 20-50 points (linear decay)
  // 180+ days: 0-20 points (linear decay)
  
  if (daysSinceModified <= 7) {
    return 100;
  } else if (daysSinceModified <= 30) {
    return Math.round(100 - ((daysSinceModified - 7) / 23) * 20);
  } else if (daysSinceModified <= 90) {
    return Math.round(80 - ((daysSinceModified - 30) / 60) * 30);
  } else if (daysSinceModified <= 180) {
    return Math.round(50 - ((daysSinceModified - 90) / 90) * 30);
  } else if (daysSinceModified <= 365) {
    return Math.round(20 - ((daysSinceModified - 180) / 185) * 20);
  } else {
    return 0;
  }
}

/**
 * Count TypeScript/JavaScript files in a directory
 */
function countCodeFiles(dirPath: string): number {
  let count = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          count += countCodeFiles(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          count++;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return count;
}

/**
 * Count test files in a directory
 */
function countTestFiles(dirPath: string): number {
  let count = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
          count += countTestFiles(fullPath);
        }
      } else if (entry.isFile()) {
        const name = entry.name;
        if (name.includes('.test.') || name.includes('.spec.') || name.includes('test')) {
          count++;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return count;
}

/**
 * Calculate code quality score
 * 
 * Scoring criteria:
 * - Test coverage: Ratio of test files to code files
 * - TypeScript usage: Presence of TypeScript files
 * - Linting configuration: Presence of ESLint config
 * - Type checking: Presence of tsconfig.json
 * 
 * Note: This is a heuristic-based score since we can't run linting
 * without potentially installing dependencies and running builds.
 * 
 * @param folderPath Path to the folder to score
 * @returns Code quality score (0-100)
 */
function calculateCodeQualityScore(folderPath: string): number {
  let score = 0;
  
  // Test coverage scoring (0-40 points)
  // Higher ratio of test files to code files indicates better quality
  const codeFileCount = countCodeFiles(folderPath);
  const testFileCount = countTestFiles(folderPath);
  
  if (codeFileCount > 0) {
    const testRatio = testFileCount / codeFileCount;
    // Ideal ratio is 1:1 or higher (one test file per code file)
    const testScore = Math.min(40, testRatio * 40);
    score += testScore;
  }
  
  // TypeScript usage scoring (0-20 points)
  // Check if project uses TypeScript
  const tsconfigPath = path.join(folderPath, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    score += 20;
  }
  
  // Linting configuration scoring (0-20 points)
  // Check for ESLint configuration
  const eslintConfigs = [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    '.eslintrc'
  ];
  
  const hasEslint = eslintConfigs.some(config => {
    const configPath = path.join(folderPath, config);
    return fs.existsSync(configPath);
  });
  
  if (hasEslint) {
    score += 20;
  }
  
  // Code organization scoring (0-20 points)
  // Check for organized directory structure
  const hasTests = fs.existsSync(path.join(folderPath, 'tests')) || 
                   fs.existsSync(path.join(folderPath, 'test')) ||
                   fs.existsSync(path.join(folderPath, '__tests__'));
  
  const hasSrc = fs.existsSync(path.join(folderPath, 'src')) ||
                 fs.existsSync(path.join(folderPath, 'backend')) ||
                 fs.existsSync(path.join(folderPath, 'frontend'));
  
  if (hasTests) score += 10;
  if (hasSrc) score += 10;
  
  return Math.round(score);
}

/**
 * Calculate overall quality score for a folder
 * 
 * Weights:
 * - Completeness: 40%
 * - Recency: 30%
 * - Code Quality: 30%
 * 
 * @param folderPath Path to the folder
 * @param lastModified Last modified date
 * @returns Quality score object
 */
function calculateQualityScore(folderPath: string, lastModified: Date): QualityScore {
  const completeness = calculateCompletenessScore(folderPath);
  const recency = calculateRecencyScore(lastModified);
  const codeQuality = calculateCodeQualityScore(folderPath);
  
  // Weighted average
  const overall = Math.round(
    completeness * 0.4 +
    recency * 0.3 +
    codeQuality * 0.3
  );
  
  return {
    completeness,
    recency,
    codeQuality,
    overall
  };
}

/**
 * Add quality scores to duplicate folders
 */
function addQualityScores(folders: DuplicateFolder[]): DuplicateFolder[] {
  return folders.map(folder => ({
    ...folder,
    qualityScore: calculateQualityScore(folder.path, folder.lastModified)
  }));
}

/**
 * Main execution
 */
function main(): void {
  const projectRoot = process.cwd();
  const outputPath = path.join(projectRoot, 'duplicate-analysis-report.json');
  
  // Generate report
  const report = generateAnalysisReport(projectRoot);
  
  // Print to console
  printReport(report);
  
  // Save to file
  saveReportToFile(report, outputPath);
  
  // Exit with appropriate code
  if (report.summary.totalDuplicateFolders > 0 || report.summary.totalDuplicateFiles > 0) {
    console.log('⚠️  Duplicates found. Review the report and proceed with consolidation.\n');
    process.exit(0);
  } else {
    console.log('✅ No duplicates found. Project structure is clean.\n');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
export {
  analyzeDuplicateFolders,
  analyzeDuplicateDocumentation,
  findEmptyDirectories,
  generateAnalysisReport,
  calculateCompletenessScore,
  calculateRecencyScore,
  calculateCodeQualityScore,
  calculateQualityScore,
  addQualityScores,
  DuplicateAnalysisReport,
  DuplicateFolder,
  DuplicateFile,
  QualityScore
};
