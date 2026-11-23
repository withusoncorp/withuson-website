/*
 * 관련 자료 — 자동 슬라이드 갤러리 (4개 사업 페이지 공통) + 라이트박스
 *
 *   <div data-gallery="education" hidden></div>   ← 슬라이드가 그려질 자리 (화면 폭 전체)
 *   <div data-gallery-empty hidden>…</div>        ← 0장일 때 보여줄 안내 (같은 section 안)
 *
 * 데이터: gallery_items (is_visible = true, sort_order 순). 관리자 '관련 자료' 탭에서 관리.
 *   caption → 사진 왼쪽 아래 설명, alt → 대체 텍스트
 *
 * 동작
 *   - 3장 이상: 끝없이 천천히 흐른다(마키). 마우스를 올리거나 포커스가 가면 멈춘다.
 *     좌우 화살표 · 스와이프/드래그 · 키보드 ←/→ 로 넘길 수 있고, 멈춤/재생 버튼이 있다.
 *   - 1~2장: 반복 없이 가운데 정렬로 고정 배치
 *   - 0장: 섹션 안의 '준비 중' 안내
 *   - prefers-reduced-motion: 자동 재생 없음(수동 이동만, 애니메이션 없이 즉시 이동)
 *   - 사진을 누르면 라이트박스로 크게 본다.
 */
(function () {
  'use strict';
  var WUO = window.WUO || {};
  var holders = document.querySelectorAll('[data-gallery]');
  if (!holders.length) return;

  var esc = WUO.escapeHtml || function (s) { return String(s); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SPEED = 42;          // 자동 흐름 속도 (px/초)
  var TWEEN_MS = 450;      // 화살표로 한 장 넘길 때 걸리는 시간
  var DRAG_THRESHOLD = 6;  // 이만큼 움직이면 클릭이 아니라 드래그로 본다 (px)

  var ICON = {
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z"/></svg>'
  };

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbCap, lbCount, lbPrev, lbNext, lbClose, items = [], index = 0, lastFocus = null, onLbClose = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lb fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '사진 크게 보기');
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
      '<button type="button" class="lb-btn absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass-dark text-white flex items-center justify-center" data-lb-prev aria-label="이전 사진">' + ICON.prev.replace('18', '20').replace('18', '20') + '</button>' +
      '<button type="button" class="lb-btn absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass-dark text-white flex items-center justify-center" data-lb-next aria-label="다음 사진">' + ICON.next.replace('18', '20').replace('18', '20') + '</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('figcaption');
    lbCount = lb.querySelector('[data-lb-count]');
    lbPrev = lb.querySelector('[data-lb-prev]');
    lbNext = lb.querySelector('[data-lb-next]');
    lbClose = lb.querySelector('button[data-lb-close]');

    lb.querySelectorAll('[data-lb-close]').forEach(function (el) { el.addEventListener('click', closeLightbox); });
    lbPrev.addEventListener('click', function () { showLightbox(index - 1); });
    lbNext.addEventListener('click', function () { showLightbox(index + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showLightbox(index - 1);
      else if (e.key === 'ArrowRight') showLightbox(index + 1);
      else if (e.key === 'Tab') {
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) showLightbox(index + (dx < 0 ? 1 : -1));
    });
  }
  function showLightbox(i) {
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
  function openLightbox(list, i, trigger, onClose) {
    if (!lb) buildLightbox();
    items = list; lastFocus = trigger; onLbClose = onClose || null;
    showLightbox(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    setTimeout(function () { lbClose.focus(); }, 30);
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (lastFocus) lastFocus.focus();
    if (onLbClose) onLbClose();
  }

  /* ---------- 카드 ---------- */
  function cardHtml(it, i, clone) {
    var label = (it.caption || it.alt || '현장 사진') + ' 크게 보기';
    return '<li class="gm-card"' + (clone ? ' aria-hidden="true"' : '') + '>' +
      '<button type="button" class="gm-btn" data-i="' + i + '"' + (clone ? ' tabindex="-1"' : '') + ' aria-label="' + esc(label) + '">' +
        '<img src="' + esc(it.image_url) + '" alt="' + (clone ? '' : esc(it.alt || it.caption || '')) + '" loading="lazy" decoding="async" draggable="false" width="600" height="800">' +
        (it.caption ? '<span class="gm-cap">' + esc(it.caption) + '</span>' : '') +
      '</button>' +
    '</li>';
  }

  /* ---------- 0장 / 1~2장 ---------- */
  function renderEmpty(holder) {
    var section = holder.closest('section') || document;
    var empty = section.querySelector('[data-gallery-empty]');
    holder.hidden = true;
    if (empty) empty.hidden = false;
  }
  function renderStatic(holder, list) {
    holder.innerHTML = '<ul class="gm-static">' + list.map(function (it, i) { return cardHtml(it, i, false); }).join('') + '</ul>';
    holder.querySelectorAll('.gm-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { openLightbox(list, Number(btn.getAttribute('data-i')), btn); });
    });
  }

  /* ---------- 3장 이상: 자동 슬라이드 ---------- */
  function renderMarquee(holder, list) {
    var heading = (holder.closest('section') || document).querySelector('h2');
    var label = holder.getAttribute('data-gallery-label') || (heading && heading.textContent.trim()) || '현장 사진';
    holder.innerHTML = '' +
      '<div class="gm" role="region" aria-roledescription="carousel" aria-label="' + esc(label) + '">' +
        '<div class="gm-viewport"><ul class="gm-track"></ul></div>' +
        '<div class="gm-controls">' +
          '<button type="button" class="gm-ctrl" data-gm="prev" aria-label="이전 사진">' + ICON.prev + '</button>' +
          (reduceMotion ? '' : '<button type="button" class="gm-ctrl" data-gm="toggle" aria-label="자동 넘김 멈춤">' + ICON.pause + '</button>') +
          '<button type="button" class="gm-ctrl" data-gm="next" aria-label="다음 사진">' + ICON.next + '</button>' +
        '</div>' +
      '</div>';

    var root = holder.querySelector('.gm');
    var viewport = root.querySelector('.gm-viewport');
    var track = root.querySelector('.gm-track');
    var toggleBtn = root.querySelector('[data-gm="toggle"]');
    var n = list.length;

    var offset = 0, setW = 0, step = 0, copies = 0;
    var userPaused = reduceMotion, hoverPause = false, focusPause = false, lbPause = false, inView = true;
    var tween = null, drag = null, suppressClick = false, last = 0, raf = 0;

    function build() {
      var vw = viewport.clientWidth || window.innerWidth;
      // 한 세트 폭을 먼저 재고, 화면을 빈틈없이 채울 만큼 복제한다 (첫 세트만 실제 카드, 나머지는 장식용 복제)
      if (!copies) { track.innerHTML = list.map(function (it, i) { return cardHtml(it, i, false); }).join(''); }
      var cards = track.children;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      step = cards[0].getBoundingClientRect().width + gap;
      setW = step * n;
      var need = Math.max(2, Math.ceil(vw / setW) + 1);
      if (need !== copies) {
        var html = list.map(function (it, i) { return cardHtml(it, i, false); }).join('');
        for (var c = 1; c < need; c++) html += list.map(function (it, i) { return cardHtml(it, i, true); }).join('');
        track.innerHTML = html;
        copies = need;
      }
      offset = mod(offset, setW);
      apply();
    }
    function mod(a, b) { return b ? ((a % b) + b) % b : 0; }
    function apply() { track.style.transform = 'translate3d(' + (-offset).toFixed(2) + 'px,0,0)'; }
    function running() { return !userPaused && !hoverPause && !focusPause && !lbPause && inView && !document.hidden; }

    function frame(t) {
      var dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
      last = t;
      if (tween) {
        var p = Math.min((t - tween.t0) / TWEEN_MS, 1);
        var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        offset = tween.from + (tween.to - tween.from) * e;
        if (p >= 1) { offset = mod(tween.to, setW); tween = null; }
        apply();
      } else if (!drag && running()) {
        offset = mod(offset + SPEED * dt, setW);
        apply();
      }
      raf = requestAnimationFrame(frame);
    }

    function moveTo(target) {
      if (reduceMotion) { offset = mod(target, setW); tween = null; apply(); return; }
      tween = { from: offset, to: target, t0: performance.now() };
    }
    function go(dir) {
      var base = tween ? tween.to : offset;
      var target = dir > 0 ? (Math.floor(base / step + 0.001) + 1) * step : (Math.ceil(base / step - 0.001) - 1) * step;
      // 범위 밖으로 넘어가면 같은 위치의 다른 세트로 바꿔 끊김 없이 이어지게
      if (target < 0) { offset += setW; target += setW; }
      moveTo(target);
    }
    function revealCard(btn) {
      // 키보드로 포커스한 카드가 화면 밖이면 보이는 위치로 옮긴다
      var i = Number(btn.getAttribute('data-i'));
      var vw = viewport.clientWidth;
      var x = i * step - offset;
      if (x < 0 || x + step > vw) moveTo(i * step - Math.max(0, (vw - step) / 2));
    }

    // 컨트롤
    root.querySelector('[data-gm="prev"]').addEventListener('click', function () { go(-1); });
    root.querySelector('[data-gm="next"]').addEventListener('click', function () { go(1); });
    if (toggleBtn) toggleBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      toggleBtn.innerHTML = userPaused ? ICON.play : ICON.pause;
      toggleBtn.setAttribute('aria-label', userPaused ? '자동 넘김 시작' : '자동 넘김 멈춤');
    });

    // 마우스 올림 · 포커스 → 멈춤
    viewport.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hoverPause = true; });
    viewport.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hoverPause = false; });
    // Tab 으로 화면 밖 카드에 포커스가 가면 브라우저가 overflow:hidden 영역을 몰래 가로 스크롤한다.
    // 위치는 transform 으로만 관리하므로 그 스크롤은 항상 0으로 되돌린다.
    viewport.addEventListener('scroll', function () { if (viewport.scrollLeft) viewport.scrollLeft = 0; });
    root.addEventListener('focusin', function (e) {
      focusPause = true;
      viewport.scrollLeft = 0;
      if (e.target.classList.contains('gm-btn')) revealCard(e.target);
    });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) focusPause = false; });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // 스와이프 · 드래그
    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      tween = null;
      drag = { x: e.clientX, start: offset, moved: false, id: e.pointerId };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) { drag.moved = true; viewport.classList.add('is-dragging'); }
      if (drag.moved) { offset = mod(drag.start - dx, setW); apply(); }
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var moved = drag.moved;
      drag = null;
      viewport.classList.remove('is-dragging');
      if (moved) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        // 가장 가까운 카드 경계로 맞춘다
        moveTo(Math.round(offset / step) * step);
      }
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // 사진 클릭 → 라이트박스 (드래그 직후의 클릭은 무시)
    track.addEventListener('click', function (e) {
      var btn = e.target.closest('.gm-btn');
      if (!btn) return;
      if (suppressClick) { e.preventDefault(); return; }
      var real = track.querySelector('.gm-card:not([aria-hidden]) .gm-btn[data-i="' + btn.getAttribute('data-i') + '"]') || btn;
      lbPause = true;
      openLightbox(list, Number(btn.getAttribute('data-i')), real, function () { lbPause = false; });
    });

    // 화면 밖이거나 탭이 숨겨지면 멈춰서 자원을 아낀다
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; }).observe(viewport);
    }
    document.addEventListener('visibilitychange', function () { last = 0; });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { var ratio = setW ? offset / setW : 0; build(); offset = ratio * setW; apply(); }, 150);
    });

    build();
    raf = requestAnimationFrame(frame);
  }

  function render(holder, list) {
    var section = holder.closest('section') || document;
    var empty = section.querySelector('[data-gallery-empty]');
    if (!list.length) { renderEmpty(holder); return; }
    if (empty) empty.hidden = true;
    holder.hidden = false;
    if (list.length < 3) renderStatic(holder, list);
    else renderMarquee(holder, list);
  }

  holders.forEach(function (holder) {
    var page = holder.getAttribute('data-gallery');
    if (!WUO.supabase) { render(holder, []); return; }
    // 네트워크가 느리거나 끊기면 5초 뒤 '준비 중' 안내를 먼저 보여준다 (응답이 늦게 오면 사진으로 다시 그림)
    var timer = setTimeout(function () { renderEmpty(holder); }, 5000);
    WUO.supabase.from('gallery_items')
      .select('id, image_url, caption, alt, sort_order')
      .eq('page', page)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(function (res) {
        clearTimeout(timer);
        var list = (!res.error && res.data) ? res.data.filter(function (it) { return /^https:\/\//i.test(it.image_url || ''); }) : [];
        render(holder, list);
      }, function () { clearTimeout(timer); render(holder, []); });
  });

  // 검증·관리자 미리보기용: 데이터 없이 직접 그려볼 수 있게 노출
  WUO.renderGallery = render;
})();
