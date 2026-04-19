import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  discoverRepositories,
  runRdmIntegration,
  RdmRepoDefinition,
  listFilesRecursive
} from '../../scripts/integrate-rdm-repos';

describe('RDM Federated Integration', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rdm-integration-'));

  afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('discovers repositories from candidate paths', () => {
    const repoDir = path.join(tempRoot, 'repo-a');
    fs.mkdirSync(repoDir, { recursive: true });

    const definitions: RdmRepoDefinition[] = [
      {
        name: 'repo-a',
        layer: 'L2',
        pathCandidates: ['./repo-a'],
        targetSubdirectory: 'protocols/repo-a',
        description: 'test'
      }
    ];

    const discovered = discoverRepositories(definitions, tempRoot);

    expect(discovered[0].exists).toBe(true);
    expect(discovered[0].resolvedPath).toBe(repoDir);
  });

  it('syncs discovered repository files into federation directory on execute mode', () => {
    const root = path.join(tempRoot, 'run-execute');
    const sourceRepo = path.join(root, 'repo-b');
    const targetDir = path.join(root, 'integration-out');
    const reportPath = path.join(root, 'integration-report.json');

    fs.mkdirSync(path.join(sourceRepo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(sourceRepo, 'src', 'index.ts'), 'export const ready = true;');

    const manifestPath = path.join(root, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          repositories: [
            {
              name: 'repo-b',
              layer: 'L5',
              pathCandidates: ['./repo-b'],
              targetSubdirectory: 'domain/repo-b',
              description: 'domain integration'
            }
          ]
        },
        null,
        2
      )
    );

    const report = runRdmIntegration({
      execute: true,
      rootDirectory: root,
      federationDirectory: targetDir,
      reportPath,
      manifestPath
    });

    const copiedFile = path.join(targetDir, 'domain/repo-b/src/index.ts');

    expect(report.syncedFiles.length).toBe(1);
    expect(fs.existsSync(copiedFile)).toBe(true);
    expect(report.missingRepositories).toEqual([]);
  });

  it('lists files recursively while excluding known transient directories', () => {
    const root = path.join(tempRoot, 'list-files');
    fs.mkdirSync(path.join(root, 'node_modules', 'pkg'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'main.ts'), 'ok');
    fs.writeFileSync(path.join(root, 'node_modules', 'pkg', 'a.js'), 'excluded');

    const files = listFilesRecursive(root);

    expect(files).toContain(path.join('src', 'main.ts'));
    expect(files.some(file => file.includes('node_modules'))).toBe(false);
  });
});
