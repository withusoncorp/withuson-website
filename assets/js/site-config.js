/*
 * 사이트 메뉴 단일 소스 (헤더 · 모바일 메뉴 · 푸터가 모두 여기서 그려짐)
 *
 * 하위 메뉴 추가: 해당 메뉴의 children 배열에 { label, href } 를 넣으면
 * 드롭다운(데스크톱)과 아코디언(모바일)이 자동으로 생긴다.
 *   - 같은 페이지 섹션: { label: '프로그램 목록', href: '/education#programs' }
 *   - 별도 페이지:      { label: '강사 소개',   href: '/education-instructors' }
 * 자세한 절차는 claude_homepage.md 의 "하위 메뉴 추가 방법" 참고.
 *
 * 라벨 전환 옵션 (선택, 어느 메뉴에나 붙일 수 있음)
 *   - hoverLabel:  데스크톱에서 마우스를 올리거나 키보드 포커스가 가면 보이는 라벨
 *   - activeLabel: 해당 페이지에 있을 때 항상 보이는 라벨 (데스크톱·모바일 공통)
 *   - 스크린리더 이름은 '라벨 (hoverLabel)' 로 고정된다.
 */
window.SITE_NAV = [
  { label: '회사 소개', href: '/', children: [] },
  { label: '교육 운영', href: '/education', children: [] },
  { label: '공연 기획', href: '/performance', children: [] },
  { label: '기관 연결', href: '/platform', children: [], hoverLabel: 'Hoolter', activeLabel: 'Hoolter' },
  { label: '미디어', href: '/press', children: [], hoverLabel: 'Mind Today', activeLabel: 'Mind Today' },
];
