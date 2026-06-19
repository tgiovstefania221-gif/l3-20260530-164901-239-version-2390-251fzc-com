(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('mainNav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const links = document.querySelectorAll('.main-nav a');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (link) {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(path)) {
      link.classList.add('active');
    }
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  if (slides.length) {
    showSlide(0);
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (slideTimer) {
          clearInterval(slideTimer);
        }
        slideTimer = setInterval(function () {
          showSlide(activeSlide + 1);
        }, 5200);
      });
    });
    slideTimer = setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const pageSearch = document.querySelector('[data-page-search]');
  const regionFilter = document.querySelector('[data-filter-region]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const clearButton = document.querySelector('[data-clear-filters]');
  const result = document.querySelector('[data-filter-result]');
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateFilters() {
    if (!cards.length) {
      return;
    }

    const q = normalize(pageSearch ? pageSearch.value : '');
    const region = normalize(regionFilter ? regionFilter.value : '');
    const year = normalize(yearFilter ? yearFilter.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(' ');
      const matchQuery = !q || normalize(haystack).includes(q);
      const matchRegion = !region || normalize(card.dataset.region) === region;
      const matchYear = !year || normalize(card.dataset.year) === year;
      const show = matchQuery && matchRegion && matchYear;

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (result) {
      result.textContent = '当前显示 ' + visible + ' 部内容。';
    }

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (cards.length) {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && pageSearch) {
      pageSearch.value = q;
    }

    [pageSearch, regionFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', updateFilters);
        element.addEventListener('change', updateFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (pageSearch) {
          pageSearch.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        updateFilters();
      });
    }

    updateFilters();
  }
})();
