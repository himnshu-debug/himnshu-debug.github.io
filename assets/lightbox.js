// Minimal lightbox: click a photo to enlarge; arrows / swipe to move; Esc to close.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('a.ph'));
  if (!links.length) return;
  var box = document.createElement('div');
  box.className = 'lb';
  box.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button>' +
    '<button class="lb-p" aria-label="Previous">&#8249;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-n" aria-label="Next">&#8250;</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img'), cap = box.querySelector('figcaption'), i = 0;
  function show(k) {
    i = (k + links.length) % links.length;
    img.src = links[i].getAttribute('href');
    img.alt = cap.textContent = links[i].getAttribute('data-cap') || '';
    box.classList.add('open');
  }
  function close() { box.classList.remove('open'); img.src = ''; }
  links.forEach(function (a, k) { a.addEventListener('click', function (e) { e.preventDefault(); show(k); }); });
  box.querySelector('.lb-x').onclick = close;
  box.querySelector('.lb-p').onclick = function (e) { e.stopPropagation(); show(i - 1); };
  box.querySelector('.lb-n').onclick = function (e) { e.stopPropagation(); show(i + 1); };
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1); x0 = null;
  });
})();
