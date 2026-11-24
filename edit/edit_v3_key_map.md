# 3차 수정(v3) Phase 0 — 현황 · DB 점검 (2026-11-24)

## 1. 사업 페이지 섹션 현황 (작업 전)

| 순서 | 교육 `/education` | 공연 `/performance` | 훌터 `/platform` | 미디어 `/press` |
|---|---|---|---|---|
| ① | HERO | HERO | HERO | HERO |
| ② | `#overview` OVERVIEW · 시대의 변화에 발맞춘 맞춤형 교육 솔루션 | `#overview` OVERVIEW | `#overview` OVERVIEW · 나에게 딱 맞는 기관을 찾는 가장 확실한 방법 | `#overview` OVERVIEW |
| ③ | `#features` KEY FEATURES · 위더스온 교육 프로그램의 특징 (카드 4) | `#features` KEY FEATURES · 찾아가는 공연의 특징 (**Together·Trust·Growth** 3장, `performance.feature1~3_*`) | `#features` KEY FEATURES · 훌터의 특징 (카드 5) | `#features` KEY FEATURES · 마인드 투데이 소개 (카드 4) |
| ④ | `#process` PROCESS · 문의부터 결과 보고까지 (4단계) | `#process` PROCESS · 공연 진행 과정 (5단계 + 결과물 칩) | `#process` **PROCESS** 배지 · 훌터가 연결하는 방법 (**Together·Trust·Growth**, `val-card`, 번호 없음) | `#process` **CORE VALUES** 배지 · 마인드 투데이 핵심 가치 (`val-card`, 번호 있음) |
| ⑤ | `#fields` FIELDS · 교육 분야 (태그 5) | `#fields` FIELDS · 위더스온 공연 프로그램 (카드 3) | `#fields` FIELDS · 훌터에서 확인하는 정보 (카드 4) | `#fields` FIELDS · 함께 만들어가는 마인드 투데이 (카드 3) |
| ⑥ | `#resources` 현장 진행 사진 | `#resources` 현장 진행 사진 | `#resources` 훌터 둘러보기 | `#resources` 마인드 투데이 둘러 보기 |
| ⑦ | `#cta` | `#cta` | `#cta` | `#cta` |

- `#process`로 가는 링크: 회사 소개·내비·푸터·관리자 어디에도 없음.
- `proc-step` / `proc-num` / `proc-lg` CSS는 교육·공연 PROCESS에서만 사용. `proc-list`는 공연 FIELDS(`program*_items`)에서도 사용하므로 남긴다.
- 'B2B'·'B2C'가 남은 곳
  - HTML: `index.html`의 `business.card2_desc_2`, `card2_tag1`, `card2_tag2` / `platform.html`의 `platform.overview_desc`
  - DB: 위 키와 같은 4곳 (`platform.overview_desc`는 11-23 관리자 저장값)

## 2. DB(`site_content`) 덮어쓰기 점검

DB 79행 중 62행은 HTML과 같고, **10행이 다르다.** 공통 키(header/footer) 7행은 비교 대상이 아니다.

| 키 | DB 저장일 | 원인 | 처리 |
|---|---|---|---|
| `business.card2_title` | 08-05 (초기 시드) | v2 문구가 HTML에만 들어가고 DB에는 옛 문구가 남음 → 화면에 옛 문구 | **v3 SQL로 갱신** (1-3 #1) |
| `business.card2_subtitle` | 08-05 | 위와 같음 | **v3 SQL로 갱신** (1-3 #2) |
| `business.card2_tag1~3` | 08-05 | 차이는 없지만(HTML도 옛 태그였음) 1-1 태그 교체 후 DB 옛 값이 덮어씀 | **v3 SQL로 갱신** (1-1) |
| `contact.subcopy_1` | 08-05 | 위와 같음 | **v3 SQL로 갱신** (1-3 #3) |
| `platform.overview_desc` | 11-23 (관리자) | B2B·B2C 문구 포함 | **v3 SQL로 갱신** (5-1, Phase 5) |
| `business.card3_subtitle` | 11-24 (관리자, 오늘) | 사용자가 직접 수정 ("로비 · 라운지로 찾아가는 사내 문화 복지 공연") | 유지 (0-4 #3) |
| `business.card4_title` | 11-23 (관리자) | 사용자가 직접 수정 | 유지 (0-4 #3) |
| `mission.card3_desc` | 11-23 (관리자) | 사용자가 직접 수정 | 유지 |
| `platform.hero_subcopy` | 11-23 (관리자) | 사용자가 직접 수정 | 유지 |
| `platform.hero_headline_highlight` | 11-23 (관리자) | 5-4 질문 대상 | Phase 5 질문 후 결정 |
| `press.hero_headline` / `_highlight` | 11-23 (관리자) | 5-4 질문 대상 | Phase 5 질문 후 결정 |

- `hero.subcopy_1~3` 행은 DB에 없다(사용자 처리 완료, 0-4 #1). 따라서 **`edit_v2_content.sql`은 더 이상 실행하지 않고 `edit_v3_content.sql`로 대체한다.**
- 이름을 바꿔 옮길 키(`performance.feature1~3_*` → `performance.values_*`, `platform.process_step*` → `platform.values_*`, `press.process_*` → `press.values_*`)는 **DB에 저장된 행이 없다.** HTML 기본값만 옮기면 되고 DB 갱신은 필요 없다.

## 3. 쓰지 않게 되는 키 (DB에서 지우지 않음, Phase마다 추가)

| Phase | 키 | DB 행 |
|---|---|---|
| 1 | `business.card1_desc_1`, `business.card1_desc_2` | 있음 (08-05) |
| 1 | `business.card2_desc_1`, `business.card2_desc_2` | 있음 (08-05, **'B2B 및 B2C' 포함**) |
| 1 | `business.card3_desc` | 있음 (11-23 관리자) |
| 1 | `business.card4_desc` | 있음 (11-23 관리자) |
| 2 | `education.process_eyebrow`, `education.process_headline`, `education.process_step1~4_title/_desc` (교육 PROCESS 4단계) | 없음 |
| 2 | `performance.process_eyebrow`, `performance.process_headline`, `performance.proc_subcopy`, `performance.proc_step1~5_title/_items`, `performance.proc_output_label`, `performance.proc_output_tag1~3` (공연 PROCESS 5단계 + 결과물) | 없음 |
| 2 | `performance.features_eyebrow/_headline/_subcopy`, `performance.feature1~3_title/_desc` (옛 KEY FEATURES 안의 Together·Trust·Growth → `performance.values_*`로 이동) | 없음 |
| 2 | `platform.process_eyebrow`, `platform.process_headline`, `platform.process_step1~3_title/_desc` (→ `platform.values_*`, 제목은 Phase 5 WHY HOOLTER) | 없음 |
| 2 | `press.process_eyebrow`, `press.process_headline`, `press.process_step1~3_title/_desc` (→ `press.values_*`) | 없음 |

## 4. 새로 생긴 키

| Phase | 키 | 비고 |
|---|---|---|
| 1 | `business.card1~4_clients` | Business 카드 표 '주요 고객' |
| 1 | `business.card1~4_service` | Business 카드 표 '제공 서비스' (줄바꿈은 1024px 이상에서 각 줄이 들어갈 때만 적용) |
| 1 | `business.card2_tag4` | 훌터 카드 태그 4번째 '간편 예약' |
| 1 | `index.contact_notice` | 문의하기 회사소개서 안내 |
| 2 | `{education,performance,platform,press}.values_eyebrow/_headline/_subcopy`, `.values_card1~3_title/_desc` | CORE VALUES (ValuesBlock). 회사 정의 줄은 회사 소개와 같은 키 `values.card1~3_desc` 사용 |
| 2 | `{education,performance}.guide_eyebrow/_headline_1/_headline_2/_headline_highlight/_subcopy` | GUIDE 제목부 |
| 2 | `{education,performance}.guide_card1~3_label/_title/_tags/_desc` | GUIDE 카드 (`_tags`는 한 줄에 칩 하나) |
| 2 | `{education,performance}.guide_band_label/_title/_desc/_button`, `education.guide_band_tags` | GUIDE 안내 띠 |
