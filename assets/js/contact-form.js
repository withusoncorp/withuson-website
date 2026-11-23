/*
 * 회사 소개(index) 문의 폼
 *   - ?inquiry=education|performance|press … 로 문의 유형 미리 선택
 *   - 개인정보처리방침 동의(필수) + 전문 보기 모달(/privacy 본문을 불러옴)
 *   - 파일 첨부(선택): 드래그 앤 드롭 / 클릭 선택, 형식·용량·개수 검사
 *   - 저장 순서: 첨부 업로드(비공개 버킷) → consultations 저장 → 알림 메일
 *     첨부 일부가 실패해도 문의 본문은 저장하고, 실패한 파일만 안내한다.
 * 필요한 DB/Storage 설정: supabase/edit_v2_form.sql
 */
(function () {
  'use strict';

  /* ---------- 설정 (바꾸기 쉬운 상수) ---------- */
  var ATTACH_MAX_FILES = 3;
  var ATTACH_MAX_BYTES = 10 * 1024 * 1024; // 10MB
  var ATTACH_BUCKET = 'inquiry-attachments';
  var CONTACT_EMAIL = 'withusoncorp@withusoncorp.co.kr';
  // 확장자별: 업로드할 때 붙일 Content-Type, 브라우저가 알려주는 MIME 중 허용할 값
  // (hwp/hwpx 는 브라우저마다 MIME 이 달라 확장자만 본다)
  var FILE_TYPES = {
    hwp:  { type: 'application/x-hwp', mimes: null },
    hwpx: { type: 'application/hwp+zip', mimes: null },
    doc:  { type: 'application/msword', mimes: ['application/msword'] },
    docx: { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
    pdf:  { type: 'application/pdf', mimes: ['application/pdf'] },
    jpg:  { type: 'image/jpeg', mimes: ['image/jpeg', 'image/pjpeg'] },
    jpeg: { type: 'image/jpeg', mimes: ['image/jpeg', 'image/pjpeg'] },
    png:  { type: 'image/png', mimes: ['image/png'] },
    webp: { type: 'image/webp', mimes: ['image/webp'] }
  };

  var WUO = window.WUO || {};
  var supabaseClient = WUO.supabase;
  var siteContent = WUO.content || {};
  var escapeHtml = WUO.escapeHtml;
  var escapeAndBr = WUO.escapeAndBr;

  var form = document.getElementById('consultation-form');
  if (!form) return;
  var notice = document.getElementById('formNotice');
  var submitBtn = document.getElementById('submitBtn');
  var agree = document.getElementById('privacyAgree');
  var agreeError = document.getElementById('privacyError');
  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('attachInput');
  var fileList = document.getElementById('attachList');
  var fileError = document.getElementById('attachError');

  /* ---------- 문의 유형 미리 선택 ---------- */
  function presetInquiry() {
    var q = new URLSearchParams(location.search).get('inquiry');
    if (!q) return;
    var ok = Array.prototype.some.call(form.inquiryType.options, function (o) { return o.value && o.value === q; });
    if (ok) form.inquiryType.value = q;
  }
  presetInquiry();

  /* ---------- 파일 첨부 ---------- */
  var files = [];

  function extOf(name) {
    var m = /\.([A-Za-z0-9]+)$/.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }
  function formatSize(bytes) {
    return bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + 'MB' : Math.max(1, Math.round(bytes / 1024)) + 'KB';
  }
  function checkFile(file) {
    var spec = FILE_TYPES[extOf(file.name)];
    if (!spec) return '허용되지 않는 형식입니다 (한글·워드·PDF·이미지만 가능)';
    // MIME 이 비어 있으면(일부 브라우저) 확장자로 판단, 값이 있으면 확장자와 맞는지 확인
    if (spec.mimes && file.type && spec.mimes.indexOf(file.type) === -1) return '파일 형식이 확장자와 맞지 않습니다';
    if (file.size > ATTACH_MAX_BYTES) return '10MB를 넘습니다';
    if (file.size === 0) return '빈 파일입니다';
    return '';
  }
  function showFileError(msgs) {
    if (!msgs.length) { fileError.classList.add('hidden'); fileError.textContent = ''; return; }
    fileError.textContent = msgs.join(' / ');
    fileError.classList.remove('hidden');
  }
  function addFiles(list) {
    var errors = [];
    Array.prototype.forEach.call(list, function (file) {
      var dup = files.some(function (f) { return f.name === file.name && f.size === file.size; });
      if (dup) return;
      if (files.length >= ATTACH_MAX_FILES) { errors.push('파일은 최대 ' + ATTACH_MAX_FILES + '개까지 첨부할 수 있습니다'); return; }
      var why = checkFile(file);
      if (why) { errors.push(file.name + ': ' + why); return; }
      files.push(file);
    });
    // 같은 안내가 여러 번 나오지 않게
    showFileError(errors.filter(function (m, i) { return errors.indexOf(m) === i; }));
    renderFiles();
  }
  function renderFiles() {
    fileList.innerHTML = files.map(function (f, i) {
      return '<li class="flex items-center gap-3 rounded-xl bg-white/80 border border-brand-100 px-3.5 py-2.5">' +
        '<svg class="text-brand-dark flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>' +
        '<span class="flex-1 min-w-0 text-sm text-ink truncate">' + escapeHtml(f.name) + '</span>' +
        '<span class="text-xs text-inkfaint flex-shrink-0">' + formatSize(f.size) + '</span>' +
        '<button type="button" class="file-remove w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-inksoft flex-shrink-0" data-remove="' + i + '" aria-label="' + escapeHtml(f.name) + ' 삭제">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</li>';
    }).join('');
  }
  fileList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    files.splice(Number(btn.getAttribute('data-remove')), 1);
    showFileError([]);
    renderFiles();
    dropZone.focus();
  });
  dropZone.addEventListener('click', function () { fileInput.click(); });
  dropZone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (t) {
    dropZone.addEventListener(t, function (e) { e.preventDefault(); dropZone.classList.add('is-drag'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    dropZone.addEventListener(t, function (e) { e.preventDefault(); dropZone.classList.remove('is-drag'); });
  });
  dropZone.addEventListener('drop', function (e) { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  // Storage 경로에는 영문·숫자·._- 만 쓴다 (한글 원본 이름은 attachments.name 에 보관)
  function safeName(name) {
    var ext = extOf(name);
    var base = name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^[._-]+|[._-]+$/g, '').slice(0, 60);
    return (base || 'file') + '.' + ext;
  }
  function uploadOne(file) {
    var now = new Date();
    var month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var path = 'inquiries/' + month + '/' + uuid() + '_' + safeName(file.name);
    var type = FILE_TYPES[extOf(file.name)].type;
    // supabase-js 는 File 을 넘기면 파일 자체의 type 을 쓴다(hwp 는 보통 빈 값 → octet-stream 으로 거부됨)
    // → 확장자 기준 Content-Type 을 가진 Blob 으로 다시 감싸서 올린다
    var body = new Blob([file], { type: type });
    return supabaseClient.storage.from(ATTACH_BUCKET)
      .upload(path, body, { contentType: type, upsert: false })
      .then(function (r) {
        if (r.error) throw r.error;
        return { path: path, name: file.name, size: file.size, type: type };
      });
  }
  function uploadAll(list) {
    var ok = [], failed = [];
    return Promise.all(list.map(function (f) {
      return uploadOne(f).then(function (a) { ok.push(a); }, function (err) {
        console.warn('첨부 업로드 실패:', f.name, err);
        failed.push(f.name);
      });
    })).then(function () { return { ok: ok, failed: failed }; });
  }

  /* ---------- 개인정보처리방침 동의 ---------- */
  function showAgreeError(show) {
    agreeError.classList.toggle('hidden', !show);
    agree.setAttribute('aria-invalid', show ? 'true' : 'false');
  }
  agree.addEventListener('change', function () { if (agree.checked) showAgreeError(false); });

  /* ---------- 개인정보처리방침 모달 ---------- */
  var modal = document.getElementById('privacyModal');
  var modalBody = document.getElementById('privacyModalBody');
  var opener = document.getElementById('privacyOpen');
  var lastFocus = null;
  var loaded = false;

  function loadPolicy() {
    if (loaded) return Promise.resolve(true);
    return fetch('/privacy', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var article = doc.getElementById('privacy-article');
        if (!article) throw new Error('no article');
        // 같은 사이트의 정적 문서지만, 스크립트·이벤트 속성은 들여오지 않는다
        article.querySelectorAll('script').forEach(function (s) { s.remove(); });
        modalBody.innerHTML = '';
        Array.prototype.forEach.call(article.children, function (el) { modalBody.appendChild(document.importNode(el, true)); });
        modalBody.querySelectorAll('h2').forEach(function (h) { h.removeAttribute('id'); });
        modalBody.querySelectorAll('[aria-labelledby]').forEach(function (s) { s.removeAttribute('aria-labelledby'); });
        loaded = true;
        return true;
      });
  }
  function focusables() {
    return Array.prototype.filter.call(
      modal.querySelectorAll('button, a[href], [tabindex="0"]'),
      function (el) { return el.offsetParent !== null; }
    );
  }
  function openModal() {
    lastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : opener;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalBody.scrollTop = 0;
    setTimeout(function () { modal.querySelector('.pv-close').focus(); }, 30);
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  opener.addEventListener('click', function (e) {
    // Ctrl/⌘ 클릭 등은 브라우저 기본 동작(새 탭)을 그대로 둔다
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    loadPolicy().then(openModal, function () { window.open('/privacy', '_blank', 'noopener'); });
  });
  modal.querySelectorAll('[data-pv-close]').forEach(function (el) { el.addEventListener('click', closeModal); });
  document.getElementById('privacyAgreeBtn').addEventListener('click', function () {
    agree.checked = true;
    showAgreeError(false);
    lastFocus = agree;
    closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- 제출 ---------- */
  function setNotice(html, isError) {
    notice.innerHTML = html;
    notice.classList.toggle('text-red-600', !!isError);
    notice.classList.toggle('text-brand-darker', !isError);
    notice.classList.remove('hidden');
  }
  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = siteContent['contact.form_submit'] || '문의 보내기';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!agree.checked) { showAgreeError(true); agree.focus(); return; }
    if (!supabaseClient) { setNotice('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', true); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = files.length ? '파일 올리는 중...' : '전송 중...';
    notice.classList.add('hidden');

    var payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      inquiryType: form.inquiryType.value,
      message: form.message.value.trim()
    };

    uploadAll(files.slice()).then(function (up) {
      submitBtn.textContent = '전송 중...';
      return supabaseClient.from('consultations').insert([{
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        inquiry_type: payload.inquiryType,
        message: payload.message,
        privacy_agreed: true,          // 동의 시각(privacy_agreed_at)은 DB 가 저장 시각으로 기록
        attachments: up.ok
      }]).then(function (result) { return { result: result, up: up }; });
    }).then(function (r) {
      resetButton();
      if (r.result.error) {
        console.warn('문의 저장 실패:', r.result.error);
        setNotice('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', true);
        return;
      }
      var msg = escapeAndBr(siteContent['contact.form_success'] || '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
      if (r.up.failed.length) {
        msg += '<br><span class="text-red-600">다만 첨부 파일 ' + r.up.failed.length + '개(' + escapeHtml(r.up.failed.join(', ')) +
          ')를 올리지 못했습니다. ' + CONTACT_EMAIL + ' 로 보내주세요.</span>';
      }
      setNotice(msg, false);
      form.reset();
      files = [];
      renderFiles();
      showFileError([]);

      // 관리자 알림 메일 (실패해도 접수 화면은 그대로). 첨부는 파일명만 보낸다.
      payload.attachmentNames = r.up.ok.map(function (a) { return a.name; });
      fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function (err) { console.warn('알림 이메일 발송 실패:', err); });
    }).catch(function (err) {
      console.warn('문의 접수 실패:', err);
      resetButton();
      setNotice('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', true);
    });
  });
})();
