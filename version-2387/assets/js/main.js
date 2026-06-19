(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dotsWrap = slider.querySelector('.slider-dots');
    var index = 0;
    var timer = null;

    if (!slides.length || !dotsWrap) {
      return;
    }

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      Array.prototype.slice.call(dotsWrap.querySelectorAll('button')).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    slides.forEach(function (_, slideIndex) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '切换焦点影片');
      dot.addEventListener('click', function () {
        activate(slideIndex);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    activate(0);
    restart();
  });

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.location.href = target;
    });
  }

  document.querySelectorAll('[data-catalog]').forEach(function (catalog) {
    var tools = document.querySelector('[data-catalog-tools]');
    if (!tools) {
      return;
    }

    var input = tools.querySelector('[data-filter-input]');
    var region = tools.querySelector('[data-filter-region]');
    var type = tools.querySelector('[data-filter-type]');
    var year = tools.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-summary'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' '));
        var matched = (!query || searchText.indexOf(query) !== -1) &&
          (!regionValue || card.getAttribute('data-region') === regionValue) &&
          (!typeValue || card.getAttribute('data-type') === typeValue) &&
          (!yearValue || card.getAttribute('data-year') === yearValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    apply();
  });

  document.querySelectorAll('.video-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.play-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    if (!video || !cover || !stream) {
      return;
    }

    function attach() {
      if (player.getAttribute('data-ready') === 'true') {
        return;
      }

      player.setAttribute('data-ready', 'true');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function start() {
      attach();
      cover.classList.add('is-hidden');
      player.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      cover.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
