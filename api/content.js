// 사이트 문구·이미지 슬롯 값(site_content) 읽기/쓰기 — 관리자 전용 (서버에서 비밀번호 검증)
const { SUPABASE_URL, guard, sbHeaders, readJson } = require('./_auth');

const KEY_RE = /^[a-z0-9_-]+\.[a-z0-9_-]+$/i;

module.exports = async function handler(req, res) {
  const serviceKey = guard(req, res);
  if (!serviceKey) return;

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value&order=key.asc`, {
        headers: sbHeaders(serviceKey),
      });
      const data = await readJson(response);
      if (!response.ok) {
        res.status(502).json({ error: 'Supabase fetch failed', detail: data });
        return;
      }
      res.status(200).json(data);
      return;
    }

    // 저장(upsert): { updates: [{ key, value }] }
    if (req.method === 'POST') {
      const { updates } = req.body || {};
      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({ error: 'Missing updates array' });
        return;
      }
      const rows = updates
        .filter((u) => u && typeof u.key === 'string' && KEY_RE.test(u.key))
        .map((u) => ({
          key: u.key,
          value: String(u.value == null ? '' : u.value),
          updated_at: new Date().toISOString(),
        }));

      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?on_conflict=key`, {
        method: 'POST',
        headers: sbHeaders(serviceKey, {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(rows),
      });
      const data = await readJson(response);
      if (!response.ok) {
        res.status(502).json({ error: 'Supabase update failed', detail: data });
        return;
      }
      res.status(200).json({ ok: true, updated: Array.isArray(data) ? data.length : 0 });
      return;
    }

    // 기본 문구로 되돌리기(행 삭제): { keys: ['education.hero_headline', ...] }
    if (req.method === 'DELETE') {
      const { keys } = req.body || {};
      const safe = Array.isArray(keys) ? keys.filter((k) => typeof k === 'string' && KEY_RE.test(k)) : [];
      if (!safe.length) {
        res.status(400).json({ error: 'Missing keys array' });
        return;
      }
      const list = safe.map((k) => `"${k}"`).join(',');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?key=in.(${encodeURIComponent(list)})`, {
        method: 'DELETE',
        headers: sbHeaders(serviceKey, { Prefer: 'return=representation' }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        res.status(502).json({ error: 'Supabase delete failed', detail: data });
        return;
      }
      res.status(200).json({ ok: true, deleted: Array.isArray(data) ? data.length : 0 });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
