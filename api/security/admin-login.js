import { handleSecurityApi } from '../../server-security.mjs';

/**
 * Dedicated Vercel Serverless Function for /api/security/admin-login
 */
export default async function handler(req, res) {
  return handleSecurityApi(req, res);
}
