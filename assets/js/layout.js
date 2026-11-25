/*
 * 공통 레이아웃 렌더러 — window.SITE_NAV(site-config.js)를 읽어
 * 헤더(데스크톱 메뉴+드롭다운) · 모바일 메뉴 · 푸터를 그린다.
 *
 * 각 페이지에는 아래 두 자리만 두면 된다.
 *   <header id="site-header" class="fixed top-0 inset-x-0 z-50 glass-strong h-16 md:h-20"></header>
 *   <footer id="site-footer"></footer>
 * 스크립트 순서: site-config.js → layout.js → content.js
 */
(function () {
  'use strict';

  /* 헤더·푸터의 편집 가능 문구 기본값 (관리자 '공통' 탭이 이 목록을 읽음) */
  var LAYOUT_TEXT = {
    'header.cta': '문의하기',
    'footer.company_name': '주식회사 위더스온',
    'footer.info_line1': '대표 신용욱  |  사업자등록번호 531-86-03785',
    'footer.info_line2': '서울특별시 동대문구 전농로 82, JM빌딩 3층',
    'footer.info_line3': 'T 02-2217-9765  |  F 0504-317-0104',
    'footer.info_line4': 'withusoncorp@withusoncorp.co.kr',
    'footer.copyright': '© 2026 WithUsOn Corp. All rights reserved.',
  };
  window.WUO_LAYOUT_TEXT = LAYOUT_TEXT;

  var NAV = window.SITE_NAV || [];
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (!headerEl && !footerEl) return; // 관리자 페이지 등: 기본값만 공개하고 종료

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function normPath(p) {
    p = (p || '/').split('#')[0].split('?')[0];
    p = p.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '');
    return p === '' ? '/' : p;
  }
  var current = normPath(location.pathname);
  var isHome = current === '/';

  function isPageLink(href) { return href.indexOf('#') === -1; }
  function itemActive(item) {
    if (normPath(item.href) === current) return true;
    return (item.children || []).some(function (c) { return isPageLink(c.href) && normPath(c.href) === current; });
  }
  function childActive(c) { return isPageLink(c.href) && normPath(c.href) === current; }

  /* 라벨 전환(hoverLabel / activeLabel) — site-config.js 참고 */
  function swapName(item) {
    var alt = item.hoverLabel || item.activeLabel;
    return alt && alt !== item.label ? item.label + ' (' + alt + ')' : '';
  }
  function navLabelHtml(item, active) {
    var alt = item.hoverLabel || item.activeLabel;
    if (!alt) return esc(item.label);
    var showAlt = active && item.activeLabel;
    // 두 라벨을 같은 칸에 겹쳐 두어 폭을 긴 쪽에 고정하고, opacity/transform 으로만 교차 전환
    return '<span class="nav-swap' + (showAlt ? ' show-alt' : '') + (item.hoverLabel ? ' has-hover' : '') + '" aria-hidden="true">' +
      '<span class="nav-swap-a">' + esc(item.label) + '</span>' +
      '<span class="nav-swap-b">' + esc(showAlt ? item.activeLabel : alt) + '</span>' +
    '</span>';
  }
  function navAria(item) {
    var name = swapName(item);
    return name ? ' aria-label="' + esc(name) + '"' : '';
  }
  function mobileLabel(item, active) {
    return active && item.activeLabel ? item.activeLabel : item.label;
  }

  var CHEVRON ='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---------- Header ---------- */
  function renderHeader() {
    var navHtml = NAV.map(function (item, i) {
      var active = itemActive(item);
      var aria = active ? ' aria-current="page"' : '';
      var linkCls = 'nav-link whitespace-nowrap hover:text-ink' + (active ? ' is-active' : '');
      var kids = item.children || [];
      if (!kids.length) {
        return '<li class="nav-item"><a href="' + esc(item.href) + '" class="' + linkCls + '"' + aria + navAria(item) + '>' + navLabelHtml(item, active) + '</a></li>';
      }
      var panelId = 'dd-panel-' + i;
      var kidsHtml = kids.map(function (c) {
        var ca = childActive(c);
        return '<li><a href="' + esc(c.href) + '" class="dd-link text-sm' + (ca ? ' text-ink font-bold' : '') + '"' + (ca ? ' aria-current="page"' : '') + '>' + esc(c.label) + '</a></li>';
      }).join('');
      return '' +
        '<li class="nav-item relative" data-dd>' +
          '<div class="nav-row flex items-center gap-1">' +
            '<a href="' + esc(item.href) + '" class="' + linkCls + '"' + aria + navAria(item) + '>' + navLabelHtml(item, active) + '</a>' +
            '<button type="button" class="nav-toggle w-6 h-6 flex items-center justify-center rounded-md text-inkfaint" aria-expanded="false" aria-controls="' + panelId + '" aria-label="' + esc(item.label) + ' 하위 메뉴 열기">' + CHEVRON + '</button>' +
          '</div>' +
          '<div class="dd-panel" id="' + panelId + '">' +
            '<ul class="glass-strong rounded-2xl p-2 shadow-brand-md">' + kidsHtml + '</ul>' +
          '</div>' +
        '</li>';
    }).join('');

    headerEl.innerHTML = '' +
      '<div class="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">' +
        '<a href="/" class="logo-link flex items-center gap-2.5 rounded-lg" aria-label="위더스온 홈">' +
          '<img src="/brand_logo/logo.png" alt="WithUsOn 로고" class="h-7 md:h-8 w-auto">' +
        '</a>' +
        '<nav aria-label="주 메뉴" class="hidden lg:block">' +
          '<ul class="flex items-center gap-7 xl:gap-9 text-[15px] font-medium text-inksoft">' + navHtml + '</ul>' +
        '</nav>' +
        '<div class="flex items-center gap-2">' +
          '<a href="/#contact" class="btn btn-primary text-sm px-5 py-2.5 hidden sm:inline-flex" data-ck="header.cta">' + esc(LAYOUT_TEXT['header.cta']) + '</a>' +
          '<button type="button" id="menuOpenBtn" class="menu-btn lg:hidden w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-ink" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mobileMenu">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    // Logo on the home page: smooth scroll to top instead of reload
    var logo = headerEl.querySelector('.logo-link');
    logo.addEventListener('click', function (e) {
      if (!isHome) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });

    setupDropdowns();
  }

  /* Desktop dropdown: hover + keyboard focus, Esc to close, aria-expanded synced */
  function setupDropdowns() {
    var items = headerEl.querySelectorAll('[data-dd]');
    items.forEach(function (item) {
      var btn = item.querySelector('.nav-toggle');
      var closeTimer = null;
      function open() {
        clearTimeout(closeTimer);
        items.forEach(function (other) { if (other !== item) close(other); });
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('열기', '닫기'));
      }
      function closeSelf() { close(item); }
      item._open = open;

      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeSelf, 120); });
      item.addEventListener('focusin', function () {
        if (item._suppressFocusOpen) { item._suppressFocusOpen = false; return; }
        open();
      });
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) { item._suppressFocusOpen = false; closeSelf(); }
      });
      btn.addEventListener('click', function () {
        if (item.classList.contains('is-open')) closeSelf(); else open();
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('is-open')) {
          e.stopPropagation();
          closeSelf();
          // 포커스를 토글 버튼으로 돌려주되, 그 focusin 으로 다시 열리지 않게 한다
          if (document.activeElement !== btn) { item._suppressFocusOpen = true; btn.focus(); }
        }
      });
    });
    function close(item) {
      if (!item.classList.contains('is-open')) return;
      item.classList.remove('is-open');
      var b = item.querySelector('.nav-toggle');
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', b.getAttribute('aria-label').replace('닫기', '열기'));
    }
    document.addEventListener('click', function (e) {
      items.forEach(function (item) { if (!item.contains(e.target)) close(item); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') items.forEach(close);
    });
  }

  /* ---------- Mobile menu (drawer + accordion) ---------- */
  function renderMobileMenu() {
    var listHtml = NAV.map(function (item, i) {
      var active = itemActive(item);
      var kids = item.children || [];
      var base = 'm-link flex items-center w-full px-4 py-3.5 rounded-2xl text-[17px] font-semibold text-ink';
      if (!kids.length) {
        return '<li><a href="' + esc(item.href) + '" class="' + base + (active ? ' is-active' : '') + '"' + (active ? ' aria-current="page"' : '') + navAria(item) + '>' + esc(mobileLabel(item, active)) + '</a></li>';
      }
      var subId = 'm-sub-' + i;
      var kidsHtml = '<li><a href="' + esc(item.href) + '" class="m-link block px-4 py-2.5 rounded-xl text-[15px] text-inksoft' + (normPath(item.href) === current ? ' is-active' : '') + '">' + esc(item.label) + ' 전체 보기</a></li>' +
        kids.map(function (c) {
          var ca = childActive(c);
          return '<li><a href="' + esc(c.href) + '" class="m-link block px-4 py-2.5 rounded-xl text-[15px] text-inksoft' + (ca ? ' is-active' : '') + '"' + (ca ? ' aria-current="page"' : '') + '>' + esc(c.label) + '</a></li>';
        }).join('');
      return '' +
        '<li>' +
          '<button type="button" class="m-acc-btn flex items-center justify-between w-full px-4 py-3.5 rounded-2xl text-[17px] font-semibold text-left ' + (active ? 'text-brand-darker' : 'text-ink') + '" aria-expanded="false" aria-controls="' + subId + '">' +
            '<span>' + esc(mobileLabel(item, active)) + '</span>' + CHEVRON +
          '</button>' +
          '<div class="m-sub" id="' + subId + '"><div><ul class="pl-3 pb-2 border-l-2 border-brand-100 ml-4">' + kidsHtml + '</ul></div></div>' +
        '</li>';
    }).join('');

    var wrap = document.createElement('div');
    wrap.id = 'mobileMenu';
    wrap.className = 'm-overlay fixed inset-0 z-[60] lg:hidden';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '' +
      '<div class="absolute inset-0 bg-forest-darker/45" data-menu-close></div>' +
      '<div class="m-drawer absolute right-0 top-0 h-full w-[86%] max-w-sm bg-canvas flex flex-col shadow-brand-lg" role="dialog" aria-modal="true" aria-label="전체 메뉴">' +
        '<div class="flex items-center justify-between px-5 h-16 border-b border-brand-100">' +
          '<a href="/" class="m-link rounded-lg -ml-1 p-1" aria-label="위더스온 홈"><img src="/brand_logo/logo.png" alt="WithUsOn 로고" class="h-7 w-auto"></a>' +
          '<button type="button" class="menu-btn w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-ink" data-menu-close aria-label="메뉴 닫기">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<nav aria-label="모바일 메뉴" class="flex-1 overflow-y-auto px-3 py-4"><ul class="space-y-1">' + listHtml + '</ul></nav>' +
        '<div class="p-5 border-t border-brand-100">' +
          '<a href="/#contact" class="btn btn-primary w-full py-3.5 text-[15px]" data-ck="header.cta">' + esc(LAYOUT_TEXT['header.cta']) + '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    var openBtn = document.getElementById('menuOpenBtn');
    var drawer = wrap.querySelector('.m-drawer');

    function focusables() {
      return Array.prototype.filter.call(
        drawer.querySelectorAll('a[href], button:not([disabled])'),
        function (el) { return el.offsetParent !== null; }
      );
    }
    function openMenu() {
      wrap.classList.add('is-open');
      wrap.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      setTimeout(function () { var f = focusables(); if (f.length) f[f.length > 1 ? 1 : 0].focus(); }, 60);
    }
    function closeMenu(restoreFocus) {
      if (!wrap.classList.contains('is-open')) return;
      wrap.classList.remove('is-open');
      wrap.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (restoreFocus !== false) openBtn.focus();
    }
    openBtn.addEventListener('click', openMenu);
    wrap.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', function () { closeMenu(); });
    });
    // Close when a link is chosen (incl. same-page #hash links)
    wrap.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(false); });
    });
    // Accordion
    wrap.querySelectorAll('.m-acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = document.getElementById(btn.getAttribute('aria-controls'));
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(willOpen));
        sub.classList.toggle('is-open', willOpen);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (!wrap.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') { // simple focus trap
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Desktop resize → make sure the drawer does not stay open/locked
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeMenu(false); });
  }

  /* ---------- Footer ---------- */
  /* 훌터 · 마인드 투데이 로고를 단색으로 변환한 경로 (원본: assets/img/footer/*.svg) */
  var ICON_PATH_HOOLTER = 'M20.75,23.88 20.31 23.88 20.06 23.78 19.86 23.78 18.62 23.38 17.98 23.08 17.18 22.59 16.69 22.19 15.87 21.27 15.27 20.18 14.93 19.04 14.88 18.45 14.83 18.4 14.83 16.76 15.07 15.57 15.07 15.22 14.8 15.0 14.65 15.0 14.36 15.15 6.17 19.71 5.38 20.11 4.93 20.26 4.49 20.36 3.69 20.36 3.3 20.26 2.6 19.86 2.18 19.44 1.93 18.99 1.83 18.64 1.83 18.05 2.13 17.31 2.55 16.83 3.25 16.44 3.84 16.29 4.98 16.14 6.42 15.84 7.56 15.69 7.86 15.6 8.11 15.6 9.0 15.4 9.25 15.4 10.44 15.15 11.28 15.05 11.58 14.95 12.42 14.85 12.72 14.75 13.56 14.65 13.86 14.55 14.11 14.55 14.4 14.45 14.53 14.23 14.48 13.93 14.21 13.76 11.98 13.41 10.79 13.17 10.54 13.17 9.64 12.97 9.4 12.97 9.1 12.87 8.26 12.77 7.96 12.67 6.82 12.52 6.52 12.42 5.68 12.32 5.38 12.22 4.24 12.07 3.94 11.98 3.69 11.98 2.9 11.68 2.33 11.21 1.93 10.51 1.88 9.57 2.18 8.88 2.7 8.36 3.35 8.01 3.74 7.91 4.64 7.91 5.03 8.01 14.6 13.41 14.95 13.41 15.12 13.24 15.17 13.04 15.02 12.69 10.86 5.36 9.72 3.22 9.62 2.78 9.62 2.03 9.82 1.39 10.12 0.89 10.59 0.42 11.03 0.17 11.38 0.07 11.93 0.07 12.32 0.17 13.02 0.62 13.29 0.94 13.54 1.39 13.74 2.18 13.83 3.02 13.93 3.32 14.03 4.17 14.13 4.46 14.28 5.6 14.53 6.79 14.53 7.04 14.63 7.34 14.98 9.62 15.07 9.92 15.22 11.06 15.32 11.36 15.47 12.5 15.57 12.79 15.79 12.97 16.04 12.92 16.21 12.69 16.31 11.85 16.41 11.55 16.56 10.41 16.86 8.98 16.86 8.73 17.11 7.54 17.21 6.69 17.31 6.4 17.45 5.26 17.55 4.96 17.7 3.82 18.0 2.38 18.05 1.83 18.3 1.19 18.5 0.89 18.87 0.52 19.17 0.32 19.71 0.12 20.4 0.12 20.75 0.22 21.25 0.52 21.72 1.04 21.97 1.54 22.12 2.13 22.12 2.78 21.97 3.32 18.25 10.71 18.25 10.81 17.9 11.5 17.26 13.44 17.26 13.64 17.06 14.38 17.06 14.68 16.96 15.07 16.96 15.62 16.91 15.67 16.96 15.72 16.91 15.82 16.91 16.46 16.96 16.56 16.91 16.61 16.96 16.66 16.96 17.16 17.01 17.21 17.06 17.75 17.45 18.99 17.9 19.79 18.77 20.7 19.21 21.0 19.71 21.25 20.31 21.45 20.9 21.55 21.2 21.69 21.57 22.07 21.67 22.26 21.72 22.96 21.57 23.31 21.15 23.73 20.75 23.88Z';
  var ICON_PATH_MINDTODAY = 'M19.09,5.93 18.2 5.83 17.6 5.58 17.21 5.33 16.69 4.81 16.49 4.51 16.24 4.02 16.09 3.42 16.09 2.53 16.24 1.93 16.64 1.24 17.06 0.77 17.55 0.42 18.0 0.22 18.69 0.07 19.24 0.07 19.98 0.22 20.33 0.37 20.98 0.82 21.3 1.19 21.64 1.79 21.84 2.43 21.84 2.78 21.89 2.83 21.84 2.88 21.89 3.12 21.84 3.17 21.84 3.47 21.69 4.02 21.45 4.51 21.1 4.96 20.43 5.53 20.03 5.73 19.09 5.93ZM5.01,5.93 4.36 5.88 3.87 5.73 3.47 5.53 3.07 5.23 2.6 4.71 2.26 4.07 2.06 3.17 2.11 3.12 2.06 2.98 2.11 2.93 2.11 2.63 2.26 2.03 2.55 1.49 2.85 1.09 3.27 0.72 3.67 0.47 4.46 0.22 5.75 0.27 6.05 0.37 6.74 0.77 7.21 1.24 7.46 1.59 7.76 2.33 7.76 2.58 7.81 2.63 7.81 3.37 7.71 3.82 7.51 4.31 7.21 4.76 6.64 5.33 6.35 5.53 5.65 5.83 5.06 5.88 5.01 5.93ZM20.98,23.88 20.48 23.88 20.43 23.83 19.88 23.78 19.29 23.48 18.72 22.86 18.47 22.17 18.45 12.62 17.9 12.72 17.31 13.02 16.76 13.41 16.04 14.13 15.69 14.58 14.36 16.76 13.56 17.8 12.79 18.42 12.4 18.57 12.1 18.57 12.05 18.62 11.55 18.57 10.81 18.22 9.89 17.26 8.6 15.12 7.66 13.88 6.69 13.07 6.15 12.77 5.7 12.62 5.5 12.62 5.43 12.74 5.43 21.07 5.48 21.17 5.43 21.22 5.43 22.31 5.33 22.61 5.03 23.11 4.76 23.38 4.17 23.73 3.82 23.83 3.52 23.83 3.47 23.88 2.58 23.83 2.23 23.73 1.69 23.43 1.21 22.86 0.97 22.12 0.97 8.43 1.12 7.79 1.46 7.19 1.74 6.92 2.18 6.62 2.88 6.42 3.57 6.42 4.66 6.67 6.0 7.31 7.24 8.26 8.16 9.17 9.2 10.56 9.74 11.5 10.69 12.89 11.21 13.41 11.45 13.56 11.75 13.66 12.2 13.66 12.79 13.36 13.26 12.89 13.76 12.2 14.85 10.41 15.6 9.42 16.91 8.06 17.6 7.51 18.15 7.17 19.09 6.72 20.23 6.42 21.12 6.42 21.67 6.57 22.12 6.82 22.69 7.44 22.93 8.08 22.93 20.48 22.98 20.53 22.98 22.12 22.74 22.86 22.36 23.33 22.02 23.58 21.57 23.78 21.02 23.83 20.98 23.88Z';

  function renderFooter() {
    var t = LAYOUT_TEXT;
    var links = NAV.map(function (item) {
      return '<li><a href="' + esc(item.href) + '" class="foot-link">' + esc(item.label) + '</a></li>';
    }).join('');
    footerEl.className = 'relative bg-forest-darker px-6 pt-16 pb-10 border-t border-white/10';
    footerEl.innerHTML = '' +
      '<div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 md:gap-8">' +
        '<div class="text-center md:text-left">' +
          '<img src="/brand_logo/logo_footer.png" alt="WithUsOn 로고" class="h-16 w-auto mx-auto md:mx-0 mb-4">' +
          '<p class="text-sm font-bold text-white mb-2" data-ck="footer.company_name">' + esc(t['footer.company_name']) + '</p>' +
          '<div class="text-xs text-white/55 leading-relaxed space-y-1">' +
            '<p data-ck="footer.info_line1">' + esc(t['footer.info_line1']) + '</p>' +
            '<p data-ck="footer.info_line2">' + esc(t['footer.info_line2']) + '</p>' +
            '<p data-ck="footer.info_line3">' + esc(t['footer.info_line3']) + '</p>' +
            '<p data-ck="footer.info_line4">' + esc(t['footer.info_line4']) + '</p>' +
            '<p class="pt-2"><a href="/privacy" class="foot-link font-semibold text-white/75">개인정보처리방침</a></p>' +
            '<p class="text-white/35" data-ck="footer.copyright">' + esc(t['footer.copyright']) + '</p>' +
          '</div>' +
        '</div>' +
        '<nav aria-label="푸터 메뉴" class="flex justify-center">' +
          '<ul class="flex flex-col items-center gap-3 text-sm text-white/65">' + links + '</ul>' +
        '</nav>' +
        '<div class="flex items-start justify-center md:justify-end gap-3">' +
          '<a href="https://blog.naver.com/withuson-corp" target="_blank" rel="noopener noreferrer" aria-label="네이버 블로그" class="icon-btn w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><text x="12" y="17.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16" letter-spacing="-0.5">bl</text></svg>' +
          '</a>' +
          '<a href="https://www.instagram.com/withuson.corp/" target="_blank" rel="noopener noreferrer" aria-label="인스타그램" class="icon-btn w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>' +
          '</a>' +
          '<a href="https://hoolter.co.kr" target="_blank" rel="noopener noreferrer" aria-label="훌터 바로가기" class="icon-btn w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="' + ICON_PATH_HOOLTER + '"/></svg>' +
          '</a>' +
          '<a href="https://mindtoday.co.kr" target="_blank" rel="noopener noreferrer" aria-label="마인드 투데이 바로가기" class="icon-btn w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="' + ICON_PATH_MINDTODAY + '"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  if (headerEl) {
    renderHeader();
    renderMobileMenu();
    var onScroll = function () { headerEl.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (footerEl) renderFooter();
})();
