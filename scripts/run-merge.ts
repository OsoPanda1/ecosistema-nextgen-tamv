#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * CLI script to run merge strategy
 * 
 * This script loads the duplicate analysis report and executes
 * the merge strategy to consolidate duplicate folders.
 * 
 * Usage:
 *   npm run merge              # Run merge (dry run by default)
 *   npm run merge -- --execute # Execute actual merge
 * 
 * Requirements: 1.2, 1.3
 */

import * as fs from 'fs';
import * as path from 'path';
import { mergeFolders, printMergeResult, saveMergeResult, MergeOptions } from './merge-strategy';
import { DuplicateAnalysisReport } from './analyze-duplicates';

/**
 * Load duplicate analysis report
 */
function loadAnalysisReport(reportPath: string): DuplicateAnalysisReport | null {
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    return JSON.parse(reportContent);
  } catch (error) {
    console.error(`Error loading analysis report from ${reportPath}:`, error);
    return null;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { execute: boolean; help: boolean } {
  const args = process.argv.slice(2);
  
  return {
    execute: args.includes('--execute') || args.includes('-e'),
    help: args.includes('--help') || args.includes('-h')
  };
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TAMV MERGE STRATEGY CLI');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('Usage:');
  console.log('  npm run merge              # Run merge in dry-run mode');
  console.log('  npm run merge -- --execute # Execute actual merge');
  console.log('  npm run merge -- --help    # Show this help message');
  console.log();
  console.log('Options:');
  console.log('  --execute, -e    Execute the merge (default is dry-run)');
  console.log('  --help, -h       Show this help message');
  console.log();
  console.log('Prerequisites:');
  console.log('  1. Run "npm run analyze" to generate duplicate analysis report');
  console.log('  2. Review the report at duplicate-analysis-report.json');
  console.log('  3. Run this script to merge duplicate folders');
  console.log();
  console.log('What this script does:');
  console.log('  - Loads the duplicate analysis report');
  console.log('  - Identifies merge conflicts based on quality scores');
  console.log('  - Merges files from duplicate folders into target directory');
  console.log('  - Archives deprecated folders to .archive/ directory');
  console.log('  - Logs all merge conflicts for review');
  console.log();
  console.log('Safety:');
  console.log('  - Dry-run mode (default) shows what would happen without making changes');
  console.log('  - Deprecated folders are archived, not deleted');
  console.log('  - All merge decisions are logged to merge-conflicts.log');
  console.log();
  console.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Main execution
 */
function main(): void {
  const args = parseArgs();
  
  // Show help if requested
  if (args.help) {
    printUsage();
    process.exit(0);
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TAMV MERGE STRATEGY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  
  // Determine mode
  const dryRun = !args.execute;
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '⚠️  EXECUTE (changes will be made)'}`);
  console.log();
  
  // Load analysis report
  const projectRoot = process.cwd();
  const reportPath = path.join(projectRoot, 'duplicate-analysis-report.json');
  
  console.log('📄 Loading duplicate analysis report...');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Error: duplicate-analysis-report.json not found');
    console.error('   Please run "npm run analyze" first to generate the report');
    process.exit(1);
  }
  
  const report = loadAnalysisReport(reportPath);
  
  if (!report) {
    console.error('❌ Error: Failed to load analysis report');
    process.exit(1);
  }
  
  console.log(`✅ Loaded report with ${report.duplicateFolders.length} duplicate folders`);
  console.log();
  
  // Check if there are folders to merge
  if (report.duplicateFolders.length === 0) {
    console.log('✅ No duplicate folders found. Nothing to merge.');
    process.exit(0);
  }
  
  // Confirm execution mode
  if (!dryRun) {
    console.log('⚠️  WARNING: You are about to execute the merge!');
    console.log('   This will:');
    console.log('   - Copy files from duplicate folders to the target directory');
    console.log('   - Archive duplicate folders to .archive/ directory');
    console.log('   - Log all merge conflicts to merge-conflicts.log');
    console.log();
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    console.log();
    
    // Wait 5 seconds before proceeding
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      // Busy wait
    }
  }
  
  // Configure merge options
  const mergeOptions: MergeOptions = {
    targetDirectory: projectRoot,
    archiveDirectory: path.join(projectRoot, '.archive'),
    dryRun,
    logConflicts: true
  };
  
  // Execute merge
  console.log('🔀 Starting merge process...');
  console.log();
  
  const result = mergeFolders(report.duplicateFolders, mergeOptions);
  
  // Print result
  printMergeResult(result);
  
  // Save result to file
  const resultPath = path.join(projectRoot, 'merge-result.json');
  saveMergeResult(result, resultPath);
  
  // Exit with appropriate code
  if (result.success) {
    if (dryRun) {
      console.log('✅ Dry run completed successfully!');
      console.log('   Review the output above to see what would happen.');
      console.log('   Run "npm run merge -- --execute" to perform the actual merge.');
    } else {
      console.log('✅ Merge completed successfully!');
      console.log('   Review merge-conflicts.log for details on conflict resolution.');
    }
    process.exit(0);
  } else {
    console.error('❌ Merge failed with errors. See output above for details.');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };
