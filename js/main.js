// 맨 위 메뉴: 화면을 내리면 남색 바탕으로, 휴대폰에서는 메뉴 열고 닫기
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var alwaysSolid = header.hasAttribute('data-solid');
  function onScroll() {
    header.classList.toggle('is-solid', alwaysSolid || window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = header.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
})();

// 요금표·차종카드: 화면에 보일 때 줄이 하나씩 나타나기
(function () {
  var boxes = document.querySelectorAll('[data-reveal]');
  if (!boxes.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('reveal-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.2 });
  boxes.forEach(function (b) { io.observe(b); });
})();
