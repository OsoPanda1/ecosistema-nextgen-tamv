import pool from '../config/database';

export interface TamvLayerStatus {
  layer: string;
  status: 'active' | 'partial' | 'planned';
  modules: string[];
}

export interface TamvPlatformSnapshot {
  generatedAt: string;
  profile: {
    githubHandle: string;
    organization: string;
    vision: string;
  };
  metrics: {
    users: number;
    posts: number;
    dreamspaces: number;
    protocolRuns: number;
    memberships: number;
  };
  layers: TamvLayerStatus[];
}

class TamvService {
  private async getCount(table: string): Promise<number> {
    try {
      const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      return result.rows[0]?.count ?? 0;
    } catch {
      return 0;
    }
  }

  async getPlatformSnapshot(): Promise<TamvPlatformSnapshot> {
    const [users, posts, dreamspaces, protocolRuns, memberships] = await Promise.all([
      this.getCount('users'),
      this.getCount('posts'),
      this.getCount('dreamspaces'),
      this.getCount('protocol_events'),
      this.getCount('memberships'),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      profile: {
        githubHandle: 'OsoPanda1',
        organization: 'TAMV ONLINE ENTERPRISE',
        vision:
          'Ecosistema civilizatorio federado para identidad, social, protocolos auditables y presencia XR.',
      },
      metrics: { users, posts, dreamspaces, protocolRuns, memberships },
      layers: [
        { layer: 'L0 Doctrina & Ética', status: 'active', modules: ['protocol.constitution.ts', 'eoct.service.ts'] },
        { layer: 'L1 Memoria & Registro', status: 'active', modules: ['msr.service.ts', 'bookpi.service.ts'] },
        { layer: 'L2 Protocolos Controlados', status: 'active', modules: ['protocol.engine.ts', 'protocol.orchestrator.ts'] },
        { layer: 'L3 Guardianía', status: 'active', modules: ['protocol.monitoring.guardian.ts'] },
        { layer: 'L4 XR/VR/3D/4D', status: 'active', modules: ['xr.gateway.ts', 'xr.renderer.adapter.ts', 'dreamspaces.service.ts'] },
        { layer: 'L5 Servicios de Dominio', status: 'active', modules: ['auth.service.ts', 'user.service.ts', 'economy.service.ts'] },
        { layer: 'L6 Shell UX & Integración', status: 'partial', modules: ['frontend/frontend-app/src/App.tsx'] },
        { layer: 'L7 Quant-Inspired', status: 'active', modules: ['quantum.engine.ts', 'protocol.quantum.orchestrator.ts'] },
      ],
    };
  }
}

export const tamvService = new TamvService();
