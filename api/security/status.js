import { handleSecurityApi } from '../../server-security.mjs';

/**
 * Dedicated Vercel Serverless Function for /api/security/status
 */
export default async function handler(req, res) {
  return handleSecurityApi(req, res);
}
