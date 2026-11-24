-- =====================================================================
-- 3차 수정(v3): DB(site_content)에 남은 옛 문구를 새 문구로 갱신
-- =====================================================================
-- 왜 필요한가:
--   사이트는 로딩할 때 site_content 값으로 data-ck 문구를 덮어쓴다.
--   아래 키는 DB에 옛 문구가 저장돼 있어 HTML만 바꾸면 화면에 반영되지 않는다.
--   (edit_v2_content.sql 은 이 파일로 대체한다. v2 파일은 실행하지 않는다.)
--
-- ⚠️ 실행 시점:
--   운영 사이트(원페이지, main)도 같은 DB를 쓴다.
--   실행하는 순간 운영 사이트의 회사 소개 문구도 바로 바뀐다.
--   → 멀티페이지 버전을 운영에 배포할 때 함께 실행한다.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run
-- 여러 번 실행해도 결과는 같다(upsert).
-- =====================================================================

-- [Phase 1] 회사 소개 페이지 (1-3 미반영 문구)
insert into site_content (key, value, updated_at) values
  ('business.card2_title',    '마음 및 정신건강 전문기관 매칭 플랫폼 ‘훌터’', now()),
  ('business.card2_subtitle', '나에게 딱 맞는 기관을 찾는 가장 확실한 방법', now()),
  ('contact.subcopy_1',       '교육 및 공연 문의, 제휴문의, 강사 및 연주자 등록 문의까지 —', now())
on conflict (key) do update
  set value = excluded.value,
      updated_at = excluded.updated_at;

-- 확인용
-- select key, value from site_content
--  where key in ('business.card2_title','business.card2_subtitle','contact.subcopy_1');
