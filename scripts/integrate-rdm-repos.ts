#!/usr/bin/env node
/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

export interface RdmRepoDefinition {
  name: string;
  layer: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';
  pathCandidates: string[];
  targetSubdirectory: string;
  description: string;
}

export interface RepoDiscovery {
  definition: RdmRepoDefinition;
  resolvedPath?: string;
  exists: boolean;
}

export interface FileSyncEntry {
  source: string;
  target: string;
  bytes: number;
  status: 'copied' | 'unchanged' | 'missing';
}

export interface RdmIntegrationReport {
  timestamp: string;
  mode: 'dry-run' | 'execute';
  rootDirectory: string;
  federationDirectory: string;
  discovered: RepoDiscovery[];
  syncedFiles: FileSyncEntry[];
  missingRepositories: string[];
  warnings: string[];
}

const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.next']);

export const DEFAULT_REPOSITORIES: RdmRepoDefinition[] = [
  {
    name: 'real-del-monte-elevated',
    layer: 'L4',
    pathCandidates: ['../real-del-monte-elevated', './real-del-monte-elevated'],
    targetSubdirectory: 'xr/real-del-monte-elevated',
    description: 'Assets and logic for elevated XR experience.'
  },
  {
    name: 'rdm-smart-city-os',
    layer: 'L2',
    pathCandidates: ['../rdm-smart-city-os', './rdm-smart-city-os'],
    targetSubdirectory: 'protocols/rdm-smart-city-os',
    description: 'Smart-city orchestration and protocol logic.'
  },
  {
    name: 'citemesh-roots',
    layer: 'L1',
    pathCandidates: ['../citemesh-roots', './citemesh-roots'],
    targetSubdirectory: 'memory/citemesh-roots',
    description: 'Foundational city-memory and semantic root structures.'
  },
  {
    name: 'real-del-monte-explorer',
    layer: 'L6',
    pathCandidates: ['../real-del-monte-explorer', './real-del-monte-explorer'],
    targetSubdirectory: 'shell/real-del-monte-explorer',
    description: 'Explorer UX and journey flows.'
  },
  {
    name: 'real-del-monte-twin',
    layer: 'L4',
    pathCandidates: ['../real-del-monte-twin', './real-del-monte-twin'],
    targetSubdirectory: 'xr/real-del-monte-twin',
    description: 'Digital twin scene data and real-time synchronization logic.'
  },
  {
    name: 'RDM-DIGITAL2026',
    layer: 'L7',
    pathCandidates: ['../RDM-DIGITAL2026', './RDM-DIGITAL2026'],
    targetSubdirectory: 'quantum/rdm-digital2026',
    description: 'Roadmap and orchestration patterns for 2026 deployment.'
  },
  {
    name: 'RDM-Digital-X',
    layer: 'L3',
    pathCandidates: ['../RDM-Digital-X', './RDM-Digital-X'],
    targetSubdirectory: 'guardian/rdm-digital-x',
    description: 'Monitoring and guardian intelligence components.'
  },
  {
    name: 'RDM-DIGITAL',
    layer: 'L5',
    pathCandidates: ['../RDM-DIGITAL', './RDM-DIGITAL'],
    targetSubdirectory: 'domain/rdm-digital',
    description: 'Domain services for economy, social and identity.'
  },
  {
    name: 'plataforma-real-del-monte',
    layer: 'L6',
    pathCandidates: ['../plataforma-real-del-monte', './plataforma-real-del-monte'],
    targetSubdirectory: 'shell/plataforma-real-del-monte',
    description: 'Platform shell and integration UI.'
  }
];

export interface CliOptions {
  execute: boolean;
  rootDirectory: string;
  federationDirectory: string;
  reportPath: string;
  manifestPath?: string;
}

function parseArgs(argv: string[], cwd: string): CliOptions {
  const execute = argv.includes('--execute') || argv.includes('-e');
  const federationDirectory = readArgValue(argv, '--federation-dir')
    ? path.resolve(cwd, readArgValue(argv, '--federation-dir') as string)
    : path.resolve(cwd, 'integration/rdm-federation');
  const reportPath = readArgValue(argv, '--report')
    ? path.resolve(cwd, readArgValue(argv, '--report') as string)
    : path.resolve(cwd, 'integration/rdm-integration-report.json');
  const manifestPath = readArgValue(argv, '--manifest')
    ? path.resolve(cwd, readArgValue(argv, '--manifest') as string)
    : undefined;

  return {
    execute,
    rootDirectory: cwd,
    federationDirectory,
    reportPath,
    manifestPath
  };
}

function readArgValue(argv: string[], key: string): string | undefined {
  const index = argv.findIndex(arg => arg === key);
  if (index === -1 || index + 1 >= argv.length) {
    return undefined;
  }

  return argv[index + 1];
}

function loadManifest(manifestPath?: string): RdmRepoDefinition[] {
  if (!manifestPath) {
    return DEFAULT_REPOSITORIES;
  }

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const content = fs.readFileSync(manifestPath, 'utf-8');
  const parsed = JSON.parse(content) as { repositories?: RdmRepoDefinition[] };

  if (!parsed.repositories || !Array.isArray(parsed.repositories) || parsed.repositories.length === 0) {
    throw new Error(`Manifest does not contain repositories array: ${manifestPath}`);
  }

  return parsed.repositories;
}

function discoverRepositories(definitions: RdmRepoDefinition[], cwd: string): RepoDiscovery[] {
  const externalRoot = process.env.RDM_REPOS_ROOT?.trim();

  return definitions.map(definition => {
    const candidatePaths = [...definition.pathCandidates];

    if (externalRoot) {
      candidatePaths.unshift(path.join(externalRoot, definition.name));
    }

    const resolvedPath = candidatePaths
      .map(candidate => path.resolve(cwd, candidate))
      .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());

    return {
      definition,
      resolvedPath,
      exists: Boolean(resolvedPath)
    };
  });
}

function listFilesRecursive(directoryPath: string, prefix = ''): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const relativePath = path.join(prefix, entry.name);
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath, relativePath));
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

function ensureDirectory(filePath: string): void {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function checksum(content: Buffer): string {
  let hash = 0;

  for (const byte of content) {
    hash = (hash * 31 + byte) >>> 0;
  }

  return hash.toString(16);
}

function syncRepository(
  discovery: RepoDiscovery,
  options: CliOptions
): FileSyncEntry[] {
  if (!discovery.exists || !discovery.resolvedPath) {
    return [];
  }

  const files = listFilesRecursive(discovery.resolvedPath);

  return files.map(relativePath => {
    const source = path.join(discovery.resolvedPath as string, relativePath);
    const target = path.join(
      options.federationDirectory,
      discovery.definition.targetSubdirectory,
      relativePath
    );

    if (!fs.existsSync(source)) {
      return {
        source,
        target,
        bytes: 0,
        status: 'missing'
      };
    }

    const sourceContent = fs.readFileSync(source);

    if (fs.existsSync(target)) {
      const targetContent = fs.readFileSync(target);

      if (checksum(targetContent) === checksum(sourceContent)) {
        return {
          source,
          target,
          bytes: sourceContent.byteLength,
          status: 'unchanged'
        };
      }
    }

    if (options.execute) {
      ensureDirectory(target);
      fs.writeFileSync(target, sourceContent);
    }

    return {
      source,
      target,
      bytes: sourceContent.byteLength,
      status: 'copied'
    };
  });
}

export function runRdmIntegration(options: CliOptions): RdmIntegrationReport {
  const repositories = loadManifest(options.manifestPath);
  const discovered = discoverRepositories(repositories, options.rootDirectory);

  const syncedFiles: FileSyncEntry[] = [];

  for (const repo of discovered) {
    syncedFiles.push(...syncRepository(repo, options));
  }

  const missingRepositories = discovered
    .filter(repo => !repo.exists)
    .map(repo => repo.definition.name);

  const warnings: string[] = [];

  if (missingRepositories.length > 0) {
    warnings.push(
      `Missing repositories (${missingRepositories.length}): ${missingRepositories.join(', ')}`
    );
  }

  if (options.execute && !fs.existsSync(options.federationDirectory)) {
    fs.mkdirSync(options.federationDirectory, { recursive: true });
  }

  const report: RdmIntegrationReport = {
    timestamp: new Date().toISOString(),
    mode: options.execute ? 'execute' : 'dry-run',
    rootDirectory: options.rootDirectory,
    federationDirectory: options.federationDirectory,
    discovered,
    syncedFiles,
    missingRepositories,
    warnings
  };

  ensureDirectory(options.reportPath);
  fs.writeFileSync(options.reportPath, JSON.stringify(report, null, 2));

  return report;
}

function printReport(report: RdmIntegrationReport): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('               RDM DIGITAL FEDERATED INTEGRATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Mode: ${report.mode}`);
  console.log(`Discovered repositories: ${report.discovered.filter(item => item.exists).length}/${report.discovered.length}`);
  console.log(`Synced files: ${report.syncedFiles.length}`);
  console.log(`Missing repositories: ${report.missingRepositories.length}`);

  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    report.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
  }

  console.log('\nRepository status:');
  report.discovered.forEach(item => {
    const status = item.exists ? '✅' : '❌';
    console.log(`  ${status} ${item.definition.name} [${item.definition.layer}]`);
    if (item.resolvedPath) {
      console.log(`      → ${item.resolvedPath}`);
    }
  });
}

if (require.main === module) {
  const options = parseArgs(process.argv.slice(2), process.cwd());
  const report = runRdmIntegration(options);
  printReport(report);
}

export { parseArgs, discoverRepositories, loadManifest, syncRepository, listFilesRecursive };
