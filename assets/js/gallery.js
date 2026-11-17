/*
 * 관련 자료 갤러리 + 라이트박스
 *   <div data-gallery="education"></div>       ← 이미지 그리드가 그려질 자리
 *   <div data-gallery-empty hidden>…</div>      ← 0장일 때 보여줄 안내
 * 데이터: gallery_items (is_visible = true, sort_order 순). 관리자 '관련 자료' 탭에서 관리.
 */
(function () {
  'use strict';
  var WUO = window.WUO || {};
  var grids = document.querySelectorAll('[data-gallery]');
  if (!grids.length) return;

  var esc = WUO.escapeHtml || function (s) { return String(s); };

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbCap, lbCount, lbPrev, lbNext, lbClose, items = [], index = 0, lastFocus = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lb fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '관련 자료 크게 보기');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = '' +
      '<div class="absolute inset-0 bg-forest-darker/90" data-lb-close></div>' +
      '<figure class="relative z-10 max-w-5xl w-full flex flex-col items-center">' +
        '<img class="max-h-[74vh] w-auto max-w-full rounded-2xl shadow-brand-lg object-contain bg-black/20" alt="">' +
        '<figcaption class="mt-4 text-center text-sm md:text-base text-white/85 leading-relaxed max-w-2xl"></figcaption>' +
        '<p class="mt-1 text-xs text-white/45" data-lb-count></p>' +
      '</figure>' +
      '<button type="button" class="lb-btn absolute top-4 right-4 md:top-6 md:right-6 z-20 w-11 h-11 rounded-full glass-dark text-white flex items-center justify-center" data-lb-close aria-label="닫기">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" class="lb-btn absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass-dark text-white flex items-center justify-center" data-lb-prev aria-label="이전 이미지">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button type="button" class="lb-btn absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass-dark text-white flex items-center justify-center" data-lb-next aria-label="다음 이미지">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('figcaption');
    lbCount = lb.querySelector('[data-lb-count]');
    lbPrev = lb.querySelector('[data-lb-prev]');
    lbNext = lb.querySelector('[data-lb-next]');
    lbClose = lb.querySelector('button[data-lb-close]');

    lb.querySelectorAll('[data-lb-close]').forEach(function (el) { el.addEventListener('click', close); });
    lbPrev.addEventListener('click', function () { show(index - 1); });
    lbNext.addEventListener('click', function () { show(index + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
    // swipe (mobile)
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var it = items[index];
    lbImg.src = it.image_url;
    lbImg.alt = it.alt || it.caption || '';
    lbCap.textContent = it.caption || '';
    lbCap.hidden = !it.caption;
    lbCount.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
    lbPrev.hidden = lbNext.hidden = items.length < 2;
  }
  function open(list, i, trigger) {
    if (!lb) buildLightbox();
    items = list; lastFocus = trigger;
    show(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    setTimeout(function () { lbClose.focus(); }, 30);
  }
  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- Grid ---------- */
  function render(grid, list) {
    var section = grid.closest('section') || document;
    var empty = section.querySelector('[data-gallery-empty]');
    if (!list.length) {
      grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    grid.innerHTML = list.map(function (it, i) {
      var cap = it.caption ? '<figcaption class="mt-3 text-sm text-inksoft leading-snug px-1">' + esc(it.caption) + '</figcaption>' : '';
      return '<figure class="reveal' + (i % 3 ? ' reveal-delay-' + (i % 3) : '') + ' is-visible">' +
        '<button type="button" class="gal-item" data-i="' + i + '" aria-label="' + esc((it.caption || it.alt || '관련 자료 이미지') + ' 크게 보기') + '">' +
          '<img src="' + esc(it.image_url) + '" alt="' + esc(it.alt || it.caption || '') + '" loading="lazy" decoding="async" width="800" height="600">' +
        '</button>' + cap +
      '</figure>';
    }).join('');
    grid.hidden = false;
    grid.querySelectorAll('.gal-item').forEach(function (btn) {
      btn.addEventListener('click', function () { open(list, Number(btn.getAttribute('data-i')), btn); });
    });
  }

  grids.forEach(function (grid) {
    var page = grid.getAttribute('data-gallery');
    if (!WUO.supabase) { render(grid, []); return; }
    // 네트워크가 느리거나 끊기면 5초 뒤 '준비 중' 안내를 먼저 보여준다 (응답이 오면 다시 그림)
    setTimeout(function () { if (grid.hidden && !grid.children.length) render(grid, []); }, 5000);
    WUO.supabase.from('gallery_items')
      .select('id, image_url, caption, alt, sort_order')
      .eq('page', page)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(function (res) {
        var list = (!res.error && res.data) ? res.data.filter(function (it) { return /^https:\/\//i.test(it.image_url || ''); }) : [];
        render(grid, list);
      }, function () { render(grid, []); });
  });
})();
