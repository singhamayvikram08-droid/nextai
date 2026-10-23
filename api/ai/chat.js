import { handleAiChatStream } from '../../server-security.mjs';

/**
 * Dedicated Vercel Serverless Function for /api/ai/chat
 */
export default async function handler(req, res) {
  return handleAiChatStream(req, res);
}
