# 3차 수정(v3) 최종 보고 (2026-11-24)

브랜치 `feature/multipage`. 커밋은 Phase별로 했고, 푸시는 하지 않았다.
검증은 6개 페이지 × 360 / 768 / 1280px에서 실제 DB로 했다.

## 1. 변경 요약

| Phase | 커밋 | 내용 |
|---|---|---|
| 0 | `b1dee05` | 백업, 섹션·DB 점검, `edit_v3_content.sql` 초안 |
| 1 | `99e51ac` | 회사 소개 Business 카드에 주요 고객·제공 서비스 표, 우측 하단 '자세히 보기', 높이 맞춤, 훌터 태그 교체, 문의하기 회사소개서 안내 |
| 2 | `5d7d399` | 4개 사업 페이지 PROCESS 삭제, `ValuesBlock`(CORE VALUES) 공통 컴포넌트, GUIDE 공통 컴포넌트, 회사 소개 `#values` 카드 디자인 맞춤 |
| 3 | `b0abcf9` | 교육 FIELDS를 카테고리 카드 3장 + 전문가 칩 띠로 교체, title/OG 변경 |
| 4 | `9cade6e` | 공연 KEY FEATURES 2×3 (STAGE L / Play Book Concert) |
| 5 | `584bd20` | 훌터 OVERVIEW 첫 문단 교체, WHY HOOLTER 신설, 미디어 RESOURCES 제목, 히어로 기본값을 현재 화면 문구로 |

### 수정·추가한 파일

| 파일 | 내용 |
|---|---|
| `index.html` | Business 카드 표·화살표, 훌터 태그, 문의 안내 박스, `#values` 카드 클래스, 제공 서비스 줄바꿈 판정 스크립트 |
| `education.html` | CORE VALUES·GUIDE 신설, FIELDS 교체, PROCESS 삭제, title·description·OG |
| `performance.html` | KEY FEATURES 교체, CORE VALUES(옛 KEY FEATURES 카드 이동)·GUIDE 신설, PROCESS 삭제 |
| `platform.html` | WHY HOOLTER 신설, CORE VALUES(옛 `#process`), OVERVIEW 문구, 히어로 기본값 |
| `press.html` | CORE VALUES(`#process`를 `#values`로), RESOURCES 제목, 히어로 기본값 |
| `assets/css/site.css` | 컴포넌트 스타일 추가: `biz-kv`·`biz-more`, `vb-*`, `gd-*`, `fc-*`, `kf-*`, `why-*`<br>삭제: `proc-step`·`proc-num`·`proc-lg` (공연 FIELDS가 쓰는 `proc-list`는 유지) |
| `wuoadmin/index.html` | 새 키의 관리자 라벨. `values.card*_desc`는 '회사 소개·사업 페이지 공통'으로 표시 |
| `supabase/edit_v3_content.sql` (신규) | DB 옛 문구 갱신 8개 키 |
| `edit/edit_v3_key_map.md` (신규) | 섹션 현황, DB 점검, 새 키·쓰지 않는 키 전체 목록 |

## 2. 섹션 구조 (실제 반영 결과)

| 배지 | 교육 | 공연 | 훌터 | 미디어 |
|---|---|---|---|---|
| HERO | 유지 | 유지 | 유지 | 유지 |
| OVERVIEW | 유지 | 유지 | 첫 문단 교체 | 유지 |
| WHY HOOLTER | — | — | 훌터가 연결하는 방법 · 비교 도식 | — |
| KEY FEATURES | 위더스온 교육 프로그램의 특징 (카드 4) | 찾아가는 공연의 특징 · 2×3 `kf-*` | 훌터의 특징 (카드 5) | 마인드 투데이 소개 (카드 4) |
| CORE VALUES | 위더스온 교육의 핵심 가치 · `ValuesBlock` | 위더스온 공연의 핵심 가치 · `ValuesBlock` | 훌터의 핵심 가치 · `ValuesBlock` | 마인드 투데이 핵심 가치 · `ValuesBlock` |
| FIELDS | 다양한 분야의 프로그램을 운영합니다. · 카테고리 3 + 칩 띠 `fc-*` | 위더스온 공연 프로그램 (카드 3) | 훌터에서 확인하는 정보 (카드 4) | 함께 만들어가는 마인드 투데이 |
| GUIDE | 기관에 맞춰 운영하고, 필요한 프로그램은 새로 만듭니다. · `gd-*` | 기관에 맞춰 운영하고, 필요한 공연은 새로 만듭니다. · `gd-*` | — | — |
| RESOURCES | 현장 진행 사진 | 현장 진행 사진 | 훌터 둘러보기 | 마인드 투데이 둘러보기 |
| CTA | 유지 | 유지 | 유지 | 유지 |

### 체크리스트 결과 (6-1)

모든 항목을 통과했다.

- **섹션 구조**
  - 4개 사업 페이지 섹션 순서가 매핑표와 같다.
  - PROCESS 섹션 0개, REPORT 섹션 없음.
  - CORE VALUES가 4곳 모두 KEY FEATURES 바로 다음에 있다.
  - 4곳 모두 같은 마크업이다(아이콘 · 01~03 · 가치명 · 회사 정의 · 부제 동일).
  - CORE VALUES 밖에 Together·Trust·Growth 제목이 0개다.
- **공통 컴포넌트**
  - 회사 소개 `#values` 카드가 `ValuesBlock`과 같은 라운드(24px) · 테두리 · 아이콘(48px)을 쓴다.
  - 교육·공연 GUIDE가 같은 컴포넌트다. 안내 띠 버튼은 각각 `/?inquiry=education#contact`, `/?inquiry=performance#contact`로 간다.
- **회사 소개**
  - Business 카드 4장 모두 표가 있고, 첫 행 위에도 구분선이 있다.
  - 화살표가 우측 하단에 있고 표와 겹치지 않는다.
  - 데스크톱·태블릿에서 카드 4장 높이가 같다.
  - 훌터 태그가 바뀌었고, 문의하기 안내 박스가 보인다.
- **B2B·B2C**: HTML·JS·CSS에서 0개, 실제 화면에서 0개.
  - DB에는 쓰지 않는 키 `business.card2_desc_2`에 1곳 남아 있다. 4번 참고.
- **1-3 미반영 문구**: 사용자가 11-24에 `edit_v3_content.sql`을 실행해 DB 갱신을 확인했다. 실제 DB 화면에 새 문구가 나온다.
- **정리**: `#process` 링크와 남은 CSS를 정리했다. `transition-all`은 쓰지 않는다. 새 카드는 `feat-card` 공통 hover를 쓰고, 버튼은 공통 `.btn`이다.
- **화면 품질**
  - 콘솔 오류 0.
  - 360 / 768 / 1280px 가로 넘침 0. 1024px·1440px도 확인했다.
- **교육 페이지 메타**: title·og·twitter가 '교육 운영 | 심리 교육 프로그램 - 위더스온'이다.

## 3. `data-ck` 키

키별 상세는 `edit/edit_v3_key_map.md`에 있다.

### 새 키

- **회사 소개**
  - `business.card1~4_clients`, `business.card1~4_service`
  - `business.card2_tag4`
  - `index.contact_notice`
- **CORE VALUES**
  - `{education,performance,platform,press}.values_eyebrow`, `.values_headline`, `.values_subcopy`
  - `{education,performance,platform,press}.values_card1~3_title`, `.values_card1~3_desc`
  - 회사 정의 줄은 회사 소개와 같은 키 `values.card1~3_desc`를 쓴다. 관리자에서 한 번 고치면 5개 페이지에 모두 반영된다.
- **GUIDE**
  - `{education,performance}.guide_*`
  - `education.guide_band_tags`
- **교육 FIELDS**
  - `education.cat1~3_title`, `_desc`, `_items`, `_plus`
  - `education.fields_experts_title`, `education.fields_experts_tags`
- **공연 KEY FEATURES**
  - `performance.kf_row1~2_target`, `_name`, `_sub`
  - `performance.kf1~2_1~3_title`, `_desc`
- **훌터 WHY HOOLTER**
  - `platform.why_eyebrow`, `platform.why_headline`
  - `platform.why_a_*`, `platform.why_b_*`

### 옮긴 키

옛 키의 문구를 새 키로 옮겼다. 옛 키는 DB에 저장된 행이 없어서 따로 DB를 갱신하지 않았다.

| 옛 키 | 새 키 |
|---|---|
| `performance.feature1~3_*` | `performance.values_card1~3_*` |
| `platform.process_step1~3_*` | `platform.values_card1~3_*` |
| `platform.process_headline` 문구 | `platform.why_headline` |
| `press.process_*` | `press.values_*` |

`performance.features_eyebrow`, `_headline`, `_subcopy`는 새 KEY FEATURES에서 다시 쓴다.

### 쓰지 않게 된 키

DB에서 지우지 않았다.

| 키 | DB 행 |
|---|---|
| `business.card1_desc_1`, `business.card1_desc_2`, `business.card2_desc_1`, `business.card2_desc_2`, `business.card3_desc`, `business.card4_desc` (Business 설명 문단) | **있음** (6행) |
| `education.process_*` (4단계) | 없음 |
| `performance.process_*`, `performance.proc_*` (5단계 + 결과물) | 없음 |
| `performance.feature1~3_*` | 없음 |
| `platform.process_*` | 없음 |
| `press.process_*` | 없음 |
| `education.fields_tag1~5` (교육 분야 태그) | 없음 |

## 4. 👤 사용자가 직접 할 일

1. **`edit_v3_content.sql`은 이미 실행됐다** (DB 갱신 시각 11-24 확인).
   - 운영 원페이지(main)도 같은 DB를 쓰므로 훌터 카드 제목·부제·태그와 문의하기 서브카피가 운영 화면에도 이미 새 문구로 나온다.
   - `edit_v2_content.sql`은 실행하지 않는다.
2. **운영 배포**: 확인해 주시면 진행한다.
   - main에서 `git revert 320c035`를 한 뒤 `feature/multipage`를 merge하고 푸시한다.
3. **Business 설명 문단 DB 행 6개 삭제 여부를 결정한다.**
   - 이 중 `business.card2_desc_2`에 'B2B 및 B2C'가 남아 있다.
   - **운영 배포 전에는 지우지 않는다.** 운영 원페이지가 아직 이 키로 카드 설명을 보여 주기 때문이다.
   - 배포 뒤 지울 때 쓸 SQL:
     ```sql
     delete from site_content where key in ('business.card1_desc_1','business.card1_desc_2','business.card2_desc_1','business.card2_desc_2','business.card3_desc','business.card4_desc');
     ```
4. **이번 작업과 별개로 남은 할 일**: 공연·훌터·마인드 투데이 현장 사진 업로드.

## 5. 확인 필요 사항

- **5-4 히어로 헤드라인**: '지금 화면 유지'로 결정했다.
  - 훌터 '나와 맞는 기관과 연결되는 곳', 미디어 '마음 건강 소식을 전하는 / 인터넷 신문 마인드 투데이'.
  - HTML 기본값도 같은 문구로 맞췄다.
- **'온라인 언론사'와 '인터넷 신문' 표기 차이**
  - Business 마인드 투데이 카드의 제공 서비스는 소개서 원문대로 '온라인 언론사'다.
  - 미디어 페이지와 카드 제목은 '인터넷 신문'이다.
  - 통일 여부를 정해야 한다.
- **교육 카드 태그와 FIELDS 카테고리 차이**: 회사 소개 교육 카드 태그(AI·디지털 교육 · 경제 교육 · 심리상담 교육 · 문화예술교육 · 진로체험)가 교육 FIELDS 카테고리(진단 · 심리상담 · 힐링)와 다르다. 태그는 유지하기로 결정했다.
- **명세와 다르게 처리한 레이아웃·문구** (화면 깨짐 때문)
  - Business 카드 표는 1024px 미만에서 라벨 위·내용 아래로 쌓인다. 명세는 모바일만이었으나 768px 2열 카드에서 너무 좁았다.
  - 제공 서비스의 `<br>`은 데스크톱에서 각 줄이 한 줄에 들어갈 때만 적용한다. 훌터 카드는 1280px에서 자연스럽게 흐른다.
  - 교육 FIELDS는 데스크톱에서 '진단 | 심리상담' 한 줄, '힐링'은 아래 전체 폭으로 배치했다. 3장을 한 줄에 두면 항목 대부분이 두 줄로 깨졌다.
  - 훌터 OVERVIEW 첫 문단은 줄바꿈 없이 흐르게 했다. 1280px에서 '지원/하고,'로 끊겼다.
  - 교육 description 끝의 옛 태그 목록을 '진단 프로그램, 심리상담 프로그램, 힐링 프로그램.'으로 바꿨다. 명세에는 title만 적혀 있었다.
- **DB 값이 HTML 문구와 다른 4곳**: 모두 사용자가 관리자에서 직접 수정한 값이라 유지했다.
  - `platform.hero_subcopy`
  - `business.card3_subtitle`
  - `business.card4_title`
  - `mission.card3_desc`
