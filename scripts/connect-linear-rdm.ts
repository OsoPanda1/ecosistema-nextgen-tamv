#!/usr/bin/env node
/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_REPOSITORIES, type RdmRepoDefinition } from './integrate-rdm-repos';

interface LinearIssuePayload {
  title: string;
  description: string;
  teamId: string;
}

interface LinearResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface CreateIssueResult {
  issueCreate: {
    success: boolean;
    issue?: {
      id: string;
      identifier: string;
      title: string;
      url?: string;
    };
  };
}

interface CliOptions {
  manifestPath?: string;
  dryRun: boolean;
  teamId?: string;
}

function parseArgs(argv: string[], cwd: string): CliOptions {
  const manifestPathIndex = argv.findIndex(arg => arg === '--manifest');
  const manifestPath = manifestPathIndex !== -1 && argv[manifestPathIndex + 1]
    ? path.resolve(cwd, argv[manifestPathIndex + 1])
    : undefined;

  return {
    manifestPath,
    dryRun: argv.includes('--dry-run') || argv.includes('-d'),
    teamId: process.env.LINEAR_TEAM_ID
  };
}

function loadRepositories(manifestPath?: string): RdmRepoDefinition[] {
  if (!manifestPath) {
    return DEFAULT_REPOSITORIES;
  }

  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const parsed = JSON.parse(raw) as { repositories?: RdmRepoDefinition[] };

  if (!parsed.repositories || !Array.isArray(parsed.repositories) || parsed.repositories.length === 0) {
    throw new Error('Manifest inválido: no contiene repositories.');
  }

  return parsed.repositories;
}

async function linearRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error('Falta LINEAR_API_KEY en variables de entorno.');
  }

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Linear API HTTP ${response.status}`);
  }

  const body = await response.json() as LinearResponse<T>;

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map(error => error.message).join('; '));
  }

  if (!body.data) {
    throw new Error('Linear API devolvió respuesta vacía.');
  }

  return body.data;
}

function buildIssue(repo: RdmRepoDefinition, previousRepo?: RdmRepoDefinition): Omit<LinearIssuePayload, 'teamId'> {
  const serialDependency = previousRepo
    ? `\n\nDependencia en serie: conectar después de **${previousRepo.name}**.`
    : '\n\nInicio de la cadena serial de integración.';

  return {
    title: `[RDM][${repo.layer}] Conectar repo ${repo.name}`,
    description: [
      `Objetivo: interconectar **${repo.name}** dentro de TAMV federation.`,
      `Destino sugerido: \`${repo.targetSubdirectory}\`.`,
      `Descripción: ${repo.description}.`,
      serialDependency,
      '\nChecklist mínimo:',
      '- [ ] Resolver rutas reales del repositorio fuente',
      '- [ ] Ejecutar integración en modo dry-run',
      '- [ ] Validar pruebas del dominio impactado',
      '- [ ] Ejecutar sincronización final'
    ].join('\n')
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2), process.cwd());
  const repositories = loadRepositories(options.manifestPath);
  const teamId = options.teamId;

  if (!options.dryRun && !teamId) {
    throw new Error('Falta LINEAR_TEAM_ID en variables de entorno para ejecución real.');
  }

  console.log(`Repos detectados para conexión serial: ${repositories.length}`);

  let previous: RdmRepoDefinition | undefined;
  for (const repo of repositories) {
    const issueData = buildIssue(repo, previous);

    if (options.dryRun) {
      console.log(`- [DRY-RUN] ${issueData.title}`);
      previous = repo;
      continue;
    }

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    const data = await linearRequest<CreateIssueResult>(mutation, {
      input: {
        title: issueData.title,
        description: issueData.description,
        teamId
      }
    });

    const created = data.issueCreate.issue;
    if (data.issueCreate.success && created) {
      console.log(`- [OK] ${created.identifier}: ${created.title} (${created.url ?? 'sin URL'})`);
    } else {
      console.log(`- [WARN] No se pudo crear issue para ${repo.name}`);
    }

    previous = repo;
  }
}

main().catch(error => {
  console.error(`Error: ${(error as Error).message}`);
  process.exit(1);
});
