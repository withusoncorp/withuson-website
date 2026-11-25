-- =====================================================================
-- 관리자 문의 답변 · 삭제 기능 — DB 준비
-- 실행 위치: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전하다(idempotent).
--
-- 무엇을 하나
--   · consultations 에 답변 기록 칸 2개 추가
--       replies     : 보낸 답변 목록 [{body, to, sent_at, email_id}] (여러 번 답변 가능)
--       replied_at  : 마지막 답변 시각
--   · 방문자(anon)가 문의를 저장할 때 이 두 칸에 값을 넣어도 비워 버린다(답변 기록 위조 방지).
--     답변 기록은 관리자 서버(service_role)만 쓴다.
--   · 삭제는 새 정책 없이 관리자 서버(service_role)만 한다 → 방문자 권한은 그대로(문의 저장만).
--
-- 운영 사이트 영향: 없음. 기존 문의는 replies = [] 로 채워지고, 문의 폼은 이 칸을 쓰지 않는다.
-- =====================================================================


-- 1. 답변 기록 칸
alter table public.consultations
  add column if not exists replies    jsonb not null default '[]'::jsonb,
  add column if not exists replied_at timestamptz;

alter table public.consultations drop constraint if exists consultations_replies_check;
alter table public.consultations add constraint consultations_replies_check
  check (jsonb_typeof(replies) = 'array');


-- 2. 방문자 저장 시 답변 칸 비우기 (관리자 서버 = service_role 만 예외)
create or replace function public.consultations_guard_replies()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.replies    := '[]'::jsonb;
    new.replied_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists consultations_guard_replies on public.consultations;
create trigger consultations_guard_replies
  before insert on public.consultations
  for each row execute function public.consultations_guard_replies();


-- 3. 점검 (결과 표 확인)
--    · column 2행: replies(jsonb), replied_at(timestamp with time zone)
--    · policy 행: consultations 정책 목록 — 방문자(anon)에게는 INSERT 만 있어야 한다.
--      UPDATE / DELETE / SELECT 가 anon 에게 열려 있으면 알려주세요.
select 'column' as kind, column_name as name, data_type as detail, '' as roles
  from information_schema.columns
 where table_schema = 'public' and table_name = 'consultations'
   and column_name in ('replies', 'replied_at')
union all
select 'policy', policyname, cmd, roles::text
  from pg_policies
 where schemaname = 'public' and tablename = 'consultations';
