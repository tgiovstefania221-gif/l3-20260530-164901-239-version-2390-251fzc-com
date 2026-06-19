(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero-slider]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    function show(next) {
      index = next;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function initPlayers() {
    qsa('video[data-video-src]').forEach(function (video) {
      var src = video.getAttribute('data-video-src');
      if (!src) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            video.src = src;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    });
    qsa('[data-player-shell]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      if (!video || !button) {
        return;
      }
      function toggle() {
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }
      button.addEventListener('click', function (event) {
        event.preventDefault();
        toggle();
      });
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<div class="poster-frame">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</div>' +
      '<div class="movie-card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-tags">' + tagHtml + '</div>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function initSearch() {
    var form = qs('[data-search-form]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!form || !results || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var input = qs('[data-search-input]', form);
    var type = qs('[data-search-type]', form);
    var region = qs('[data-search-region]', form);
    var year = qs('[data-search-year]', form);
    var category = qs('[data-search-category]', form);
    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }
    function render() {
      var keyword = normalized(input.value);
      var selectedType = type.value;
      var selectedRegion = region.value;
      var selectedYear = year.value;
      var selectedCategory = category.value;
      var list = MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.category].concat(movie.tags || []).join(' ').toLowerCase();
        return (!keyword || text.indexOf(keyword) > -1) &&
          (!selectedType || movie.type === selectedType) &&
          (!selectedRegion || movie.region === selectedRegion) &&
          (!selectedYear || movie.year === selectedYear) &&
          (!selectedCategory || movie.category === selectedCategory);
      }).slice(0, 96);
      results.innerHTML = list.map(card).join('');
      status.textContent = list.length ? '已匹配到相关内容' : '没有找到匹配内容';
    }
    [input, type, region, year, category].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPlayers();
    initSearch();
  });
})();
