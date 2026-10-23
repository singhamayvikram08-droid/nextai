import { handleSecurityApi } from '../../../server-security.mjs';

/**
 * Dedicated Vercel Serverless Function for /api/v1/cluster/rebalance
 */
export default async function handler(req, res) {
  return handleSecurityApi(req, res);
}
