// 관련 자료 갤러리(gallery_items) 관리 — 관리자 전용
//   GET    ?page=education                    → 해당 페이지 전체(숨김 포함)
//   POST   { page, image_url, storage_path, caption, alt }   → 추가 (맨 뒤 순서)
//   PATCH  { id, caption?, alt?, is_visible? }                → 수정
//   PUT    { page, order: [id, id, ...] }                     → 순서 저장
//   DELETE { id }                                             → 삭제 (+ Storage 파일 삭제)
const { SUPABASE_URL, PAGE_RE, PATH_RE, guard, sbHeaders, readJson, deleteObjects } = require('./_auth');

const TABLE = `${SUPABASE_URL}/rest/v1/gallery_items`;
const ID_RE = /^[0-9a-f-]{36}$/i;
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

module.exports = async function handler(req, res) {
  const serviceKey = guard(req, res);
  if (!serviceKey) return;
  const H = (extra) => sbHeaders(serviceKey, extra);
  const fail = (status, error, detail) => res.status(status).json({ error, detail });

  try {
    if (req.method === 'GET') {
      const page = String((req.query && req.query.page) || '');
      if (!PAGE_RE.test(page)) return fail(400, 'Invalid page');
      const r = await fetch(`${TABLE}?select=*&page=eq.${page}&order=sort_order.asc,created_at.asc`, { headers: H() });
      const data = await readJson(r);
      if (!r.ok) return fail(502, 'Supabase fetch failed (gallery_items 테이블이 생성되었는지 확인)', data);
      return res.status(200).json(data);
    }

    const body = req.body || {};

    if (req.method === 'POST') {
      const page = String(body.page || '');
      if (!PAGE_RE.test(page)) return fail(400, 'Invalid page');
      if (!/^https:\/\//.test(String(body.image_url || ''))) return fail(400, 'Invalid image_url');
      if (body.storage_path && !PATH_RE.test(body.storage_path)) return fail(400, 'Invalid storage_path');
      // 현재 마지막 순서 + 1
      const lastR = await fetch(`${TABLE}?select=sort_order&page=eq.${page}&order=sort_order.desc&limit=1`, { headers: H() });
      const last = await readJson(lastR);
      const next = Array.isArray(last) && last.length ? Number(last[0].sort_order) + 1 : 0;
      const r = await fetch(TABLE, {
        method: 'POST',
        headers: H({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify({
          page,
          image_url: body.image_url,
          storage_path: body.storage_path || null,
          caption: clip(body.caption, 300),
          alt: clip(body.alt, 300),
          sort_order: next,
          is_visible: true,
        }),
      });
      const data = await readJson(r);
      if (!r.ok) return fail(502, 'Supabase insert failed', data);
      return res.status(200).json(Array.isArray(data) ? data[0] : data);
    }

    if (req.method === 'PATCH') {
      if (!ID_RE.test(String(body.id || ''))) return fail(400, 'Invalid id');
      const patch = {};
      if (body.caption !== undefined) patch.caption = clip(body.caption, 300);
      if (body.alt !== undefined) patch.alt = clip(body.alt, 300);
      if (body.is_visible !== undefined) patch.is_visible = Boolean(body.is_visible);
      if (!Object.keys(patch).length) return fail(400, 'Nothing to update');
      const r = await fetch(`${TABLE}?id=eq.${body.id}`, {
        method: 'PATCH',
        headers: H({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify(patch),
      });
      const data = await readJson(r);
      if (!r.ok) return fail(502, 'Supabase update failed', data);
      return res.status(200).json(Array.isArray(data) ? data[0] : data);
    }

    if (req.method === 'PUT') {
      const page = String(body.page || '');
      const order = Array.isArray(body.order) ? body.order.filter((id) => ID_RE.test(String(id))) : [];
      if (!PAGE_RE.test(page) || !order.length) return fail(400, 'Invalid order');
      const results = await Promise.all(order.map((id, i) => fetch(`${TABLE}?id=eq.${id}&page=eq.${page}`, {
        method: 'PATCH',
        headers: H({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ sort_order: i }),
      })));
      if (results.some((r) => !r.ok)) return fail(502, 'Some order updates failed');
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!ID_RE.test(String(body.id || ''))) return fail(400, 'Invalid id');
      const r = await fetch(`${TABLE}?id=eq.${body.id}`, {
        method: 'DELETE',
        headers: H({ Prefer: 'return=representation' }),
      });
      const data = await readJson(r);
      if (!r.ok) return fail(502, 'Supabase delete failed', data);
      const row = Array.isArray(data) ? data[0] : null;
      if (row && row.storage_path) await deleteObjects(serviceKey, [row.storage_path]);
      return res.status(200).json({ ok: true });
    }

    return fail(405, 'Method not allowed');
  } catch (err) {
    return fail(500, 'Unexpected error', String(err));
  }
};
