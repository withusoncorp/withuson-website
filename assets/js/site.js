/* 공통 인터랙션: 스크롤 reveal (prefers-reduced-motion 이면 즉시 표시) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.WUO = window.WUO || {};
  window.WUO.reducedMotion = reduce;

  var els = document.querySelectorAll('.reveal, .reveal-rise');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  els.forEach(function (el) { observer.observe(el); });
})();
