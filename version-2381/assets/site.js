(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var q = new URLSearchParams(window.location.search).get('q') || '';
  var localSearch = document.querySelector('[data-local-search]');

  if (localSearch && q) {
    localSearch.value = q;
  }

  var activeType = 'all';
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    var term = normalize(localSearch ? localSearch.value : q);
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var type = card.getAttribute('data-type') || '';
      var typeMatched = activeType === 'all' || type === activeType;
      var textMatched = !term || text.indexOf(term) !== -1;
      var matched = typeMatched && textMatched;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    var emptyState = document.querySelector('[data-empty-state]');
    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeType = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      runFilter();
    });
  });

  if (localSearch) {
    localSearch.addEventListener('input', runFilter);
    runFilter();
  } else if (q) {
    runFilter();
  }
})();

function setupPlayer(sourceUrl) {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-button]');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function beginPlayback() {
    button.classList.add('hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  function attachSource() {
    if (loaded) {
      beginPlayback();
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', beginPlayback, { once: true });
      video.load();
      beginPlayback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
      return;
    }

    video.src = sourceUrl;
    video.load();
    beginPlayback();
  }

  button.addEventListener('click', attachSource);
  video.addEventListener('click', function () {
    if (!loaded) {
      attachSource();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended && loaded) {
      button.classList.add('hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
