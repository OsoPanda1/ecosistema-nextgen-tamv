/**
 * XR Gateway (WebSocket)
 */

import { Server } from 'http';
import { WebSocketServer } from 'ws';

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

export function createXRGateway(server: Server, options: XRGatewayOptions = {}): WebSocketServer {
  const wss = new WebSocketServer({ server, path: options.path || '/ws/xr' });

  wss.on('connection', (socket) => {
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
