/**
 * XR Gateway (WebSocket)
 */

import { IncomingMessage, Server } from 'http';
import { WebSocketServer } from 'ws';
import { verifyToken } from '../../utils/jwt';

export interface XRGatewayMessage {
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface XRGatewayOptions {
  path?: string;
}

export function buildXRGatewayMessage(
  type: string,
  payload: Record<string, unknown>
): XRGatewayMessage {
  return {
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
}

function getToken(request: IncomingMessage): string | null {
  const url = request.url ? new URL(request.url, 'http://localhost') : null;
  const token = url?.searchParams.get('token');
  return token || null;
}

export function createXRGateway(
  server: Server,
  options: XRGatewayOptions = {}
): WebSocketServer {
  const wss = new WebSocketServer({ server, path: options.path || '/ws/xr' });

  wss.on('connection', (socket, request) => {
    const token = getToken(request);
    if (!token) {
      socket.close(1008, 'Authentication required');
      return;
    }

    try {
      verifyToken(token);
    } catch {
      socket.close(1008, 'Invalid token');
      return;
    }

    socket.send(
      JSON.stringify(
        buildXRGatewayMessage('welcome', {
          message: 'XR gateway connected',
        })
      )
    );
  });

  return wss;
}
