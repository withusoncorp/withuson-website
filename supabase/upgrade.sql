-- =====================================================================
-- 위더스온 홈페이지 고도화 (멀티페이지 + 이미지/갤러리 관리) — Supabase 설정
-- 실행 위치: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전하도록(idempotent) 작성했습니다.
--
-- 보안 구조 요약
--   · 방문자(anon 키): site_content 읽기, gallery_items 중 "공개" 항목 읽기, consultations 쓰기(기존)만 가능
--   · 쓰기/업로드/삭제: 관리자 페이지 → Vercel 서버 함수(/api/*)가 비밀번호를 검증한 뒤
--     service_role 키로만 수행. anon 에게는 쓰기 정책을 아예 만들지 않습니다.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 관련 자료 갤러리 테이블
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id           uuid primary key default gen_random_uuid(),
  page         text not null check (page ~ '^[a-z0-9-]{1,40}$'),  -- education | performance | platform | press | (새 페이지)
  image_url    text not null,                                     -- Storage 공개 URL
  storage_path text,                                              -- site-media 버킷 안 경로 (삭제용)
  caption      text not null default '',
  alt          text not null default '',
  sort_order   integer not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists gallery_items_page_order_idx
  on public.gallery_items (page, sort_order);

alter table public.gallery_items enable row level security;

-- 방문자는 "공개(is_visible = true)" 항목만 읽을 수 있음
drop policy if exists "gallery_items_public_read_visible" on public.gallery_items;
create policy "gallery_items_public_read_visible"
  on public.gallery_items
  for select
  to anon, authenticated
  using (is_visible = true);

-- INSERT / UPDATE / DELETE 정책은 만들지 않음 → service_role(관리자 서버 함수)만 쓰기 가능


-- ---------------------------------------------------------------------
-- 2. 사이트 문구 테이블(site_content) — 기존 테이블 점검
--    텍스트(data-ck)와 이미지 슬롯(data-img, 값 = 이미지 URL)을 같은 테이블에 저장합니다.
--    RLS 가 켜져 있고 "읽기만" 공개인지 확인합니다.
-- ---------------------------------------------------------------------
alter table public.site_content enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_content' and cmd = 'SELECT'
  ) then
    create policy "site_content_public_read" on public.site_content
      for select to anon, authenticated using (true);
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 3. 이미지 저장소 버킷 (Supabase Storage)
--    공개 읽기 버킷 · 파일당 10MB · jpg/png/webp 만 허용
--    경로: pages/{페이지}/…  (단일 이미지 슬롯)
--          gallery/{페이지}/… (관련 자료)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage 정책: 따로 만들지 않습니다.
--   · 공개 버킷이므로 이미지 "보기"는 공개 URL 로 누구나 가능
--   · 업로드는 관리자 서버 함수가 발급한 1회용 서명 URL 로만 가능
--   · anon 의 업로드/삭제 정책이 없으므로 방문자는 파일을 올리거나 지울 수 없음


-- ---------------------------------------------------------------------
-- 4. 점검용 조회 (실행 결과 표를 확인하세요)
--    ① public 테이블 정책: site_content = SELECT 만, gallery_items = SELECT 만,
--       consultations = INSERT 만 보이면 정상
--    ② storage.objects 정책: site-media 에 anon INSERT/UPDATE/DELETE 를 허용하는
--       정책이 있으면 안 됩니다. (예전에 "모두 허용" 정책을 만든 적이 있다면 삭제 필요)
-- ---------------------------------------------------------------------
-- (SQL Editor 는 마지막 결과 표만 보여주므로 한 표로 합쳐서 조회)
select schemaname, tablename, policyname, cmd, roles::text as roles
from pg_policies
where (schemaname = 'public' and tablename in ('site_content', 'gallery_items', 'consultations'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, cmd;
