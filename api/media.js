// 이미지 업로드용 서명 URL 발급 / 파일 삭제 — 관리자 전용
// 브라우저는 서버가 발급한 1회용 서명 URL 로 Supabase Storage 에 직접 업로드한다.
// (service_role 키는 서버 밖으로 나가지 않고, 버킷에는 anon 쓰기 정책이 없다)
const crypto = require('crypto');
const { SUPABASE_URL, BUCKET, PAGE_RE, PATH_RE, guard, sbHeaders, readJson, publicUrl, deleteObjects } = require('./_auth');

const EXT = { webp: 'webp', jpg: 'jpg', jpeg: 'jpg', png: 'png' };

module.exports = async function handler(req, res) {
  const serviceKey = guard(req, res);
  if (!serviceKey) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  try {
    // { action: 'sign', folder: 'pages'|'gallery', page: 'education', ext: 'webp' }
    if (body.action === 'sign') {
      const folder = body.folder === 'gallery' ? 'gallery' : 'pages';
      const page = String(body.page || '');
      const ext = EXT[String(body.ext || '').toLowerCase()];
      if (!PAGE_RE.test(page) || !ext) {
        res.status(400).json({ error: 'Invalid page or file type' });
        return;
      }
      const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const path = `${folder}/${page}/${name}`;
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
        method: 'POST',
        headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json' }),
        body: '{}',
      });
      const data = await readJson(response);
      if (!response.ok || !data || !data.url) {
        res.status(502).json({ error: 'Could not create upload URL (site-media 버킷이 생성되었는지 확인)', detail: data });
        return;
      }
      res.status(200).json({
        path,
        uploadUrl: `${SUPABASE_URL}/storage/v1${data.url}`,
        publicUrl: publicUrl(path),
      });
      return;
    }

    // { action: 'delete', path: 'gallery/education/....webp' }
    if (body.action === 'delete') {
      const path = String(body.path || '');
      if (!PATH_RE.test(path)) {
        res.status(400).json({ error: 'Invalid path' });
        return;
      }
      const result = await deleteObjects(serviceKey, [path]);
      if (!result.ok) {
        res.status(502).json({ error: 'Storage delete failed', detail: result.detail });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
