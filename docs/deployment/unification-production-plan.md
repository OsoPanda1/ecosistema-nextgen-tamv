# TAMV GitHub Unification & Production Deployment Plan

**Purpose:** Provide a practical, production-focused plan to unify TAMV-related repositories into a single functional project (this repo), and outline deployment readiness tasks. This plan is built from the contents of the current repository and does **not** include external GitHub profile analysis because it is unavailable from the local workspace.

## 1) Current Repository Baseline (Local Analysis)

### Canonical top-level structure
The repository already contains a canonical structure aligned to a unified monorepo model:

- `frontend/` – UI application(s)
- `backend/` – API/services
- `database/` – schema and migration assets
- `infrastructure/` – Terraform/Kubernetes/IaC
- `docs/` – documentation
- `scripts/` – automation
- `tests/` – test suites

### Consolidation status
The existing unification report documents a significant consolidation effort and a clear roadmap to complete unification and production readiness.

## 2) Unification Strategy (Single-Repo, Production-Ready)

### A. Inventory and classification
1. **Classify directories** by function (frontend, backend, infra, docs, scripts, tests, assets).
2. **Identify duplicates** and archive superseded content into `ARCHIVE/`.
3. **Choose a single source of truth** for each component based on recency, completeness, and tests.

### B. Component consolidation mapping
| Domain | Primary Location | Notes |
| --- | --- | --- |
| Frontend | `frontend/` | Consolidate all UI variants here; remove duplicates elsewhere. |
| Backend | `backend/` | Centralize APIs and services; ensure a single entrypoint. |
| Database | `database/` | Single source for schemas and migrations. |
| Infra | `infrastructure/` | Single deployable IaC stack. |
| Docs | `docs/` | Merge overlapping docs and delete duplicates. |
| Scripts | `scripts/` | Keep only canonical deploy and dev scripts. |

### C. Production “single source of truth” rules
- **One** backend entrypoint (e.g., `backend/src/index.ts`).
- **One** frontend entrypoint (e.g., `frontend/src/app.tsx` or Next.js root).
- **One** Docker Compose file (root `docker-compose.yml`).
- **One** set of environment variables (`.env.example`).
- **One** deployment pipeline (e.g., `infrastructure/`).

### D. Federated 7-layer architecture requirements
Unification must preserve the canonical 7-layer federated model as first-class architecture:

1. **Layer 1: Ontological** – Defines system invariants and non-negotiable constraints.
2. **Layer 2: Constitutional** – Rights, duties, and sovereignty rules.
3. **Layer 3: Political/Jurisdictional** – Governance, policy enforcement, and oversight.
4. **Layer 4: Economic** – FairSplit, value circulation, and non-extractive design.
5. **Layer 5: Cognitive/Algorithmic** – Ethical AI constraints and human oversight.
6. **Layer 6: Technical/Infrastructure** – Runtime execution, orchestration, and observability.
7. **Layer 7: Historical/Memorial** – Immutable records and traceability.

These layers must be mapped into a single cohesive architecture document and validated in implementation, not only in narrative documentation.

### E. Required TAMV systems to integrate
The unified project must explicitly include these systems and their interfaces in the single canonical codebase:

- **Isabella AI** with an owned **TAMVAI API** (separate service boundary with clear contracts).
- **BOOKPI** as a first-party knowledge subsystem with storage and retrieval primitives.
- **Blockchain MSR** for antifraud anchoring and integrity guarantees.
- **EOCT** as the internal continuity and recovery protocol.

Each subsystem must have a defined API surface, deployment unit, and configuration schema aligned with production environments.

## 3) Deployment Hardening Checklist

### A. Application
- Confirm API and UI run locally with canonical commands.
- Ensure strict TypeScript builds for frontend and backend.
- Add/verify health endpoints in backend.

### B. Security
- JWT auth + RBAC in backend.
- Input validation and output sanitization.
- CORS policy aligned with production domains.

### C. Infrastructure
- Validate Terraform plan and Kubernetes manifests.
- Ensure secrets are externalized (no secrets in repo).
- Create a repeatable deploy script and rollback steps.

### D. Observability
- Basic logging in backend.
- Metrics and health checks for core services.
- Ensure Grafana/Prometheus stack is wired.

### E. Federated system validation
- Enforce 7-layer constraints as part of architectural review.
- Validate inter-service contracts for Isabella/TAMVAI, BOOKPI, MSR, and EOCT.
- Define audit trails for layer-to-layer interactions.

## 4) Production Deployment Flow (Target)

1. **Provision Infrastructure**
   - Terraform: VPC, EKS, RDS, Redis, storage.
2. **Configure Secrets**
   - External secret manager; load into CI/CD.
3. **Build & Push Artifacts**
   - Docker images for frontend and backend.
4. **Deploy Services**
   - Apply Kubernetes manifests / Helm charts.
5. **Validate**
   - Health checks + smoke tests.
6. **Enable Monitoring & Alerts**
   - Activate dashboards and alerting rules.

## 5) Immediate Actions to Complete Unification

1. **Run consolidation analysis** (duplicate detection + quality scoring).
2. **Merge or archive duplicate directories** and update references.
3. **Confirm canonical commands** in `README.md`.
4. **Finalize deployment scripts** and a single deploy guide.

## 5.1 Consolidation summary (from prior analyses)

- **Duplicate analysis**: detected overlapping documentation and multiple partial project bundles.
- **Quality scoring**: ranked sources by recency, completeness, and code quality to determine the canonical base.
- **Merge strategy**: file‑level merge with conflict resolution and archival of superseded content.

The current repository is the canonical source of truth; all other duplicates should be archived or removed once validated.

## 6) Known Limitations

- This plan reflects **only** the current repository contents. External GitHub repositories or profile data were not accessible from the local workspace, so the unification strategy assumes this repository is the designated canonical home.

## 7) Success Criteria

- One canonical codepath for frontend and backend.
- One authoritative doc set.
- Repeatable deployment with infrastructure as code.
- Passing test suite and validated health checks.
- Production-ready configuration and secrets workflow.
