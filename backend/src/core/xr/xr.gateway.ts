/**
 * XR Gateway
 * Placeholder for WebSocket/SSE gateway integration.
 */

export interface XRGatewayMessage {
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
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
