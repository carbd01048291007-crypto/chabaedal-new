// 교육 영상: 누를 때만 유튜브를 불러옵니다 (페이지가 무거워지지 않게)
(function () {
  document.querySelectorAll('.yt-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-yt');
      var end = btn.getAttribute('data-end');
      var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0&playsinline=1' + (end ? '&start=0&end=' + end : '');
      var f = document.createElement('iframe');
      f.src = src;
      f.title = btn.getAttribute('aria-label') || '교육 영상';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.className = 'yt-frame';
      btn.replaceWith(f);
      f.focus();
    });
  });
})();

// 섬네일을 못 불러오면 깨진 그림 표시 대신 남색 바탕만 보이게
document.querySelectorAll('.yt-play img, .yt-locked img').forEach(function (img) {
  img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  if (img.complete && img.naturalWidth === 0 && img.src) img.style.visibility = 'hidden';
});
