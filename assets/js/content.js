/*
 * Supabase 클라이언트 + 관리자 편집 콘텐츠 반영
 *   - data-ck="page.key"   → site_content 값으로 텍스트 교체 (줄바꿈 \n → <br>)
 *     + data-ck-list="li 클래스" 가 붙은 목록(ul/ol) → 값의 한 줄이 <li> 하나
 *   - data-img="page.key"  → site_content 값(이미지 공개 URL)으로 src 교체,
 *                            대체 텍스트는 "page.key_alt" 키에서 읽음
 * anon 키는 공개용(읽기 전용) 키다. 쓰기 권한은 RLS 로 막혀 있고,
 * 모든 쓰기는 관리자 API(/api/*, 서버에서 비밀번호 검증) 를 통해서만 이뤄진다.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://ezysjfquitcjsrfvyrqo.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eXNqZnF1aXRjanNyZnZ5cnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTgwODMsImV4cCI6MjEwMTM5NDA4M30.FUbZhgkQTqbrH9dVV5AsGrkjXzxm9QtWOsGaGmwHNYo';

  var WUO = window.WUO = window.WUO || {};
  WUO.SUPABASE_URL = SUPABASE_URL;
  WUO.supabase = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
  WUO.content = {};

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAndBr(s) { return escapeHtml(s).replace(/\n/g, '<br>'); }
  WUO.escapeHtml = escapeHtml;
  WUO.escapeAndBr = escapeAndBr;

  function isSafeImageUrl(url) { return /^https:\/\//i.test(url) || /^\/[^/]/.test(url); }

  function applyContent(root) {
    root = root || document;
    var map = WUO.content;
    root.querySelectorAll('[data-ck]').forEach(function (el) {
      var key = el.getAttribute('data-ck');
      if (map[key] == null) return;
      // data-ck-list: 목록(ul/ol) — 값의 한 줄이 항목 하나 (관리자에서 줄을 추가하면 항목이 늘어남)
      if (el.hasAttribute('data-ck-list')) {
        var cls = el.getAttribute('data-ck-list') || '';
        el.innerHTML = String(map[key]).split('\n').map(function (l) { return l.trim(); }).filter(Boolean)
          .map(function (l) { return '<li' + (cls ? ' class="' + escapeHtml(cls) + '"' : '') + '>' + escapeHtml(l) + '</li>'; }).join('');
        return;
      }
      el.innerHTML = escapeAndBr(map[key]);
    });
    root.querySelectorAll('img[data-img]').forEach(function (img) {
      var key = img.getAttribute('data-img');
      var url = map[key];
      var slot = img.closest('[data-img-slot]');
      if (!url || !isSafeImageUrl(url)) return;
      img.onerror = function () { // 깨진 이미지면 기본 오브제로 되돌림
        img.hidden = true;
        if (slot) slot.classList.remove('has-image');
      };
      img.alt = map[key + '_alt'] || img.getAttribute('alt') || '';
      img.src = url;
      img.hidden = false;
      if (slot) slot.classList.add('has-image');
    });
  }
  WUO.applyContent = applyContent;

  WUO.contentReady = new Promise(function (resolve) {
    if (!WUO.supabase) { resolve(WUO.content); return; }
    WUO.supabase.from('site_content').select('key, value').then(function (result) {
      if (!result.error && result.data) {
        result.data.forEach(function (row) { WUO.content[row.key] = row.value; });
        applyContent(document);
      }
      resolve(WUO.content);
    }, function () { resolve(WUO.content); });
  });
})();
