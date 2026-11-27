# 2차 수정(v2) — 현재 data-ck 키 현황과 수정 항목 매핑

> Phase 0-1 산출물 (2026-11-23, 브랜치 `feature/multipage` 기준). 작업 명세: `_work/homepage_upgrade_v2_prompt.md`

## A. 수정 항목 → 키 매핑

| 명세 | 대상 | 기존 키 / 위치 | 처리 |
|---|---|---|---|
| 1-1 메뉴 | 상단·모바일 메뉴 | `assets/js/site-config.js` NAV (data-ck 아님) | 라벨 변경, About children 비움, `hoverLabel`/`activeLabel` 옵션 추가 |
| 1-1 eyebrow | 사업 페이지 히어로 | `education.hero_eyebrow`, `performance.hero_eyebrow`, `platform.hero_eyebrow`, `press.hero_eyebrow` | 문구 교체 |
| 1-2 푸터 | 아이콘·개인정보처리방침 | `assets/js/layout.js` renderFooter | 아이콘 링크 2개 + `/privacy` 링크 추가 |
| 1-3 버튼 | 히어로·하단 CTA | `*.hero_cta_primary`, `*.hero_cta_secondary`, `*.cta_button`, `*.cta_external` | education·performance의 `hero_cta_secondary` 요소 삭제(키 미사용), platform·press 문구·링크 교체 |
| 1-4 | 회사 소개 히어로 서브카피(4줄) | `hero.subcopy_1~3` | 1~3 교체 + **새 키 `hero.subcopy_4`** |
| 1-5 | Mission ART 카드 2장 | `mission.card1~4_desc` | **새 키 `mission.card5_desc`, `mission.card6_desc`** (+ 배지 라벨은 고정 텍스트) |
| 1-6 | Business 카드 2(훌터) | `business.card2_title`, `business.card2_subtitle` | 교체 (desc·tag 유지, 확인 필요로 보고) |
| 1-6 | Business 카드 3(공연) | `business.card3_title/_subtitle/_desc` | 교체 + **새 키 `business.card3_tag1~5`** |
| 1-6 | Business 카드 4(마인드 투데이) | `business.card4_title/_subtitle/_desc` | 교체 + **새 키 `business.card4_tag1~3`** |
| 1-7 | 문의 서브카피 | `contact.subcopy_1`, `contact.subcopy_2` | 1·2 교체(문장 분할 유지) |
| 1-8 | 문의 유형 | `index.html` `<select>` option (현재 education/instructor/partnership/etc) | 6개로 교체, 옛 값 `partnership` 은 관리자에서 라벨 유지 |
| 4-1 E1 | 교육 Overview 이미지 | `education.overview_image` (data-img) | 기본 SVG 교체 |
| 4-1 E2 | 결과 보고 설명 | `education.process_step4_desc` | 교체 |
| 4-1 E3 | 교육 분야 태그 | `education.fields_tag1~5` | 1~5 교체 |
| 4-1 E4·E5 | Resources | `education.gallery_headline`, `education.gallery_subcopy` | 교체 |
| 4-2 P1·P2 | 공연 히어로 | `performance.hero_headline`, `_highlight`, `hero_subcopy` | 교체 |
| 4-2 P3·P4·P5 | 공연 Overview | `performance.overview_title/_desc/_image` | 교체 |
| 4-2 P6 | 특징 카드 3장 | `performance.feature1~3_title/_desc` | 교체 (+ 선택: **새 키 `performance.features_subcopy`**) |
| 4-2 P7 | 공연 진행 과정 5단계 | `performance.process_step1~3_*` | **새 키 `performance.process5_step1~5_title`, `_items`, `performance.process5_subcopy`, `performance.process5_output_tag1~3`** → 기존 step 키 미사용 |
| 4-2 P8·P9 | 공연 프로그램 카드 3장 | `performance.fields_headline`, `fields_subcopy`, `fields_tag1` | 제목 교체, **새 키 `performance.program1~3_title/_items/_tag1~2`** → `fields_subcopy`·`fields_tag1` 미사용 |
| 4-2 P10·P11 | Resources | `performance.gallery_headline/_subcopy` | 교체 |
| 5-1 H1·H2 | 훌터 히어로 | `platform.hero_headline_highlight`, `platform.hero_subcopy` | 교체 |
| 5-1 H3·H4 | 훌터 Overview | `platform.overview_title`, `platform.overview_image` | 교체, 이미지 `assets/images/platform/overview-devices.webp` |
| 5-1 H5 | 특징 카드 5장 | `platform.feature1~4_title/_desc` | 교체 + **새 키 `platform.feature5_*`, `platform.feature1~5_tag1~2`** |
| 5-1 H7 | 핵심가치 3장 | `platform.process_step1~3_title/_desc` | 키 유지·문구 교체(구조: 연결선 제거) |
| 5-1 H8~H10 | 확인하는 정보 카드 4장 | `platform.fields_headline/_subcopy`, `fields_tag1~5` | 제목·서브 교체, **새 키 `platform.info1~4_title/_desc`, data-img `platform.info1~4_image`** → `fields_tag1~5` 미사용 |
| 5-1 H11~H15 | Resources·CTA | `platform.gallery_headline/_subcopy`, `platform.cta_headline/_subcopy` | 교체 |
| 5-2 M1·M2 | 마인드 투데이 히어로 | `press.hero_headline`, `_highlight`, `hero_subcopy` | 교체 |
| 5-2 M3·M4 | Overview | `press.overview_title/_desc/_image` | 교체 |
| 5-2 M5 | 소개 카드 4장 | `press.feature1~3_*` | 교체 + **새 키 `press.feature4_title/_desc`** |
| 5-2 M6·M7 | 핵심 가치 | `press.process_headline`, `press.process_step1~3_*` | 교체(키 유지) |
| 5-2 M8·M9 | 함께 만들어가는 마인드 투데이 | `press.fields_headline`, `fields_subcopy`, `fields_tag1` | 제목 교체, **새 키 `press.join1~3_title/_desc`** → `fields_subcopy`·`fields_tag1` 미사용 |
| 5-2 M10~M13 | Resources·CTA | `press.gallery_headline/_subcopy`, `press.cta_subcopy` | 교체 |

(새 키 이름은 구현하면서 확정하고, 최종 보고서에 정리한다.)

## B. 현재 페이지별 키 전체 목록

## index.html

| 섹션(id) | 종류 | 키 | 현재 문구 |
|---|---|---|---|
| (top) | ck | `hero.eyebrow` | WithUsOn · 위더스온 |
| (top) | ck | `hero.headline_1` | 함께하는 마음으로, |
| (top) | ck | `hero.headline_2_highlight` | 온 세상을 따뜻하게 |
| (top) | ck | `hero.headline_2_rest` | 연결합니다. |
| (top) | ck | `hero.subcopy_1` | 나에게 꼭 맞는 전문가를 찾을 수 있는 플랫폼부터, |
| (top) | ck | `hero.subcopy_2` | 교육이 필요한 현장에 꼭 맞는 교육 솔루션을 전하여 |
| (top) | ck | `hero.subcopy_3` | 일상에 온기와 성장을 더합니다. |
| (top) | ck | `hero.cta_primary` | 문의하기 |
| (top) | ck | `hero.cta_secondary` | 사업 살펴보기 |
| vision | ck | `vision.badge` | Vision |
| vision | ck | `vision.stage1_word1` | With |
| vision | ck | `vision.stage1_word2` | Us |
| vision | ck | `vision.stage1_sub_1` | 우리와 함께 |
| vision | ck | `vision.stage1_sub_2` | 일상 속 온기를 더하고 |
| vision | ck | `vision.stage2_word1` | On |
| vision | ck | `vision.stage2_sub_1` | 나아가 성장할 수 있는 |
| vision | ck | `vision.stage2_sub_2` | 전원을 켭니다. |
| values | ck | `values.eyebrow` | Core Values |
| values | ck | `values.headline` | 함께 켜는 가능성을 지향합니다. |
| values | ck | `values.card1_title` | Together |
| values | ck | `values.card1_desc` | 혼자가 아닌 함께 |
| values | ck | `values.card2_title` | Trust |
| values | ck | `values.card2_desc` | 신뢰할 수 있는 연결 |
| values | ck | `values.card3_title` | Growth |
| values | ck | `values.card3_desc` | 지속 가능한 성장 |
| business | ck | `business.eyebrow` | Business |
| business | ck | `business.headline` | 사람과 전문가를 연결하여 더 건강한 내일을 만듭니다. |
| business | ck | `business.card1_title` | 맞춤형 위탁 교육 및 강사 매칭 |
| business | ck | `business.card1_subtitle` | 시대의 변화에 발맞춘 맞춤형 교육 솔루션 |
| business | ck | `business.card1_desc_1` | 현장에 꼭 맞는 교육을 기획하고, 검증된 전문 강사 풀을 기반으로 |
| business | ck | `business.card1_desc_2` | 교육이 필요한 곳 어디든 직접 위탁 운영 및 강사 파견을 진행합니다. |
| business | ck | `business.card1_tag1` | AI·디지털 교육 |
| business | ck | `business.card1_tag2` | 경제 교육 |
| business | ck | `business.card1_tag3` | 심리상담 교육 |
| business | ck | `business.card1_tag4` | 문화예술교육 |
| business | ck | `business.card1_tag5` | 진로체험 |
| business | ck | `business.card1_link` | 자세히 보기 |
| business | ck | `business.card3_title` | 찾아가는 공연 |
| business | ck | `business.card3_subtitle` | [작성 예정] |
| business | ck | `business.card3_desc` | 공연이 필요한 현장으로 직접 찾아갑니다. |
| business | ck | `business.card3_link` | 자세히 보기 |
| business | ck | `business.card2_title` | 마음 및 정신건강 전문가 매칭 플랫폼 |
| business | ck | `business.card2_subtitle` | 나에게 딱 맞는 전문가를 찾는 가장 확실한 방법 |
| business | ck | `business.card2_desc_1` | 발달센터, 심리상담센터, 정신건강의학과 등의 전문 도움이 필요한 이들의 상황을 분석해, |
| business | ck | `business.card2_desc_2` | 검증된 맞춤형 전문가를 연결하는 B2B 및 B2C 매칭 서비스를 제공합니다. |
| business | ck | `business.card2_tag1` | B2B 구독 |
| business | ck | `business.card2_tag2` | B2C 매칭 |
| business | ck | `business.card2_tag3` | 맞춤 전문가 연결 |
| business | ck | `business.card2_link` | 자세히 보기 |
| business | ck | `business.card4_title` | 온라인 언론사 마인드 투데이 |
| business | ck | `business.card4_subtitle` | [작성 예정] |
| business | ck | `business.card4_desc` | 마인드 투데이는 위더스온이 운영하는 온라인 언론사입니다. |
| business | ck | `business.card4_link` | 자세히 보기 |
| mission | ck | `mission.eyebrow` | Mission |
| mission | ck | `mission.headline` | 배움과 마음이 필요한 모든 곳에 내일을 살아갈 힘을 전합니다. |
| mission | ck | `mission.main_title` | 함께 자립하고 성장하는 문화 |
| mission | ck | `mission.main_desc_1` | 위더스온은 단순히 사람과 서비스를 잇는 것을 넘어, |
| mission | ck | `mission.main_desc_2` | 정보의 장벽 때문에 소외되는 이가 없도록 마음을 다해 연결하여 |
| mission | ck | `mission.main_desc_3` | 모두가 저마다의 속도로 자립하고 성장할 수 있는 따뜻한 시스템을 만들고자 합니다. |
| mission | ck | `mission.shared_title` | 함께하는 지속 가능한 상생 |
| mission | ck | `mission.shared_subtitle` | 위더스온과 동행하는 모두는 함께 성장합니다. |
| mission | ck | `mission.card1_desc` | 강사에게는 안정적인 활동의 장을, / 배우는 이들에게는 성장의 경험을 제공합니다. |
| mission | ck | `mission.card2_desc` | 고객에게는 신뢰할 수 있는 연결을, / 전문가에게는 전문성을 살릴 기회를 제공합니다. |
| mission | ck | `mission.card3_desc` | 기관의 상황과 니즈에 맞춰 기획부터 운영, 파견까지 / 수준 높은 교육 서비스를 누릴 수 있도록 맞춤형 솔루션을 전합니다. |
| mission | ck | `mission.card4_desc` | 다양한 바우처 혜택과 맞춤형 조건 필터링으로, / 누구나 안심하고 전문가를 만날 수 있는 평등한 기회를 제공합니다. |
| contact | ck | `contact.eyebrow` | Contact |
| contact | ck | `contact.headline` | 문의하기 |
| contact | ck | `contact.subcopy_1` | 교육 문의, 강사 등록 문의, 제휴 문의까지 — |
| contact | ck | `contact.subcopy_2` | 위더스온의 문은 언제나 활짝 열려 있습니다. |
| contact | ck | `contact.form_submit` | 문의 보내기 |
| contact | ck | `contact.form_success` | 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. |

`[작성 예정]` 2개

## education.html

| 섹션(id) | 종류 | 키 | 현재 문구 |
|---|---|---|---|
| (top) | ck | `education.hero_eyebrow` | 교육 프로그램 |
| (top) | ck | `education.hero_headline` | 현장에 꼭 맞는 교육을 |
| (top) | ck | `education.hero_headline_highlight` | 기획하고 연결합니다. |
| (top) | ck | `education.hero_subcopy` | 검증된 전문 강사 풀을 기반으로, 교육이 필요한 곳 어디든 / 위탁 운영과 강사 파견을 진행합니다. |
| (top) | ck | `education.hero_cta_primary` | 교육 문의하기 |
| (top) | ck | `education.hero_cta_secondary` | 자세히 살펴보기 |
| (top) | img | `education.hero_image` |  |
| overview | ck | `education.overview_eyebrow` | Overview |
| overview | ck | `education.overview_title` | 시대의 변화에 발맞춘 / 맞춤형 교육 솔루션 |
| overview | ck | `education.overview_desc` | 현장에 꼭 맞는 교육을 기획하고, 검증된 전문 강사 풀을 기반으로 교육이 필요한 곳 어디든 직접 위탁 운영 및 강사 파견을 진행합니다. / / 기관의 상황과 니즈 |
| overview | img | `education.overview_image` |  |
| features | ck | `education.features_eyebrow` | Key Features |
| features | ck | `education.features_headline` | 위더스온 교육 프로그램의 특징 |
| features | ck | `education.feature1_title` | 현장 맞춤 기획 |
| features | ck | `education.feature1_desc` | 기관의 상황과 니즈에 맞춰 교육을 처음부터 설계합니다. |
| features | ck | `education.feature2_title` | 검증된 강사 풀 |
| features | ck | `education.feature2_desc` | 검증된 전문 강사 풀을 기반으로 현장에 꼭 맞는 강사를 매칭합니다. |
| features | ck | `education.feature3_title` | 위탁 운영·강사 파견 |
| features | ck | `education.feature3_desc` | 교육이 필요한 곳 어디든 직접 운영하고 강사를 파견합니다. |
| features | ck | `education.feature4_title` | 함께 성장하는 구조 |
| features | ck | `education.feature4_desc` | 강사에게는 안정적인 활동의 장을, 배우는 이들에게는 성장의 경험을 제공합니다. |
| process | ck | `education.process_eyebrow` | Process |
| process | ck | `education.process_headline` | 문의부터 결과 보고까지 |
| process | ck | `education.process_step1_title` | 문의 |
| process | ck | `education.process_step1_desc` | 교육이 필요한 현장의 상황과 니즈를 듣습니다. |
| process | ck | `education.process_step2_title` | 기획 |
| process | ck | `education.process_step2_desc` | 현장에 꼭 맞는 교육 프로그램을 설계합니다. |
| process | ck | `education.process_step3_title` | 운영 |
| process | ck | `education.process_step3_desc` | 검증된 강사 매칭과 함께 위탁 운영·파견을 진행합니다. |
| process | ck | `education.process_step4_title` | 결과 보고 |
| process | ck | `education.process_step4_desc` | [작성 예정] |
| fields | ck | `education.fields_eyebrow` | Fields |
| fields | ck | `education.fields_headline` | 교육 분야 |
| fields | ck | `education.fields_subcopy` | 교육이 필요한 현장이라면 어디든 함께합니다. |
| fields | ck | `education.fields_tag1` | AI·디지털 교육 |
| fields | ck | `education.fields_tag2` | 경제 교육 |
| fields | ck | `education.fields_tag3` | 심리상담 교육 |
| fields | ck | `education.fields_tag4` | 문화예술교육 |
| fields | ck | `education.fields_tag5` | 진로체험 |
| resources | ck | `education.gallery_eyebrow` | Resources |
| resources | ck | `education.gallery_headline` | 관련 자료 |
| resources | ck | `education.gallery_subcopy` | 교육 현장의 모습을 사진으로 만나보세요. |
| resources | ck | `education.gallery_empty` | 관련 자료를 준비하고 있습니다. |
| cta | ck | `education.cta_headline` | 현장에 꼭 맞는 교육이 필요하신가요? |
| cta | ck | `education.cta_subcopy` | 교육 문의, 강사 등록 문의 모두 환영합니다. |
| cta | ck | `education.cta_button` | 교육 문의하기 |

`[작성 예정]` 1개

## performance.html

| 섹션(id) | 종류 | 키 | 현재 문구 |
|---|---|---|---|
| (top) | ck | `performance.hero_eyebrow` | 찾아가는 공연 |
| (top) | ck | `performance.hero_headline` | 공연이 필요한 곳으로 |
| (top) | ck | `performance.hero_headline_highlight` | 직접 찾아갑니다. |
| (top) | ck | `performance.hero_subcopy` | [작성 예정] |
| (top) | ck | `performance.hero_cta_primary` | 공연 문의하기 |
| (top) | ck | `performance.hero_cta_secondary` | 자세히 살펴보기 |
| (top) | img | `performance.hero_image` |  |
| overview | ck | `performance.overview_eyebrow` | Overview |
| overview | ck | `performance.overview_title` | [작성 예정] |
| overview | ck | `performance.overview_desc` | [작성 예정] |
| overview | img | `performance.overview_image` |  |
| features | ck | `performance.features_eyebrow` | Key Features |
| features | ck | `performance.features_headline` | 찾아가는 공연의 특징 |
| features | ck | `performance.feature1_title` | 직접 찾아가는 공연 |
| features | ck | `performance.feature1_desc` | 공연이 필요한 현장으로 직접 찾아갑니다. |
| features | ck | `performance.feature2_title` | [작성 예정] |
| features | ck | `performance.feature2_desc` | [작성 예정] |
| features | ck | `performance.feature3_title` | [작성 예정] |
| features | ck | `performance.feature3_desc` | [작성 예정] |
| process | ck | `performance.process_eyebrow` | Process |
| process | ck | `performance.process_headline` | 공연 진행 과정 |
| process | ck | `performance.process_step1_title` | 문의 |
| process | ck | `performance.process_step1_desc` | [작성 예정] |
| process | ck | `performance.process_step2_title` | 기획 |
| process | ck | `performance.process_step2_desc` | [작성 예정] |
| process | ck | `performance.process_step3_title` | 공연 |
| process | ck | `performance.process_step3_desc` | [작성 예정] |
| fields | ck | `performance.fields_eyebrow` | Fields |
| fields | ck | `performance.fields_headline` | 공연 대상·분야 |
| fields | ck | `performance.fields_subcopy` | [작성 예정] |
| fields | ck | `performance.fields_tag1` | [작성 예정] |
| resources | ck | `performance.gallery_eyebrow` | Resources |
| resources | ck | `performance.gallery_headline` | 관련 자료 |
| resources | ck | `performance.gallery_subcopy` | 공연 현장의 모습을 사진으로 만나보세요. |
| resources | ck | `performance.gallery_empty` | 관련 자료를 준비하고 있습니다. |
| cta | ck | `performance.cta_headline` | 공연이 필요한 현장이 있으신가요? |
| cta | ck | `performance.cta_subcopy` | 문의를 남겨주시면 빠른 시일 내에 연락드리겠습니다. |
| cta | ck | `performance.cta_button` | 공연 문의하기 |

`[작성 예정]` 12개

## platform.html

| 섹션(id) | 종류 | 키 | 현재 문구 |
|---|---|---|---|
| (top) | ck | `platform.hero_eyebrow` | 기관 탐색 서비스 · Hoolter |
| (top) | ck | `platform.hero_headline` | 고민을 훌훌 털어낼 |
| (top) | ck | `platform.hero_headline_highlight` | 전문가와 연결되는 곳 |
| (top) | ck | `platform.hero_subcopy` | 훌터(Hoolter)는 상담·발달센터·정신건강 전문가를 / 연결하는 플랫폼입니다. |
| (top) | ck | `platform.hero_cta_primary` | 문의하기 |
| (top) | ck | `platform.hero_cta_secondary` | 자세히 살펴보기 |
| (top) | img | `platform.hero_image` |  |
| overview | ck | `platform.overview_eyebrow` | Overview |
| overview | ck | `platform.overview_title` | 나에게 딱 맞는 전문가를 / 찾는 가장 확실한 방법 |
| overview | ck | `platform.overview_desc` | 발달센터, 심리상담센터, 정신건강의학과 등의 전문 도움이 필요한 이들의 상황을 분석해, 검증된 맞춤형 전문가를 연결하는 B2B 및 B2C 매칭 서비스를 제공합니다 |
| overview | img | `platform.overview_image` |  |
| features | ck | `platform.features_eyebrow` | Key Features |
| features | ck | `platform.features_headline` | 훌터의 특징 |
| features | ck | `platform.feature1_title` | 상황 분석 기반 매칭 |
| features | ck | `platform.feature1_desc` | 전문 도움이 필요한 이들의 상황을 분석해 맞춤형 전문가를 연결합니다. |
| features | ck | `platform.feature2_title` | 검증된 전문가 |
| features | ck | `platform.feature2_desc` | 발달센터, 심리상담센터, 정신건강의학과 등 검증된 전문가와 연결합니다. |
| features | ck | `platform.feature3_title` | 바우처·조건 필터링 |
| features | ck | `platform.feature3_desc` | 다양한 바우처 혜택과 맞춤형 조건 필터링을 제공합니다. |
| features | ck | `platform.feature4_title` | B2B · B2C 서비스 |
| features | ck | `platform.feature4_desc` | B2B 구독과 B2C 매칭 서비스를 함께 제공합니다. |
| process | ck | `platform.process_eyebrow` | Process |
| process | ck | `platform.process_headline` | 훌터가 연결하는 방법 |
| process | ck | `platform.process_step1_title` | 상황 분석 |
| process | ck | `platform.process_step1_desc` | 도움이 필요한 이의 상황을 분석합니다. |
| process | ck | `platform.process_step2_title` | 조건 필터링 |
| process | ck | `platform.process_step2_desc` | 바우처 혜택과 맞춤형 조건으로 전문가를 찾습니다. |
| process | ck | `platform.process_step3_title` | 전문가 연결 |
| process | ck | `platform.process_step3_desc` | 검증된 맞춤형 전문가와 연결합니다. |
| fields | ck | `platform.fields_eyebrow` | Fields |
| fields | ck | `platform.fields_headline` | 연결 분야 |
| fields | ck | `platform.fields_subcopy` | B2B 및 B2C 매칭 서비스를 제공합니다. |
| fields | ck | `platform.fields_tag1` | 심리상담센터 |
| fields | ck | `platform.fields_tag2` | 발달센터 |
| fields | ck | `platform.fields_tag3` | 정신건강의학과 |
| fields | ck | `platform.fields_tag4` | B2B 구독 |
| fields | ck | `platform.fields_tag5` | B2C 매칭 |
| resources | ck | `platform.gallery_eyebrow` | Resources |
| resources | ck | `platform.gallery_headline` | 관련 자료 |
| resources | ck | `platform.gallery_subcopy` | 훌터 서비스 관련 자료를 소개합니다. |
| resources | ck | `platform.gallery_empty` | 관련 자료를 준비하고 있습니다. |
| cta | ck | `platform.cta_headline` | 나에게 맞는 전문가를 찾고 계신가요? |
| cta | ck | `platform.cta_subcopy` | 훌터에서 고민을 훌훌 털어낼 전문가를 만나보세요. |
| cta | ck | `platform.cta_button` | 문의하기 |
| cta | ck | `platform.cta_external` | 훌터 바로가기 |

`[작성 예정]` 0개

## press.html

| 섹션(id) | 종류 | 키 | 현재 문구 |
|---|---|---|---|
| (top) | ck | `press.hero_eyebrow` | 온라인 언론사 |
| (top) | ck | `press.hero_headline` | 위더스온의 온라인 언론사, |
| (top) | ck | `press.hero_headline_highlight` | 마인드 투데이 |
| (top) | ck | `press.hero_subcopy` | [작성 예정] |
| (top) | ck | `press.hero_cta_primary` | 문의하기 |
| (top) | ck | `press.hero_cta_secondary` | 자세히 살펴보기 |
| (top) | img | `press.hero_image` |  |
| overview | ck | `press.overview_eyebrow` | Overview |
| overview | ck | `press.overview_title` | [작성 예정] |
| overview | ck | `press.overview_desc` | [작성 예정] |
| overview | img | `press.overview_image` |  |
| features | ck | `press.features_eyebrow` | Key Features |
| features | ck | `press.features_headline` | 마인드 투데이 소개 |
| features | ck | `press.feature1_title` | 온라인 언론사 |
| features | ck | `press.feature1_desc` | 마인드 투데이는 위더스온이 운영하는 온라인 언론사입니다. |
| features | ck | `press.feature2_title` | [작성 예정] |
| features | ck | `press.feature2_desc` | [작성 예정] |
| features | ck | `press.feature3_title` | [작성 예정] |
| features | ck | `press.feature3_desc` | [작성 예정] |
| process | ck | `press.process_eyebrow` | Process |
| process | ck | `press.process_headline` | 기사가 전해지기까지 |
| process | ck | `press.process_step1_title` | 취재 |
| process | ck | `press.process_step1_desc` | [작성 예정] |
| process | ck | `press.process_step2_title` | 편집 |
| process | ck | `press.process_step2_desc` | [작성 예정] |
| process | ck | `press.process_step3_title` | 발행 |
| process | ck | `press.process_step3_desc` | [작성 예정] |
| fields | ck | `press.fields_eyebrow` | Fields |
| fields | ck | `press.fields_headline` | 주요 분야 |
| fields | ck | `press.fields_subcopy` | [작성 예정] |
| fields | ck | `press.fields_tag1` | [작성 예정] |
| resources | ck | `press.gallery_eyebrow` | Resources |
| resources | ck | `press.gallery_headline` | 관련 자료 |
| resources | ck | `press.gallery_subcopy` | 마인드 투데이 관련 자료를 소개합니다. |
| resources | ck | `press.gallery_empty` | 관련 자료를 준비하고 있습니다. |
| cta | ck | `press.cta_headline` | 마인드 투데이 소식을 만나보세요. |
| cta | ck | `press.cta_subcopy` | 제휴 문의는 위더스온으로 남겨주세요. |
| cta | ck | `press.cta_button` | 문의하기 |
| cta | ck | `press.cta_external` | 마인드 투데이 바로가기 |

`[작성 예정]` 12개
