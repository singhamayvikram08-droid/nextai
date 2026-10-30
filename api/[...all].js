import { handleAiChatStream, handleSecurityApi, handleHealthProbes } from '../server-security.mjs';
import dataExportHandler from './user/data-export.js';
import dataDeleteHandler from './user/data-delete.js';
import preDebitHandler from './billing/pre-debit-notification.js';

/**
 * Universal Vercel Serverless Function Adapter for NextGen AI APIs
 * Handles /api/ai/chat, /api/security/*, /api/webhooks/*, /api/health/*, /api/user/*, /api/billing/*
 */
export default async function handler(req, res) {
  const url = req.url ? req.url.split('?')[0] : '';

  if (url.includes('/api/ai/chat') || url.includes('ai/chat')) {
    return handleAiChatStream(req, res);
  }

  if (url.includes('/api/user/data-export')) {
    return dataExportHandler(req, res);
  }

  if (url.includes('/api/user/data-delete')) {
    return dataDeleteHandler(req, res);
  }

  if (url.includes('/api/billing/pre-debit-notification')) {
    return preDebitHandler(req, res);
  }

  if (url.includes('security') || url.includes('webhooks') || url.includes('cluster') || url.includes('load-balancer')) {
    if (handleSecurityApi(req, res)) return;
  }

  if (url.includes('health') || url === '/live' || url === '/ready' || url === '/startup' || url === '/healthz') {
    if (handleHealthProbes(req, res)) return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'API_ROUTE_NOT_FOUND', path: url }));
}
