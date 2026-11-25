/*
 * 사이트 메뉴 단일 소스 (헤더 · 모바일 메뉴 · 푸터가 모두 여기서 그려짐)
 *
 * 하위 메뉴 추가: 해당 메뉴의 children 배열에 { label, href } 를 넣으면
 * 드롭다운(데스크톱)과 아코디언(모바일)이 자동으로 생긴다.
 *   - 같은 페이지 섹션: { label: '프로그램 목록', href: '/education#programs' }
 *   - 별도 페이지:      { label: '강사 소개',   href: '/education-instructors' }
 * 자세한 절차는 claude_homepage.md 의 "하위 메뉴 추가 방법" 참고.
 */
window.SITE_NAV = [
  { label: 'About', href: '/', children: [
      { label: 'Vision', href: '/#vision' },
      { label: 'Values', href: '/#values' },
      { label: 'Business', href: '/#business' },
      { label: 'Mission', href: '/#mission' },
      { label: 'Contact', href: '/#contact' },
  ]},
  { label: '교육 프로그램', href: '/education', children: [] },
  { label: '찾아가는 공연', href: '/performance', children: [] },
  { label: '기관 탐색 서비스', href: '/platform', children: [] },
  { label: '온라인 언론사', href: '/press', children: [] },
];
