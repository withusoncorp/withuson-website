# claude_wuoweb.md — 위더스온 홈페이지 프로젝트 작업 기록

> 이 문서의 목적: 이번 프로젝트(withuson-website)에서 사용한 기술 스택, 디자인 시스템, 백엔드 연동 패턴, 배포 절차, 그리고 작업 중 겪은 실제 버그와 해결법을 정리한 문서입니다.
>
> **활용 방법**: 이 홈페이지의 세부 페이지를 추가로 만들거나, 위더스온의 다른 사이트(예: 서비스별 랜딩페이지, 회사소개 페이지)를 새로 만들 때 이 문서를 먼저 참고하면 동일한 스택/패턴/디자인 톤을 빠르게 재사용할 수 있습니다.

---

## 1. 프로젝트 개요

- **사이트**: 위더스온(WithUsOn) 회사 소개 원페이지
- **배포 주소**: https://www.withusoncorp.co.kr (Vercel, 커스텀 도메인 연결)
- **레포**: https://github.com/withusoncorp/withuson-website
- **구조**: 빌드 과정이 없는 **단일 정적 HTML 사이트**. React/Next.js 같은 프레임워크를 쓰지 않고, `index.html` 하나에 Tailwind CDN + 바닐라 JS로 전체 인터랙션을 구현. 백엔드가 필요한 부분(DB 저장, 이메일 발송, 관리자 인증)만 Vercel 서버리스 함수(`/api/*.js`)로 보완.
- **왜 이 방식인가**: 별도 빌드 파이프라인, npm 의존성 관리 없이 파일 몇 개만으로 완성도 높은 사이트 + 백엔드 기능(DB, 이메일, 관리자 CMS)까지 구현 가능. 배포도 Git push만으로 끝남.

---

## 2. 기술 스택

| 영역 | 사용 기술 | 비고 |
|---|---|---|
| 마크업/스타일 | HTML + Tailwind CSS (CDN, `cdn.tailwindcss.com`) | 빌드 없이 브라우저에서 실시간 JIT 컴파일 |
| 폰트 | Pretendard (jsdelivr CDN) | 한글 UI에 최적화된 국내 표준급 폰트 |
| 애니메이션 | 순수 CSS + IntersectionObserver | 스크롤 리빌, 스크롤 연동 인터랙션 등 |
| 데이터베이스 | Supabase (PostgreSQL + REST API) | 문의 폼 저장, 사이트 문구(CMS) 저장 |
| 이메일 발송 | Resend | 도메인 인증 완료 (withusoncorp.co.kr) |
| 배포/호스팅 | Vercel | GitHub 연동 자동 배포, 서버리스 함수 지원 |
| 도메인 | 가비아에서 구매, Vercel에 DNS 연결 |
| 버전관리 | Git + GitHub |

---

## 3. 디자인 시스템

### 브랜드 컬러 (Tailwind config에 등록)

```js
brand: {
  DEFAULT: '#A2AD24', dark: '#7C8620', darker: '#5E661A', light: '#C9D35E',
  50: '#F8F9EC', 100: '#EEF0D2', 200: '#DDE1A5',
},
forest: { DEFAULT: '#37452C', dark: '#26301C', darker: '#1A2212', light: '#57694A' },
warm: { 1: '#F4C978', 2: '#EFA35C' },
ink: '#26301C', inksoft: '#5C6653', inkfaint: '#8B9280', canvas: '#FBFAF3',
```

- **brand(올리브그린)**: 로고 포인트 컬러, CTA 버튼, 강조 텍스트
- **forest(다크그린)**: 로고 워드마크 컬러, 다크 섹션 배경(Vision/Contact/Footer)
- **warm(웜톤 앰버/오렌지)**: 그라데이션 블롭, 보조 강조색
- **canvas(#FBFAF3)**: 기본 배경(따뜻한 아이보리)

### 타이포그래피
- 폰트: Pretendard 단일 사용 (본문/제목 모두). Serif 사용 안 함 — "Apple + Notion식 미니멀함" 컨셉에 맞춤
- 제목: `font-extrabold` + `tracking-tight`

### 톤앤매너
- Apple/Notion/Handly를 참고한 "여백 넉넉 + Glass Effect + 따뜻한 그라데이션 + 브랜드컬러 강조" 스타일
- 섹션마다 다른 배경(아이보리 → 화이트 → 다크그린 → 브랜드라이트톤 → 웜피치 → 다크그린)으로 리듬감 부여, 인접 섹션끼리는 그라데이션이 자연스럽게 이어지도록 처리

### 재사용 가능한 CSS 패턴 (index.html `<style>` 참고)
- `.glass` / `.glass-strong` / `.glass-dark`: 반투명 블러 카드
- `.btn-primary` / `.btn-ghost`: hover/focus/active/disabled 상태 전부 정의된 버튼
- `.reveal` + IntersectionObserver: 스크롤 진입 시 1회성 페이드업
- `.value-card`, `.mission-card`: 스크롤 진입/이탈마다 반복 재생되는 순차 등장 애니메이션 (`entry.target.classList.toggle('is-visible', entry.isIntersecting)` 패턴)
- 스크롤 연동 인터랙션(Vision 섹션): `position:sticky` + 긴 wrapper(`vh` 단위) + JS로 스크롤 진행률(0~1) 계산해서 opacity/transform 조절

---

## 4. 프로젝트 구조

```
홈페이지/
├── index.html              # 메인 페이지 (전체 마크업+스타일+스크립트 단일 파일)
├── vercel.json              # 보안 헤더 설정
├── robots.txt / sitemap.xml # SEO
├── png/                      # 파비콘, OG 이미지 등 유틸리티 png 모음
│   └── og-image.png, favicon-32.png, apple-touch-icon.png, icon-512.png
├── brand_logo/
│   ├── logo.png             # 헤더용 (가로형, 다크그린)
│   └── logo_footer.png      # 푸터용 (가로형, 크림색 - 다크 배경용)
├── wuoadmin/
│   └── index.html           # 관리자 페이지 (문의 관리 + 문구 관리)
├── api/
│   ├── send-notification.js # Resend 이메일 발송
│   ├── admin.js              # 문의 목록 조회/상태변경 (service_role 인증)
│   └── content.js            # 사이트 문구 CMS 읽기/쓰기 (service_role 인증)
└── .github/dependabot.yml
```

---

## 5. 백엔드 연동 패턴 (재사용 핵심)

### 5-1. Supabase 키 2종류를 명확히 구분해서 쓸 것
- **anon public key**: 브라우저(`index.html`)에 그대로 노출해도 되는 키. 실제 보안은 테이블별 **RLS(Row Level Security) 정책**이 담당.
  - `consultations` 테이블: `INSERT`만 공개 허용, `SELECT` 정책 없음 → 방문자가 남의 문의 내역을 못 봄
  - `site_content` 테이블: `SELECT`만 공개 허용 (문구는 어차피 공개 정보) → `UPDATE`는 정책 자체를 안 만들어서 service_role만 가능
- **service_role key(진짜 비밀키)**: 브라우저에 절대 노출 금지. Vercel 서버리스 함수(`/api/*.js`) 안에서 `process.env.SUPABASE_SERVICE_ROLE_KEY`로만 사용. RLS를 완전히 우회하므로 관리자 기능(문의 조회, 문구 수정)에 사용.

### 5-2. 관리자 API 패턴 (`api/admin.js`, `api/content.js`)
```js
function checkAuth(req) {
  const password = req.headers['x-admin-password'];
  return Boolean(password) && password === process.env.ADMIN_PASSWORD;
}
// 요청마다 헤더의 비밀번호를 서버에서 직접 검증 → 통과해야 service_role로 Supabase 접근
```
- 클라이언트(관리자 페이지)는 `sessionStorage`에 비밀번호를 저장해두고, 모든 API 요청에 `x-admin-password` 헤더로 실어 보냄
- 세션은 2시간 지나면 자동 만료(클라이언트에서 타임스탬프 체크)
- **핵심 원칙**: URL을 숨기는 건 부차적 방어일 뿐, 진짜 보안은 "서버에서 비밀번호 검증 + service_role 키는 서버 밖으로 안 나감" 구조에 있음

### 5-3. 문구 CMS 패턴 (`site_content` 테이블)
- 홈페이지에 보이는 텍스트를 `key`/`value` 쌍으로 DB에 저장 (예: `hero.headline_1`)
- `index.html`의 각 텍스트 요소에 `data-ck="hero.headline_1"` 속성 부여
- 페이지 로드 시 anon key로 `site_content` 전체를 읽어와서 `data-ck` 매칭되는 요소의 `innerHTML`을 교체 (줄바꿈은 `\n` → `<br>` 변환)
- 관리자 페이지의 "문구 관리" 탭에서 동일한 키 목록을 폼으로 보여주고, 저장 시 `api/content.js`(service_role)로 upsert
- **주의**: 이 패턴을 쓰는 텍스트 요소는 `whitespace-nowrap`을 걸면 안 됨 (관리자가 긴 문구로 수정하면 잘려 보임) — 대신 자연스럽게 줄바꿈되도록 두고, 필요하면 반응형 폰트 크기로 대응

### 5-4. 이메일 발송 패턴 (`api/send-notification.js`)
- Resend REST API를 SDK 없이 `fetch`로 직접 호출 (의존성 없음, `package.json` 불필요)
- 발신 도메인 인증(Resend Dashboard → Domains) 필수 — 인증 전에는 가입 이메일로만 발송 가능
- 프론트엔드에서는 Supabase 저장 성공 후 **best-effort**로 호출 (이메일 실패해도 사용자에게는 문의 접수 성공으로 보여줌)

---

## 6. 배포 절차 체크리스트 (다음에 새 사이트 만들 때 그대로 반복)

1. **로컬 개발환경 준비**: Git, Node.js 설치 필요 시 `winget install Git.Git`, `winget install OpenJS.NodeJS.LTS` (설치 후 터미널/IDE **완전 재시작** 필요 — PATH가 즉시 반영 안 됨)
2. **GitHub 저장소 생성** (사용자가 웹에서 직접, 빈 저장소로)
3. `git init && git add . && git commit -m "Initial commit" && git branch -M main && git remote add origin [URL] && git push -u origin main`
   - `git push`는 브라우저 로그인 창이 떠야 해서 **사용자의 로컬 터미널에서 직접 1회 실행 필요** (그 이후엔 인증정보 캐시되어 자동 push 가능)
4. **Vercel**: GitHub 로그인 → Import → Deploy (설정 그대로, 별도 빌드 커맨드 불필요)
5. **Supabase 프로젝트 생성** → SQL Editor에서 테이블 생성 + RLS 정책 SQL 실행 (사용자가 직접)
6. **환경변수 등록** (Vercel → Settings → Environment Variables, Production+Preview 체크):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_PASSWORD`
   - 환경변수 추가/변경 후 **반드시 Redeploy**해야 반영됨
7. **커스텀 도메인 연결**: Vercel Domains에 추가 → 가비아 DNS에 A(`@`→`76.76.21.21`)/CNAME(`www`→`cname.vercel-dns.com.`, 끝에 점 필수) 등록. TTL은 기본값 그대로 둬도 무방
   - Vercel이 최신 IP(`216.198.79.1`) 권장하지만 레거시 레코드도 계속 정상 작동함
8. **www ↔ non-www 중 대표 도메인 하나를 정하고, canonical/OG/sitemap 전부 그 도메인으로 통일할 것** (안 그러면 Search Console 사이트맵 수집 실패)

---

## 7. 보안 체크리스트 (적용 완료된 항목)

- [x] service_role 키, Resend 키, 관리자 비밀번호 → 전부 Vercel 환경변수에만 저장 (코드/Git에 노출 없음)
- [x] `.gitignore`에 `.env*` 방어적으로 추가
- [x] Supabase RLS: 테이블별로 필요한 최소 권한만 정책 부여 (공개 INSERT/SELECT 구분)
- [x] 관리자 페이지: 추측 어려운 경로 + 서버사이드 비밀번호 검증 (URL 숨김은 보조 수단일 뿐)
- [x] `vercel.json`에 보안 헤더 설정: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
  - Tailwind CDN(런타임 JIT)을 쓰는 한 CSP에 `unsafe-inline`/`unsafe-eval` 불가피 — 더 엄격하게 하려면 Tailwind 빌드 방식 전환 필요
- [x] GitHub/Vercel/가비아 계정 2단계 인증
- [x] Dependabot (github-actions 생태계, 이 프로젝트엔 npm 의존성 자체가 없음)

---

## 8. SEO 체크리스트 (적용 완료된 항목)

- [x] `<title>`, `<meta name="description">`
- [x] Open Graph + Twitter Card 메타태그 (공유 시 미리보기)
- [x] OG 이미지 직접 제작 (1200x630 비율, 브랜드 톤)
- [x] `<link rel="canonical">` — **대표 도메인(www) 기준으로 통일**
- [x] JSON-LD 구조화 데이터 (`LocalBusiness` 타입 — 실제 사업장 주소가 있으므로 `Organization`보다 적합)
- [x] favicon (로고에서 아이콘 마크만 정사각형으로 크롭)
- [x] robots.txt (관리자/API 경로 제외) + sitemap.xml
- [x] Google Search Console + 네이버 서치어드바이저 소유확인 + 사이트맵 제출
- [ ] 네이버 스마트플레이스 / 구글 비즈니스 프로필 등록 (진행 권장, 로컬 검색 노출에 가장 효과적)

---

## 9. 작업 중 발견한 버그와 교훈 (중요 — 다음에 같은 실수 방지용)

1. **flex 컨테이너의 `items-center`가 자식 요소 폭을 붕괴시킨 버그**
   자식이 절대위치(absolute) 자손만 갖고 있으면(예: 스크롤 연동 스테이지 텍스트), `items-center`가 걸린 row-flex 부모 안에서 그 자식은 shrink-to-fit 계산 시 절대위치 자손의 크기를 반영 못 해서 폭이 0에 가깝게 붕괴 → 텍스트가 세로로 한 글자씩 쌓여 렌더링됨.
   **해결**: 그런 자식에 명시적으로 `w-full` 부여.

2. **`whitespace-nowrap`로 "한 줄 고정"한 헤드라인은 반응형 폰트 단계와 실제 컨테이너 폭이 정확히 맞물려야 함**
   1440px 데스크톱에서 확인해도 1024px 노트북 폭에서는 컬럼 폭이 좁아 안 맞을 수 있음 → 단어 중간이 줄바꿈되며 잘려 보이는 문제 발생. **반드시 360/375/768/1024/1280/1440px 등 여러 폭에서 직접 스크린샷 검증할 것** (하나의 폭만 보고 "됐다"고 판단하면 안 됨).

3. **`position:sticky` 스크롤텔링 섹션의 "빈 스크롤 구간" 문제**
   wrapper 높이(vh)를 실제 애니메이션에 필요한 것보다 훨씬 크게 잡으면, 애니메이션이 끝난 뒤에도 한참 정지 상태로 스크롤해야 하고, sticky가 풀린 뒤에는 콘텐츠가 다 스크롤되어 사라진 빈 배경만 한참 보이는 구간이 생김. wrapper 높이와 크로스페이드 타이밍을 실제 필요량에 맞게 튜닝할 것.

4. **CMS로 편집 가능한 텍스트는 `whitespace-nowrap`을 쓰면 안 됨**
   "디자인이 예쁘게 한 줄에 맞도록" 고정폭 처리한 문구를, 나중에 관리자가 CMS에서 길게 수정하면 그대로 잘려서 안 보이게 됨. 관리자 편집 가능 영역은 자연스러운 줄바꿈을 허용하는 게 안전.

5. **Windows 환경변수 갱신 지연**
   `winget install`로 Git/Node를 설치해도, 이미 열려있는 터미널/IDE는 갱신된 PATH를 못 읽음. **완전 재시작 필요** (새 탭만 여는 걸로는 부족).

6. **Vercel 환경변수는 추가/수정 후 재배포해야 실제로 반영됨** (자동 적용 안 됨).

7. **Resend는 발신 도메인 인증 전엔 가입 이메일로만 발송 가능** — 실제 서비스 이메일(예: `withusoncorp@withusoncorp.co.kr`)로 보내려면 반드시 도메인 인증(DNS 레코드 추가) 먼저.

8. **www ↔ non-www 리다이렉트가 있는 도메인은 SEO 메타데이터/사이트맵/Search Console 속성을 전부 "실제 Production 도메인"(Vercel에서 Production으로 표시된 쪽)으로 통일해야 함.** 안 맞으면 사이트맵이 "가져올 수 없음" 에러로 뜸.

---

## 10. 새 페이지/사이트를 만들 때 빠른 체크리스트

1. 이 문서의 색상/폰트/컴포넌트 패턴(섹션 4)을 그대로 재사용
2. 백엔드가 필요하면 5장의 anon key vs service_role key 원칙을 그대로 적용
3. 관리자 기능이 필요하면 5-2, 5-3의 인증/CMS 패턴 재사용
4. 배포는 6장 절차 그대로 (이미 같은 Vercel/GitHub 계정이면 3~4단계는 생략 가능)
5. 새 페이지를 만들 때도 반드시 **여러 화면 폭에서 스크린샷 검증** (교훈 2번 참고) — Playwright + Node.js 로컬 설치되어 있으면 바로 활용 가능
6. 새 도메인 연결 시 8번 교훈(www 통일) 미리 챙길 것
