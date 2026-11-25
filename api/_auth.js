// 관리자 API 공통 헬퍼 (파일명이 _ 로 시작하므로 Vercel 이 별도 함수로 배포하지 않음)
const crypto = require('crypto');

const SUPABASE_URL = 'https://ezysjfquitcjsrfvyrqo.supabase.co';
const BUCKET = 'site-media';

// 요청 헤더의 비밀번호를 서버 환경변수 ADMIN_PASSWORD 와 비교 (타이밍 공격 방지 비교)
function checkAuth(req) {
  const given = String(req.headers['x-admin-password'] || '');
  const expected = String(process.env.ADMIN_PASSWORD || '');
  if (!given || !expected) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

// 인증 + service_role 키 확인. 실패 시 응답을 보내고 null 반환
function guard(req, res) {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: 'ADMIN_PASSWORD is not configured' });
    return null;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' });
    return null;
  }
  return serviceKey;
}

function sbHeaders(serviceKey, extra) {
  return Object.assign({ apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, extra || {});
}

async function readJson(response) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; } catch (e) { return text; }
}

const PAGE_RE = /^[a-z0-9-]{1,40}$/;
// site-media 버킷 안에서 관리자가 다룰 수 있는 경로만 허용
const PATH_RE = /^(pages|gallery)\/[a-z0-9-]{1,40}\/[A-Za-z0-9._-]{1,120}$/;

function publicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function deleteObjects(serviceKey, paths) {
  const safe = (paths || []).filter((p) => PATH_RE.test(p));
  if (!safe.length) return { ok: true, skipped: true };
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: sbHeaders(serviceKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: safe }),
  });
  return { ok: response.ok, status: response.status, detail: response.ok ? undefined : await readJson(response) };
}

module.exports = { SUPABASE_URL, BUCKET, PAGE_RE, PATH_RE, guard, sbHeaders, readJson, publicUrl, deleteObjects };
