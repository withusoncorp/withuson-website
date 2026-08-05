const SUPABASE_URL = 'https://ezysjfquitcjsrfvyrqo.supabase.co';

function checkAuth(req) {
  const password = req.headers['x-admin-password'];
  return Boolean(password) && password === process.env.ADMIN_PASSWORD;
}

module.exports = async function handler(req, res) {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: 'ADMIN_PASSWORD is not configured' });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' });
    return;
  }

  if (req.method === 'GET') {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?select=*&order=created_at.desc`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: 'Supabase fetch failed', detail: data });
      return;
    }
    res.status(200).json(data);
    return;
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      res.status(400).json({ error: 'Missing id or status' });
      return;
    }
    const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: 'Supabase update failed', detail: data });
      return;
    }
    res.status(200).json(data);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
