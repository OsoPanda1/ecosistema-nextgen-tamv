/**
 * Unit tests for File System Analyzer
 * 
 * Tests the duplicate detection functionality for the TAMV project cleanup.
 * Requirements: 1.2, 2.1, 2.2
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  analyzeDuplicateFolders,
  analyzeDuplicateDocumentation,
  findEmptyDirectories,
  generateAnalysisReport,
  calculateCompletenessScore,
  calculateRecencyScore,
  calculateCodeQualityScore,
  calculateQualityScore,
  addQualityScores
} from '../../scripts/analyze-duplicates';

describe('File System Analyzer', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tamv-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('analyzeDuplicateFolders', () => {
    it('should identify duplicate project folders', () => {
      // Create test duplicate folders
      const duplicateFolders = [
        'TAMV-COMPLETE-PROJECT',
        'TAMV-ENHANCED-ARCHITECTURE',
        'TAMV-FINAL-PRODUCTION-READY',
        'tamv-enhanced-complete-bundle'
      ];

      for (const folder of duplicateFolders) {
        const folderPath = path.join(tempDir, folder);
        fs.mkdirSync(folderPath);
        // Add a test file to make it non-empty
        fs.writeFileSync(path.join(folderPath, 'test.txt'), 'test content');
      }

      const result = analyzeDuplicateFolders(tempDir);

      expect(result).toHaveLength(4);
      expect(result.map(f => f.name)).toEqual(expect.arrayContaining(duplicateFolders));
      
      // Verify each folder has correct properties
      for (const folder of result) {
        expect(folder.fileCount).toBeGreaterThan(0);
        expect(folder.totalSize).toBeGreaterThan(0);
        expect(typeof folder.lastModified).toBe('object');
        expect(folder.lastModified).toBeTruthy();
        expect(folder.isEmpty).toBe(false);
      }
    });

    it('should detect empty duplicate folders', () => {
      const folderPath = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
      fs.mkdirSync(folderPath);

      const result = analyzeDuplicateFolders(tempDir);

      expect(result).toHaveLength(1);
      expect(result[0].isEmpty).toBe(true);
      expect(result[0].fileCount).toBe(0);
      expect(result[0].totalSize).toBe(0);
    });

    it('should return empty array when no duplicate folders exist', () => {
      const result = analyzeDuplicateFolders(tempDir);
      expect(result).toHaveLength(0);
    });

    it('should calculate file count correctly for nested directories', () => {
      const folderPath = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
      fs.mkdirSync(folderPath);
      fs.mkdirSync(path.join(folderPath, 'src'));
      fs.mkdirSync(path.join(folderPath, 'src', 'components'));
      
      fs.writeFileSync(path.join(folderPath, 'file1.txt'), 'content1');
      fs.writeFileSync(path.join(folderPath, 'src', 'file2.txt'), 'content2');
      fs.writeFileSync(path.join(folderPath, 'src', 'components', 'file3.txt'), 'content3');

      const result = analyzeDuplicateFolders(tempDir);

      expect(result).toHaveLength(1);
      expect(result[0].fileCount).toBe(3);
    });
  });

  describe('analyzeDuplicateDocumentation', () => {
    it('should identify duplicate documentation files at root level', () => {
      // Create test documentation files
      const docFiles = [
        'README.md',
        'README-GITHUB.md',
        'LEEME-PRIMERO.md',
        'INSTRUCCIONES-FINALES.md',
        'PLAN-EJECUCION-INMEDIATO.md',
        'TAMV-MASTER-DOCUMENTATION.md',
        'CONTRIBUTING.md'
      ];

      for (const file of docFiles) {
        fs.writeFileSync(path.join(tempDir, file), `# ${file}\n\nTest content`);
      }

      const result = analyzeDuplicateDocumentation(tempDir);

      expect(result.length).toBeGreaterThanOrEqual(docFiles.length);
      
      // Verify each file has correct properties
      for (const file of result) {
        expect(file.name).toBeTruthy();
        expect(file.path).toContain(tempDir);
        expect(file.size).toBeGreaterThan(0);
        expect(typeof file.lastModified).toBe('object');
        expect(file.lastModified).toBeTruthy();
      }
    });

    it('should match various documentation patterns', () => {
      const patterns = [
        'README.md',
        'README-SOMETHING.md',
        'LEEME.md',
        'INSTRUCCIONES-TEST.md',
        'PLAN-TEST.md',
        'REPORTE-TEST.md',
        'RESUMEN-TEST.md',
        'IMPLEMENTACION-TEST.md',
        'TAMV-TEST.md',
        'ROADMAP-TEST.md',
        'CONSOLIDATION-TEST.md',
        'CLEANUP-TEST.md',
        'DEPLOYMENT-TEST.md',
        'LOGROS-TEST.md',
        'CONTRIBUTING.md',
        'SAAS-TEST.md',
        'CGIFTS-TEST.md',
        'EDWIN-TEST.md'
      ];

      for (const file of patterns) {
        fs.writeFileSync(path.join(tempDir, file), 'test');
      }

      const result = analyzeDuplicateDocumentation(tempDir);

      expect(result.length).toBe(patterns.length);
    });

    it('should not include non-documentation files', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');
      fs.writeFileSync(path.join(tempDir, 'index.ts'), 'code');
      fs.writeFileSync(path.join(tempDir, 'test.txt'), 'text');

      const result = analyzeDuplicateDocumentation(tempDir);

      expect(result).toHaveLength(0);
    });

    it('should only scan root level, not subdirectories', () => {
      // Create doc in root
      fs.writeFileSync(path.join(tempDir, 'README.md'), 'root');
      
      // Create doc in subdirectory
      const subDir = path.join(tempDir, 'docs');
      fs.mkdirSync(subDir);
      fs.writeFileSync(path.join(subDir, 'README.md'), 'sub');

      const result = analyzeDuplicateDocumentation(tempDir);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('README.md');
      expect(result[0].path).toBe(path.join(tempDir, 'README.md'));
    });
  });

  describe('findEmptyDirectories', () => {
    it('should identify empty directories', () => {
      fs.mkdirSync(path.join(tempDir, 'empty1'));
      fs.mkdirSync(path.join(tempDir, 'empty2'));
      fs.mkdirSync(path.join(tempDir, 'nonempty'));
      fs.writeFileSync(path.join(tempDir, 'nonempty', 'file.txt'), 'content');

      const result = findEmptyDirectories(tempDir);

      expect(result).toHaveLength(2);
      expect(result).toContain('empty1');
      expect(result).toContain('empty2');
      expect(result).not.toContain('nonempty');
    });

    it('should identify nested empty directories', () => {
      fs.mkdirSync(path.join(tempDir, 'parent'));
      fs.mkdirSync(path.join(tempDir, 'parent', 'empty-child'));
      fs.mkdirSync(path.join(tempDir, 'parent', 'nonempty-child'));
      fs.writeFileSync(path.join(tempDir, 'parent', 'nonempty-child', 'file.txt'), 'content');

      const result = findEmptyDirectories(tempDir);

      expect(result).toContain(path.join('parent', 'empty-child'));
      expect(result).not.toContain('parent');
      expect(result).not.toContain(path.join('parent', 'nonempty-child'));
    });

    it('should treat directory with only empty subdirectories as empty', () => {
      fs.mkdirSync(path.join(tempDir, 'parent'));
      fs.mkdirSync(path.join(tempDir, 'parent', 'empty-child1'));
      fs.mkdirSync(path.join(tempDir, 'parent', 'empty-child2'));

      const result = findEmptyDirectories(tempDir);

      expect(result).toContain('parent');
    });

    it('should return empty array when no empty directories exist', () => {
      fs.mkdirSync(path.join(tempDir, 'dir1'));
      fs.writeFileSync(path.join(tempDir, 'dir1', 'file.txt'), 'content');

      const result = findEmptyDirectories(tempDir);

      expect(result).toHaveLength(0);
    });

    it('should exclude node_modules and other excluded directories', () => {
      fs.mkdirSync(path.join(tempDir, 'node_modules'));
      fs.mkdirSync(path.join(tempDir, '.git'));
      fs.mkdirSync(path.join(tempDir, '.kiro'));

      const result = findEmptyDirectories(tempDir);

      expect(result).not.toContain('node_modules');
      expect(result).not.toContain('.git');
      expect(result).not.toContain('.kiro');
    });
  });

  describe('generateAnalysisReport', () => {
    it('should generate complete analysis report', () => {
      // Create test structure
      fs.mkdirSync(path.join(tempDir, 'TAMV-COMPLETE-PROJECT'));
      fs.writeFileSync(path.join(tempDir, 'TAMV-COMPLETE-PROJECT', 'test.txt'), 'content');
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# README');
      fs.mkdirSync(path.join(tempDir, 'empty-dir'));

      const report = generateAnalysisReport(tempDir);

      expect(report).toHaveProperty('timestamp');
      expect(report.timestamp).toBeInstanceOf(Date);
      
      expect(report).toHaveProperty('duplicateFolders');
      expect(report.duplicateFolders).toHaveLength(1);
      
      expect(report).toHaveProperty('duplicateDocumentationFiles');
      expect(report.duplicateDocumentationFiles.length).toBeGreaterThan(0);
      
      expect(report).toHaveProperty('emptyDirectories');
      expect(report.emptyDirectories).toContain('empty-dir');
      
      expect(report).toHaveProperty('summary');
      expect(report.summary.totalDuplicateFolders).toBe(1);
      expect(report.summary.totalDuplicateFiles).toBeGreaterThan(0);
      expect(report.summary.totalEmptyDirectories).toBeGreaterThan(0);
      expect(report.summary.estimatedSpaceSavings).toBeGreaterThan(0);
    });

    it('should calculate space savings correctly', () => {
      // Create duplicate folder with known size
      const folderPath = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
      fs.mkdirSync(folderPath);
      const content = 'x'.repeat(1000); // 1000 bytes
      fs.writeFileSync(path.join(folderPath, 'file.txt'), content);
      
      // Create duplicate doc with known size
      fs.writeFileSync(path.join(tempDir, 'README.md'), 'test'); // 4 bytes

      const report = generateAnalysisReport(tempDir);

      expect(report.summary.estimatedSpaceSavings).toBeGreaterThan(1000);
    });

    it('should handle empty project gracefully', () => {
      const report = generateAnalysisReport(tempDir);

      expect(report.summary.totalDuplicateFolders).toBe(0);
      expect(report.summary.totalDuplicateFiles).toBe(0);
      expect(report.summary.estimatedSpaceSavings).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle permission errors gracefully', () => {
      // This test is platform-dependent and may not work on all systems
      // Just verify it doesn't crash
      const result = analyzeDuplicateFolders('/root/nonexistent');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very deep directory structures', () => {
      let currentPath = tempDir;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      fs.writeFileSync(path.join(currentPath, 'deep-file.txt'), 'content');

      // Wrap in TAMV folder
      const tamvPath = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
      fs.renameSync(path.join(tempDir, 'level0'), tamvPath);

      const result = analyzeDuplicateFolders(tempDir);

      expect(result).toHaveLength(1);
      expect(result[0].fileCount).toBe(1);
    });

    it('should handle special characters in filenames', () => {
      const specialFiles = [
        'README (copy).md',
        'PLAN-2024.md',
        'TAMV_DOCS.md'
      ];

      for (const file of specialFiles) {
        fs.writeFileSync(path.join(tempDir, file), 'content');
      }

      const result = analyzeDuplicateDocumentation(tempDir);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Scoring System', () => {
    describe('calculateCompletenessScore', () => {
      it('should score based on file count', () => {
        const folderPath = path.join(tempDir, 'test-folder');
        fs.mkdirSync(folderPath);
        
        // Create multiple files
        for (let i = 0; i < 50; i++) {
          fs.writeFileSync(path.join(folderPath, `file${i}.txt`), 'content');
        }

        const score = calculateCompletenessScore(folderPath);
        
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      });

      it('should score higher for projects with key directories', () => {
        const folderPath = path.join(tempDir, 'complete-project');
        fs.mkdirSync(folderPath);
        
        // Create key directories
        const keyDirs = ['src', 'tests', 'docs', 'backend', 'frontend'];
        for (const dir of keyDirs) {
          fs.mkdirSync(path.join(folderPath, dir));
          fs.writeFileSync(path.join(folderPath, dir, 'file.txt'), 'content');
        }

        const score = calculateCompletenessScore(folderPath);
        
        expect(score).toBeGreaterThan(25); // Should have depth score (5/8 key dirs = 25 points)
      });

      it('should score higher for projects with configuration files', () => {
        const folderPath = path.join(tempDir, 'configured-project');
        fs.mkdirSync(folderPath);
        
        // Create configuration files
        fs.writeFileSync(path.join(folderPath, 'package.json'), '{}');
        fs.writeFileSync(path.join(folderPath, 'tsconfig.json'), '{}');
        fs.writeFileSync(path.join(folderPath, '.eslintrc.json'), '{}');
        fs.writeFileSync(path.join(folderPath, 'jest.config.js'), '');

        const score = calculateCompletenessScore(folderPath);
        
        expect(score).toBeGreaterThan(0);
      });

      it('should return 0 for empty folder', () => {
        const folderPath = path.join(tempDir, 'empty-folder');
        fs.mkdirSync(folderPath);

        const score = calculateCompletenessScore(folderPath);
        
        expect(score).toBe(0);
      });

      it('should cap score at 100', () => {
        const folderPath = path.join(tempDir, 'huge-project');
        fs.mkdirSync(folderPath);
        
        // Create many files
        for (let i = 0; i < 200; i++) {
          fs.writeFileSync(path.join(folderPath, `file${i}.txt`), 'content');
        }
        
        // Create all key directories
        const keyDirs = ['src', 'backend', 'frontend', 'tests', 'docs', 'infrastructure', 'database', 'scripts'];
        for (const dir of keyDirs) {
          fs.mkdirSync(path.join(folderPath, dir));
        }
        
        // Create all config files
        fs.writeFileSync(path.join(folderPath, 'package.json'), '{}');
        fs.writeFileSync(path.join(folderPath, 'tsconfig.json'), '{}');
        fs.writeFileSync(path.join(folderPath, '.eslintrc.json'), '{}');
        fs.writeFileSync(path.join(folderPath, 'jest.config.js'), '');
        fs.writeFileSync(path.join(folderPath, 'docker-compose.yml'), '');
        fs.writeFileSync(path.join(folderPath, 'Dockerfile'), '');

        const score = calculateCompletenessScore(folderPath);
        
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    describe('calculateRecencyScore', () => {
      it('should give 100 for very recent modifications (within 7 days)', () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 3); // 3 days ago

        const score = calculateRecencyScore(recentDate);
        
        expect(score).toBe(100);
      });

      it('should give lower score for older modifications (30 days)', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30);

        const score = calculateRecencyScore(oldDate);
        
        expect(score).toBeGreaterThan(70);
        expect(score).toBeLessThan(100);
      });

      it('should give much lower score for very old modifications (180+ days)', () => {
        const veryOldDate = new Date();
        veryOldDate.setDate(veryOldDate.getDate() - 200);

        const score = calculateRecencyScore(veryOldDate);
        
        expect(score).toBeLessThan(20);
      });

      it('should give 0 for modifications over a year old', () => {
        const ancientDate = new Date();
        ancientDate.setFullYear(ancientDate.getFullYear() - 2);

        const score = calculateRecencyScore(ancientDate);
        
        expect(score).toBe(0);
      });

      it('should handle edge case of today', () => {
        const today = new Date();

        const score = calculateRecencyScore(today);
        
        expect(score).toBe(100);
      });
    });

    describe('calculateCodeQualityScore', () => {
      it('should score based on test coverage', () => {
        const folderPath = path.join(tempDir, 'tested-project');
        fs.mkdirSync(folderPath);
        
        // Create code files
        fs.writeFileSync(path.join(folderPath, 'index.ts'), 'code');
        fs.writeFileSync(path.join(folderPath, 'utils.ts'), 'code');
        
        // Create test files (1:1 ratio)
        fs.writeFileSync(path.join(folderPath, 'index.test.ts'), 'test');
        fs.writeFileSync(path.join(folderPath, 'utils.test.ts'), 'test');

        const score = calculateCodeQualityScore(folderPath);
        
        // With 1:1 test ratio, should get 40 points for test coverage
        // But no TypeScript config or ESLint, so total should be around 40
        expect(score).toBeGreaterThanOrEqual(20);
        expect(score).toBeLessThanOrEqual(60);
      });

      it('should give points for TypeScript usage', () => {
        const folderPath = path.join(tempDir, 'ts-project');
        fs.mkdirSync(folderPath);
        
        fs.writeFileSync(path.join(folderPath, 'tsconfig.json'), '{}');

        const score = calculateCodeQualityScore(folderPath);
        
        expect(score).toBeGreaterThanOrEqual(20);
      });

      it('should give points for ESLint configuration', () => {
        const folderPath = path.join(tempDir, 'linted-project');
        fs.mkdirSync(folderPath);
        
        fs.writeFileSync(path.join(folderPath, '.eslintrc.json'), '{}');

        const score = calculateCodeQualityScore(folderPath);
        
        expect(score).toBeGreaterThanOrEqual(20);
      });

      it('should give points for organized structure', () => {
        const folderPath = path.join(tempDir, 'organized-project');
        fs.mkdirSync(folderPath);
        
        fs.mkdirSync(path.join(folderPath, 'src'));
        fs.mkdirSync(path.join(folderPath, 'tests'));
        fs.writeFileSync(path.join(folderPath, 'src', 'index.ts'), 'code');
        fs.writeFileSync(path.join(folderPath, 'tests', 'test.ts'), 'test');

        const score = calculateCodeQualityScore(folderPath);
        
        expect(score).toBeGreaterThanOrEqual(20);
      });

      it('should return 0 for empty folder', () => {
        const folderPath = path.join(tempDir, 'empty-quality');
        fs.mkdirSync(folderPath);

        const score = calculateCodeQualityScore(folderPath);
        
        expect(score).toBe(0);
      });

      it('should handle projects with no tests', () => {
        const folderPath = path.join(tempDir, 'untested-project');
        fs.mkdirSync(folderPath);
        
        fs.writeFileSync(path.join(folderPath, 'index.ts'), 'code');
        fs.writeFileSync(path.join(folderPath, 'utils.ts'), 'code');

        const score = calculateCodeQualityScore(folderPath);
        
        // Should still get some points for having code files
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThan(40); // But not full test coverage points
      });
    });

    describe('calculateQualityScore', () => {
      it('should return all score components', () => {
        const folderPath = path.join(tempDir, 'quality-test');
        fs.mkdirSync(folderPath);
        
        // Create a reasonably complete project
        fs.mkdirSync(path.join(folderPath, 'src'));
        fs.writeFileSync(path.join(folderPath, 'src', 'index.ts'), 'code');
        fs.writeFileSync(path.join(folderPath, 'package.json'), '{}');
        fs.writeFileSync(path.join(folderPath, 'tsconfig.json'), '{}');
        
        const lastModified = new Date();
        lastModified.setDate(lastModified.getDate() - 5); // 5 days ago

        const score = calculateQualityScore(folderPath, lastModified);
        
        expect(score).toHaveProperty('completeness');
        expect(score).toHaveProperty('recency');
        expect(score).toHaveProperty('codeQuality');
        expect(score).toHaveProperty('overall');
        
        expect(score.completeness).toBeGreaterThanOrEqual(0);
        expect(score.completeness).toBeLessThanOrEqual(100);
        expect(score.recency).toBeGreaterThanOrEqual(0);
        expect(score.recency).toBeLessThanOrEqual(100);
        expect(score.codeQuality).toBeGreaterThanOrEqual(0);
        expect(score.codeQuality).toBeLessThanOrEqual(100);
        expect(score.overall).toBeGreaterThanOrEqual(0);
        expect(score.overall).toBeLessThanOrEqual(100);
      });

      it('should calculate weighted average correctly', () => {
        const folderPath = path.join(tempDir, 'weighted-test');
        fs.mkdirSync(folderPath);
        
        const lastModified = new Date();

        const score = calculateQualityScore(folderPath, lastModified);
        
        // Overall should be weighted average: 40% completeness + 30% recency + 30% quality
        const expectedOverall = Math.round(
          score.completeness * 0.4 +
          score.recency * 0.3 +
          score.codeQuality * 0.3
        );
        
        expect(score.overall).toBe(expectedOverall);
      });

      it('should handle very old projects', () => {
        const folderPath = path.join(tempDir, 'old-project');
        fs.mkdirSync(folderPath);
        
        const veryOldDate = new Date();
        veryOldDate.setFullYear(veryOldDate.getFullYear() - 2);

        const score = calculateQualityScore(folderPath, veryOldDate);
        
        expect(score.recency).toBe(0);
        expect(score.overall).toBeLessThan(50); // Should be low due to old date
      });
    });

    describe('addQualityScores', () => {
      it('should add quality scores to all folders', () => {
        // Create test folders
        const folder1 = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
        const folder2 = path.join(tempDir, 'TAMV-ENHANCED-ARCHITECTURE');
        
        fs.mkdirSync(folder1);
        fs.mkdirSync(folder2);
        fs.writeFileSync(path.join(folder1, 'file.txt'), 'content');
        fs.writeFileSync(path.join(folder2, 'file.txt'), 'content');

        const folders = analyzeDuplicateFolders(tempDir);
        const scoredFolders = addQualityScores(folders);

        expect(scoredFolders).toHaveLength(2);
        
        for (const folder of scoredFolders) {
          expect(folder).toHaveProperty('qualityScore');
          expect(folder.qualityScore).toHaveProperty('completeness');
          expect(folder.qualityScore).toHaveProperty('recency');
          expect(folder.qualityScore).toHaveProperty('codeQuality');
          expect(folder.qualityScore).toHaveProperty('overall');
        }
      });

      it('should preserve original folder properties', () => {
        const folder1 = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
        fs.mkdirSync(folder1);
        fs.writeFileSync(path.join(folder1, 'file.txt'), 'content');

        const folders = analyzeDuplicateFolders(tempDir);
        const originalFolder = folders[0];
        const scoredFolders = addQualityScores(folders);
        const scoredFolder = scoredFolders[0];

        expect(scoredFolder.name).toBe(originalFolder.name);
        expect(scoredFolder.path).toBe(originalFolder.path);
        expect(scoredFolder.fileCount).toBe(originalFolder.fileCount);
        expect(scoredFolder.totalSize).toBe(originalFolder.totalSize);
        expect(scoredFolder.isEmpty).toBe(originalFolder.isEmpty);
      });

      it('should handle empty array', () => {
        const scoredFolders = addQualityScores([]);
        
        expect(scoredFolders).toHaveLength(0);
      });
    });

    describe('Integration with generateAnalysisReport', () => {
      it('should include quality scores in generated report', () => {
        // Create test structure
        const folderPath = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
        fs.mkdirSync(folderPath);
        fs.mkdirSync(path.join(folderPath, 'src'));
        fs.writeFileSync(path.join(folderPath, 'src', 'index.ts'), 'code');
        fs.writeFileSync(path.join(folderPath, 'package.json'), '{}');

        const report = generateAnalysisReport(tempDir);

        expect(report.duplicateFolders).toHaveLength(1);
        expect(report.duplicateFolders[0]).toHaveProperty('qualityScore');
        
        const qualityScore = report.duplicateFolders[0].qualityScore;
        expect(qualityScore).toBeDefined();
        expect(qualityScore?.overall).toBeGreaterThanOrEqual(0);
        expect(qualityScore?.overall).toBeLessThanOrEqual(100);
      });

      it('should rank folders by quality score', () => {
        // Create two folders with different quality
        const goodFolder = path.join(tempDir, 'TAMV-COMPLETE-PROJECT');
        const poorFolder = path.join(tempDir, 'TAMV-ENHANCED-ARCHITECTURE');
        
        fs.mkdirSync(goodFolder);
        fs.mkdirSync(poorFolder);
        
        // Make good folder more complete
        fs.mkdirSync(path.join(goodFolder, 'src'));
        fs.mkdirSync(path.join(goodFolder, 'tests'));
        fs.writeFileSync(path.join(goodFolder, 'src', 'index.ts'), 'code');
        fs.writeFileSync(path.join(goodFolder, 'tests', 'test.ts'), 'test');
        fs.writeFileSync(path.join(goodFolder, 'package.json'), '{}');
        fs.writeFileSync(path.join(goodFolder, 'tsconfig.json'), '{}');
        
        // Make poor folder minimal
        fs.writeFileSync(path.join(poorFolder, 'file.txt'), 'content');

        const report = generateAnalysisReport(tempDir);

        expect(report.duplicateFolders).toHaveLength(2);
        
        const goodFolderScore = report.duplicateFolders.find(f => f.name === 'TAMV-COMPLETE-PROJECT')?.qualityScore?.overall || 0;
        const poorFolderScore = report.duplicateFolders.find(f => f.name === 'TAMV-ENHANCED-ARCHITECTURE')?.qualityScore?.overall || 0;
        
        expect(goodFolderScore).toBeGreaterThan(poorFolderScore);
      });
    });
  });
});
