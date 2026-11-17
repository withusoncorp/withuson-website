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

  var CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---------- Header ---------- */
  function renderHeader() {
    var navHtml = NAV.map(function (item, i) {
      var active = itemActive(item);
      var aria = active ? ' aria-current="page"' : '';
      var linkCls = 'nav-link whitespace-nowrap hover:text-ink' + (active ? ' is-active' : '');
      var kids = item.children || [];
      if (!kids.length) {
        return '<li class="nav-item"><a href="' + esc(item.href) + '" class="' + linkCls + '"' + aria + '>' + esc(item.label) + '</a></li>';
      }
      var panelId = 'dd-panel-' + i;
      var kidsHtml = kids.map(function (c) {
        var ca = childActive(c);
        return '<li><a href="' + esc(c.href) + '" class="dd-link text-sm' + (ca ? ' text-ink font-bold' : '') + '"' + (ca ? ' aria-current="page"' : '') + '>' + esc(c.label) + '</a></li>';
      }).join('');
      return '' +
        '<li class="nav-item relative" data-dd>' +
          '<div class="nav-row flex items-center gap-1">' +
            '<a href="' + esc(item.href) + '" class="' + linkCls + '"' + aria + '>' + esc(item.label) + '</a>' +
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
        return '<li><a href="' + esc(item.href) + '" class="' + base + (active ? ' is-active' : '') + '"' + (active ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a></li>';
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
            '<span>' + esc(item.label) + '</span>' + CHEVRON +
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
            '<p class="pt-2 text-white/35" data-ck="footer.copyright">' + esc(t['footer.copyright']) + '</p>' +
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
