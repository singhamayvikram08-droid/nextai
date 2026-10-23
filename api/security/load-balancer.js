import { handleSecurityApi } from '../../server-security.mjs';

/**
 * Dedicated Vercel Serverless Function for /api/security/load-balancer
 */
export default async function handler(req, res) {
  return handleSecurityApi(req, res);
}
