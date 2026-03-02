/**
 * Catch-all RPC gateway.
 *
 * In environments where per-domain dynamic routes are not resolved first,
 * requests can land here (api/[domain]/v1/[rpc]). Dispatch known domains to
 * their concrete gateway handlers, and keep lightweight 404 fallback for truly
 * unknown domains.
 */

export const config = { runtime: 'edge' };

import aviationGateway from '../../aviation/v1/[rpc]';
import climateGateway from '../../climate/v1/[rpc]';
import conflictGateway from '../../conflict/v1/[rpc]';
import cyberGateway from '../../cyber/v1/[rpc]';
import displacementGateway from '../../displacement/v1/[rpc]';
import economicGateway from '../../economic/v1/[rpc]';
import givingGateway from '../../giving/v1/[rpc]';
import infrastructureGateway from '../../infrastructure/v1/[rpc]';
import intelligenceGateway from '../../intelligence/v1/[rpc]';
import maritimeGateway from '../../maritime/v1/[rpc]';
import marketGateway from '../../market/v1/[rpc]';
import militaryGateway from '../../military/v1/[rpc]';
import newsGateway from '../../news/v1/[rpc]';
import positiveEventsGateway from '../../positive-events/v1/[rpc]';
import predictionGateway from '../../prediction/v1/[rpc]';
import researchGateway from '../../research/v1/[rpc]';
import seismologyGateway from '../../seismology/v1/[rpc]';
import supplyChainGateway from '../../supply-chain/v1/[rpc]';
import tradeGateway from '../../trade/v1/[rpc]';
import unrestGateway from '../../unrest/v1/[rpc]';
import wildfireGateway from '../../wildfire/v1/[rpc]';
import { getCorsHeaders, isDisallowedOrigin } from '../../../server/cors';

type GatewayHandler = (request: Request) => Promise<Response>;

const DOMAIN_GATEWAYS: Record<string, GatewayHandler> = {
  aviation: aviationGateway,
  climate: climateGateway,
  conflict: conflictGateway,
  cyber: cyberGateway,
  displacement: displacementGateway,
  economic: economicGateway,
  giving: givingGateway,
  infrastructure: infrastructureGateway,
  intelligence: intelligenceGateway,
  maritime: maritimeGateway,
  market: marketGateway,
  military: militaryGateway,
  news: newsGateway,
  'positive-events': positiveEventsGateway,
  prediction: predictionGateway,
  research: researchGateway,
  seismology: seismologyGateway,
  'supply-chain': supplyChainGateway,
  trade: tradeGateway,
  unrest: unrestGateway,
  wildfire: wildfireGateway,
};

function fallbackNotFound(request: Request): Response {
  if (isDisallowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let corsHeaders: Record<string, string>;
  try {
    corsHeaders = getCorsHeaders(request);
  } catch {
    corsHeaders = { 'Access-Control-Allow-Origin': '*' };
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default async function handler(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split('/').filter(Boolean);
  const domain = parts[1] ?? '';
  const gateway = DOMAIN_GATEWAYS[domain];

  if (!gateway) {
    return fallbackNotFound(request);
  }

  return gateway(request);
}
