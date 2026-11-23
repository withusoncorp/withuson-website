// 문의 관리 API — 관리자 전용 (비밀번호는 _auth.js 에서 타이밍 공격에 안전하게 비교)
//   GET                               문의 목록
//   PATCH { id, status }              처리 상태 변경
//   POST  { action: 'attachment-url', path, name }
//                                     첨부 파일 다운로드용 서명 URL (짧은 만료)
const { SUPABASE_URL, guard, sbHeaders, readJson } = require('./_auth');

const ATTACH_BUCKET = 'inquiry-attachments';
const ATTACH_URL_TTL = 60; // 초 — 링크가 새어 나가도 곧 만료되게
// 방문자 업로드 경로 규칙과 같다: inquiries/{yyyy-mm}/{uuid}_{안전한 파일명}
const ATTACH_PATH_RE = /^inquiries\/\d{4}-\d{2}\/[0-9a-f-]{36}_[A-Za-z0-9._-]{1,80}$/;

module.exports = async function handler(req, res) {
  const serviceKey = guard(req, res);
  if (!serviceKey) return;

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?select=*&order=created_at.desc`, {
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

    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!id || !status) {
        res.status(400).json({ error: 'Missing id or status' });
        return;
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify({ status }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        res.status(502).json({ error: 'Supabase update failed', detail: data });
        return;
      }
      res.status(200).json(data);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (body.action !== 'attachment-url') {
        res.status(400).json({ error: 'Unknown action' });
        return;
      }
      const path = String(body.path || '');
      if (!ATTACH_PATH_RE.test(path)) {
        res.status(400).json({ error: 'Invalid path' });
        return;
      }
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${ATTACH_BUCKET}/${path}`, {
        method: 'POST',
        headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ expiresIn: ATTACH_URL_TTL }),
      });
      const data = await readJson(response);
      if (!response.ok || !data || !data.signedURL) {
        res.status(502).json({ error: 'Could not create download URL', detail: data });
        return;
      }
      // download= 원본 파일명으로 저장되게 (한글 이름 포함)
      const name = String(body.name || '').slice(0, 200).replace(/[\r\n"]/g, '') || path.split('/').pop();
      const url = `${SUPABASE_URL}/storage/v1${data.signedURL}&download=${encodeURIComponent(name)}`;
      res.status(200).json({ url, expiresIn: ATTACH_URL_TTL });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
