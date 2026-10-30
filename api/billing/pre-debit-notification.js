import { executePreDebitNotificationJob } from '../../scripts/pre-debit-notification-job.mjs';

/**
 * Serverless API Endpoint: /api/billing/pre-debit-notification
 * RBI E-Mandate 24-Hour Pre-Debit Notification Generator
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
  }

  try {
    const report = await executePreDebitNotificationJob();
    res.statusCode = 200;
    return res.end(JSON.stringify(report));
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'PRE_DEBIT_JOB_FAILED', message: err.message }));
  }
}
