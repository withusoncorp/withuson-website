-- =====================================================================
-- 2차 수정(v2) Phase 2 — 문의 폼: 개인정보 동의 · 파일 첨부
-- 실행 위치: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전하다(idempotent).
--
-- ⚠️ 실행 시점: 미리보기(feature/multipage)에서 문의 폼을 테스트하기 "전"에 실행한다.
--   새 폼은 privacy_agreed · attachments 컬럼에 저장하므로, 이 SQL 이 없으면 문의 저장이 실패한다.
--   운영 사이트(원페이지)는 새 컬럼을 쓰지 않으므로 먼저 실행해도 영향이 없다(기본값으로 채워짐).
--
-- 보안 구조
--   · 방문자(anon): 문의 저장(기존) + 첨부 파일 "업로드"만 가능
--   · 첨부 파일 조회·목록·삭제: 정책을 만들지 않음 → 방문자는 불가
--     관리자는 /api/admin(비밀번호 확인 후 service_role)으로 60초짜리 서명 링크를 받아 내려받는다.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. consultations 테이블에 컬럼 추가
-- ---------------------------------------------------------------------
alter table public.consultations
  add column if not exists privacy_agreed    boolean,
  add column if not exists privacy_agreed_at timestamptz,
  add column if not exists attachments       jsonb not null default '[]'::jsonb;  -- [{path, name, size, type}]

-- 첨부 목록은 배열 · 최대 3개 (폼의 ATTACH_MAX_FILES 와 같게 유지)
alter table public.consultations drop constraint if exists consultations_attachments_check;
alter table public.consultations add constraint consultations_attachments_check
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 3);

-- 동의하지 않음(false)으로는 저장할 수 없다.
-- (기존 문의와 운영 원페이지 폼은 값이 비어 있음(null) → 그대로 허용)
alter table public.consultations drop constraint if exists consultations_privacy_check;
alter table public.consultations add constraint consultations_privacy_check
  check (privacy_agreed is distinct from false);

-- 동의 시각은 브라우저 값이 아니라 DB 저장 시각으로 기록
create or replace function public.consultations_set_privacy_time()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.privacy_agreed_at := case when new.privacy_agreed then now() else null end;
  return new;
end;
$$;

drop trigger if exists consultations_privacy_time on public.consultations;
create trigger consultations_privacy_time
  before insert on public.consultations
  for each row execute function public.consultations_set_privacy_time();


-- ---------------------------------------------------------------------
-- 2. 첨부 파일 버킷 (비공개)
--    파일당 10MB · 한글/워드/PDF/이미지 형식만
--    (폼이 확장자에 맞춰 아래 Content-Type 으로 올린다)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inquiry-attachments', 'inquiry-attachments', false, 10485760,
  array[
    'application/x-hwp', 'application/hwp+zip',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------------------
-- 3. Storage 정책: 방문자는 정해진 경로에 "새 파일 업로드"만
--    경로 규칙: inquiries/{yyyy-mm}/{uuid}_{영문·숫자·._- 파일명}
--    SELECT / UPDATE / DELETE 정책은 만들지 않는다
--    → 방문자는 파일을 보거나, 목록을 보거나, 덮어쓰거나, 지울 수 없다.
-- ---------------------------------------------------------------------
drop policy if exists "inquiry_attachments_anon_upload" on storage.objects;
create policy "inquiry_attachments_anon_upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'inquiry-attachments'
    and name ~ '^inquiries/[0-9]{4}-[0-9]{2}/[0-9a-f-]{36}_[A-Za-z0-9._-]{1,80}$'
  );


-- ---------------------------------------------------------------------
-- 4. 점검 (결과 표 확인)
--    · inquiry-attachments 행: public = false 여야 한다
--    · storage.objects 의 inquiry-attachments 관련 정책은 INSERT 하나만 있어야 한다
--      (예전에 storage.objects 에 "모두 허용(SELECT, true)" 같은 정책을 만든 적이 있다면
--       첨부가 노출될 수 있으니 알려주세요)
-- ---------------------------------------------------------------------
select 'bucket' as kind, id as name, public::text as detail, file_size_limit::text as extra
  from storage.buckets where id = 'inquiry-attachments'
union all
select 'policy', policyname, cmd, coalesce(qual, with_check)
  from pg_policies where schemaname = 'storage' and tablename = 'objects'
union all
select 'column', column_name, data_type, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'consultations'
   and column_name in ('privacy_agreed', 'privacy_agreed_at', 'attachments');
