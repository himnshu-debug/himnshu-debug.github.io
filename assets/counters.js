// Animated counters for the About page.
// Numbers are read live from publications.html (counting list items), so adding a
// paper or patent there updates the counters automatically. If the page cannot be
// fetched (e.g. when opened as a local file), the data-target values are used.
(function () {
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.stat [data-key]'));
  if (!tiles.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el, target) {
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function run(counts) {
    tiles.forEach(function (el) {
      var k = el.getAttribute('data-key');
      var target = (counts && counts[k] != null) ? counts[k] : parseInt(el.getAttribute('data-target'), 10);
      el.setAttribute('data-target', target);
      var sub = el.parentNode.querySelector('[data-sub]');
      if (sub && counts && counts.granted != null && sub.getAttribute('data-sub') === 'granted') {
        sub.textContent = counts.granted + ' granted';
      }
      el.textContent = '0';
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { animate(el, target); io.disconnect(); }
          });
        }, { threshold: 0.4 });
        io.observe(el);
      } else {
        animate(el, target);
      }
    });
  }

  fetch('publications.html', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var n = function (sel) { return doc.querySelectorAll(sel).length; };
      var journals = n('ol.pubs.j > li'), confs = n('ol.pubs.c > li'), patents = n('ol.pubs.p > li');
      var granted = Array.prototype.filter.call(doc.querySelectorAll('ol.pubs.p > li .badge'),
        function (b) { return /granted/i.test(b.textContent); }).length;
      run({ total: journals + confs, journals: journals, conferences: confs, patents: patents, granted: granted });
    })
    .catch(function () { run(null); });
})();
