// 문의 관리 API — 관리자 전용 (비밀번호는 _auth.js 에서 타이밍 공격에 안전하게 비교)
//   GET                               문의 목록
//   PATCH { id, status }              처리 상태 변경
//   POST  { action: 'attachment-url', path, name }
//                                     첨부 파일 다운로드용 서명 URL (짧은 만료)
//   POST  { action: 'reply-preview', id, body }   답변 메일 미리보기 (발송 안 함)
//   POST  { action: 'reply', id, body }           답변 메일 발송 → 답변 기록 저장 → 상태 '완료'
//   DELETE { id }                     문의 삭제 (첨부 파일 먼저 삭제 후 문의 행 삭제)
const { SUPABASE_URL, guard, sbHeaders, readJson } = require('./_auth');
const { buildReplyMail, MAX_BODY } = require('./_reply-mail');

const ATTACH_BUCKET = 'inquiry-attachments';
const ATTACH_URL_TTL = 60; // 초 — 링크가 새어 나가도 곧 만료되게

// 문의 한 건 읽기 (없으면 null)
async function getConsultation(serviceKey, id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: sbHeaders(serviceKey),
  });
  const data = await readJson(response);
  if (!response.ok) throw Object.assign(new Error('Supabase fetch failed'), { detail: data });
  return Array.isArray(data) && data.length ? data[0] : null;
}

function cleanBody(body) {
  return String(body == null ? '' : body).replace(/\r\n/g, '\n').trim();
}

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
      if (body.action === 'reply-preview' || body.action === 'reply') {
        await handleReply(serviceKey, body, res);
        return;
      }
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

    if (req.method === 'DELETE') {
      await handleDelete(serviceKey, (req.body || {}).id || (req.query || {}).id, res);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};

// ---------- 답변 (미리보기 · 발송) ----------
async function handleReply(serviceKey, body, res) {
  const id = body.id;
  const text = cleanBody(body.body);
  if (!id) { res.status(400).json({ error: 'Missing id' }); return; }
  if (!text) { res.status(400).json({ error: '답변 내용을 입력해 주세요.' }); return; }
  if (text.length > MAX_BODY) { res.status(400).json({ error: `답변은 ${MAX_BODY}자 이내로 작성해 주세요.` }); return; }

  const row = await getConsultation(serviceKey, id);
  if (!row) { res.status(404).json({ error: '문의를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.' }); return; }
  if (!row.email) { res.status(400).json({ error: '받는 사람 이메일이 없습니다.' }); return; }

  const mail = buildReplyMail(row, text);
  if (body.action === 'reply-preview') {
    res.status(200).json({ to: mail.to, subject: mail.subject, from: mail.from, replyTo: mail.reply_to, html: mail.html });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'RESEND_API_KEY is not configured' }); return; }
  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
  const sentData = await readJson(sent);
  if (!sent.ok) { res.status(502).json({ error: '메일 발송에 실패했습니다.', detail: sentData }); return; }

  // 발송 성공 → 답변 기록 저장 + 상태 완료
  const now = new Date().toISOString();
  const replies = (Array.isArray(row.replies) ? row.replies : []).concat([{
    body: text, to: row.email, sent_at: now, email_id: (sentData && sentData.id) || null,
  }]);
  const saved = await fetch(`${SUPABASE_URL}/rest/v1/consultations?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ replies, replied_at: now, status: 'done' }),
  });
  const savedData = await readJson(saved);
  if (!saved.ok) {
    // 메일은 이미 나갔다 → 재발송하지 않도록 성공으로 알리되 기록 실패를 함께 알린다
    res.status(200).json({ ok: true, recorded: false, warning: '메일은 발송됐지만 답변 기록 저장에 실패했습니다.', detail: savedData });
    return;
  }
  res.status(200).json({ ok: true, recorded: true, row: Array.isArray(savedData) ? savedData[0] : savedData });
}

// ---------- 삭제 (첨부 파일 → 문의 행) ----------
async function handleDelete(serviceKey, id, res) {
  if (!id) { res.status(400).json({ error: 'Missing id' }); return; }
  const row = await getConsultation(serviceKey, id);
  if (!row) { res.status(404).json({ error: '문의를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.' }); return; }

  const paths = (Array.isArray(row.attachments) ? row.attachments : [])
    .map((a) => a && a.path).filter((p) => typeof p === 'string' && ATTACH_PATH_RE.test(p));
  if (paths.length) {
    const del = await fetch(`${SUPABASE_URL}/storage/v1/object/${ATTACH_BUCKET}`, {
      method: 'DELETE',
      headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!del.ok) {
      // 첨부를 못 지웠으면 문의도 남겨 둔다 (파일만 남는 상황 방지)
      res.status(502).json({ error: '첨부 파일 삭제에 실패해 문의를 삭제하지 않았습니다.', detail: await readJson(del) });
      return;
    }
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/consultations?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: sbHeaders(serviceKey, { Prefer: 'return=representation' }),
  });
  const data = await readJson(response);
  if (!response.ok || !Array.isArray(data) || !data.length) {
    res.status(502).json({ error: '문의 삭제에 실패했습니다.', detail: data });
    return;
  }
  res.status(200).json({ ok: true, deletedFiles: paths.length });
}
