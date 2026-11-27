// 진행사례: 차종별로 사진 골라 보기
(function () {
  var buttons = document.querySelectorAll('.filters button');
  var items = document.querySelectorAll('.gallery li');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      items.forEach(function (li) {
        li.hidden = !(kind === 'all' || li.getAttribute('data-kind') === kind);
      });
    });
  });
})();
