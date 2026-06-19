(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-menu]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(target || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = qsa('[data-search-input]');

    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var scope = qs('[data-search-scope]', section.parentElement) || qs('[data-search-scope]') || document;
      var yearSelect = qs('[data-year-filter]', section);
      var items = qsa('.searchable', scope);
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有匹配的影片，请换个关键词试试。';

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var yearValue = yearSelect ? yearSelect.value : 'all';
        var visible = 0;

        items.forEach(function (item) {
          var text = (item.getAttribute('data-text') || item.textContent || '').toLowerCase();
          var year = parseInt(item.getAttribute('data-year') || '0', 10);
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var yearMatch = yearValue === 'all' || String(year) === yearValue || (yearValue === 'older' && year < 2022);
          var match = keywordMatch && yearMatch;

          item.hidden = !match;

          if (match) {
            visible += 1;
          }
        });

        if (visible === 0 && !empty.parentNode) {
          scope.appendChild(empty);
        }

        if (visible > 0 && empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      input.addEventListener('input', apply);

      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);

      if (!video || !button) {
        return;
      }

      function loadAndPlay() {
        var source = video.getAttribute('data-src');

        if (!source) {
          return;
        }

        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.__hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
        } else if (!video.src) {
          video.src = source;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', loadAndPlay);
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  function setupPlayerLinks() {
    qsa('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var shell = qs('[data-player]');
        var button = qs('[data-play-button]');

        if (shell) {
          event.preventDefault();
          shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (button) {
          window.setTimeout(function () {
            button.click();
          }, 360);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
    setupPlayerLinks();
  });
})();
