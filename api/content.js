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
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value&order=key.asc`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
      const data = await response.json();
      if (!response.ok) {
        res.status(502).json({ error: 'Supabase fetch failed', detail: data });
        return;
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error', detail: String(err) });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { updates } = req.body || {};
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400).json({ error: 'Missing updates array' });
    return;
  }

  const rows = updates
    .filter((u) => u && typeof u.key === 'string')
    .map((u) => ({
      key: u.key,
      value: String(u.value == null ? '' : u.value),
      updated_at: new Date().toISOString(),
    }));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(rows),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: 'Supabase update failed', detail: data });
      return;
    }

    res.status(200).json({ ok: true, updated: Array.isArray(data) ? data.length : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
