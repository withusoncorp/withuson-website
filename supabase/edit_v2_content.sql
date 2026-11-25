-- =====================================================================
-- 2차 수정(v2) — 이미 DB(site_content)에 저장된 문구를 새 문구로 갱신
-- =====================================================================
-- 왜 필요한가:
--   사이트는 로딩할 때 site_content 값으로 data-ck 문구를 덮어쓴다.
--   아래 키는 DB에 옛 문구가 저장돼 있어서, HTML 기본값만 바꾸면 화면에 반영되지 않는다.
--
-- ⚠️ 실행 시점:
--   운영 사이트(원페이지, main)도 같은 DB를 쓴다.
--   이 SQL을 실행하는 순간 운영 사이트 문구도 바로 바뀐다.
--   → 멀티페이지 버전을 운영에 배포할 때 함께 실행한다.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run
-- 여러 번 실행해도 결과는 같다(upsert).
-- =====================================================================

-- [Phase 1] 회사 소개 페이지
insert into site_content (key, value, updated_at) values
  -- 1-4 히어로 서브카피 (4번째 줄 hero.subcopy_4 는 새 키라 DB 갱신 불필요)
  ('hero.subcopy_1', '현장에 꼭 맞는 교육과 공연 솔루션부터', now()),
  ('hero.subcopy_2', '나에게 꼭 맞는 상담 · 발달 · 정신건강의학 기관을 찾는 플랫폼,', now()),
  ('hero.subcopy_3', '마음 건강 소식과 정보를 전하는 미디어까지.', now()),
  -- 1-6 Business 카드 2(훌터)
  ('business.card2_title', '마음 및 정신건강 전문기관 매칭 플랫폼 ‘훌터’', now()),
  ('business.card2_subtitle', '나에게 딱 맞는 기관을 찾는 가장 확실한 방법', now()),
  -- 1-7 문의하기 서브카피 (두 번째 줄 contact.subcopy_2 는 그대로)
  ('contact.subcopy_1', '교육 및 공연 문의, 제휴문의, 강사 및 연주자 등록 문의까지 —', now())
on conflict (key) do update
  set value = excluded.value,
      updated_at = excluded.updated_at;

-- 확인용: 아래를 실행해 6개 값이 새 문구인지 본다
-- select key, value from site_content
--  where key in ('hero.subcopy_1','hero.subcopy_2','hero.subcopy_3',
--                'business.card2_title','business.card2_subtitle','contact.subcopy_1');
