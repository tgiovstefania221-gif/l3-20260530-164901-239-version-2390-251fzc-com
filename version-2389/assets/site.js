(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setActiveNav() {
    const path = window.location.pathname.replace(/\/+$/, "");
    const page = path.split("/").pop() || "index.html";
    $$('[data-nav]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const target = href.split('/').pop();
      if (target === page || (page === '' && target === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  function initMobileMenu() {
    const btn = $('[data-menu-btn]');
    const panel = $('[data-mobile-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  function initHeroCarousel() {
    const root = $('[data-hero-carousel]');
    if (!root) return;
    const slides = $$('.hero-slide', root);
    const dots = $$('[data-dot]', root);
    const prev = $('[data-prev-slide]', root);
    const next = $('[data-next-slide]', root);
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
    }

    function start() {
      stop();
      timer = setInterval(() => show(index + 1), 5500);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        show(idx);
        start();
      });
    });

    if (prev) prev.addEventListener('click', () => { show(index - 1); start(); });
    if (next) next.addEventListener('click', () => { show(index + 1); start(); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function initFilters() {
    const controls = $$('[data-filter-group]');
    if (!controls.length) return;
    const cards = $$('[data-filter-card]');
    if (!cards.length) return;

    const state = {
      genre: 'all',
      year: 'all',
      keyword: '',
    };

    function matches(card) {
      const genre = (card.getAttribute('data-genre') || '').toLowerCase();
      const year = card.getAttribute('data-year') || '';
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const key = state.keyword.trim().toLowerCase();
      const okGenre = state.genre === 'all' || genre.includes(state.genre.toLowerCase());
      const okYear = state.year === 'all' || year === state.year;
      const okKey = !key || title.includes(key) || tags.includes(key) || year.includes(key);
      return okGenre && okYear && okKey;
    }

    function render() {
      let visible = 0;
      cards.forEach((card) => {
        const show = matches(card);
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      const counter = $('[data-result-count]');
      if (counter) counter.textContent = String(visible);
      const empty = $('[data-empty-state]');
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    }

    controls.forEach((group) => {
      group.addEventListener('click', (event) => {
        const target = event.target.closest('[data-filter]');
        if (!target) return;
        const groupName = group.getAttribute('data-filter-group');
        const value = target.getAttribute('data-filter');
        if (groupName === 'genre') state.genre = value;
        if (groupName === 'year') state.year = value;
        group.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.remove('active'));
        target.classList.add('active');
        render();
      });
    });

    const input = $('[data-filter-input]');
    if (input) {
      input.addEventListener('input', () => {
        state.keyword = input.value || '';
        render();
      });
    }

    render();
  }

  function initPlayer() {
    const shell = $('[data-player]');
    if (!shell) return;
    const video = $('[data-video]', shell);
    const playBtn = $('[data-play-btn]', shell);
    const hint = $('[data-player-hint]', shell);
    if (!video || !playBtn) return;

    const src = video.getAttribute('data-src');
    let hls = null;
    let ready = false;

    function attachSource() {
      if (!src) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        ready = true;
      } else if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          if (hint) hint.textContent = '点按播放即可开始观看';
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hint) {
            hint.textContent = '播放暂时不可用，请稍后重试';
          }
        });
      } else {
        ready = true;
        video.src = src;
      }
    }

    function startPlay() {
      if (!ready && !video.src) attachSource();
      video.play().catch(() => {});
      playBtn.classList.add('hidden');
      if (hint) hint.textContent = '播放中';
    }

    playBtn.addEventListener('click', startPlay);
    video.addEventListener('click', () => {
      if (video.paused) startPlay();
    });
    video.addEventListener('play', () => {
      playBtn.classList.add('hidden');
      if (hint) hint.textContent = '播放中';
    });
    video.addEventListener('pause', () => {
      if (!video.ended) playBtn.classList.remove('hidden');
      if (hint) hint.textContent = '点击播放按钮继续观看';
    });
    video.addEventListener('ended', () => {
      playBtn.classList.remove('hidden');
      if (hint) hint.textContent = '本片已播放结束，可继续重播';
    });

    attachSource();
  }

  function posterMarkup(movie) {
    const style = `--c1:hsl(${(movie.index * 37) % 360} 82% 58%);--c2:hsl(${(movie.index * 37 + 32) % 360} 82% 44%);--c3:hsl(${(movie.index * 37 + 68) % 360} 82% 34%);`;
    const genres = (movie.genres || []).slice(0, 3).join(' / ');
    return `
      <div class="poster" style="${style}">
        <div class="poster-shine"></div>
        <div class="poster-top">
          <span class="badge badge-soft">${movie.year}</span>
          <span class="badge">#${movie.id}</span>
        </div>
        <div class="poster-title">${escapeHtml(movie.title)}</div>
        <div class="poster-meta">${escapeHtml(genres)}</div>
        <div class="poster-footer">
          <span>${escapeHtml(movie.region || '')}</span>
          <span>HD</span>
        </div>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function initSearchPage() {
    const root = $('[data-search-page]');
    if (!root) return;
    const input = $('[data-search-input]', root);
    const results = $('[data-search-results]', root);
    const count = $('[data-search-count]', root);
    const chips = $$('[data-search-chip]', root);
    const yearSelect = $('[data-search-year]', root);

    let movies = [];
    try {
      const response = await fetch('assets/movies.json', { cache: 'no-store' });
      movies = await response.json();
    } catch (error) {
      if (results) {
        results.innerHTML = '<div class="notice">搜索索引加载失败，请稍后刷新页面。</div>';
      }
      return;
    }

    let state = {
      keyword: '',
      genre: 'all',
      year: 'all',
    };

    function filtered() {
      const key = state.keyword.trim().toLowerCase();
      return movies.filter((movie) => {
        const title = (movie.title || '').toLowerCase();
        const tags = (movie.tags || []).join(' ').toLowerCase();
        const genres = (movie.genres || []).join(' ').toLowerCase();
        const region = (movie.region || '').toLowerCase();
        const okGenre = state.genre === 'all' || genres.includes(state.genre.toLowerCase());
        const okYear = state.year === 'all' || String(movie.year) === state.year;
        const okKey = !key || title.includes(key) || tags.includes(key) || genres.includes(key) || region.includes(key) || String(movie.year).includes(key);
        return okGenre && okYear && okKey;
      });
    }

    function render() {
      const list = filtered();
      if (count) count.textContent = String(list.length);
      if (results) {
        results.innerHTML = list.slice(0, 60).map((movie) => `
          <a class="movie-card" href="detail/${movie.id}.html">
            ${posterMarkup(movie)}
            <div class="movie-card-body">
              <h3>${escapeHtml(movie.title)}</h3>
              <p>${escapeHtml(movie.one_line)}</p>
              <div class="movie-card-meta">
                <span>${movie.year}</span>
                <span>${escapeHtml(movie.category || '')}</span>
              </div>
            </div>
          </a>
        `).join('') || '<div class="notice">没有找到匹配的影片，试试其他关键词。</div>';
      }
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.genre = chip.getAttribute('data-search-chip') || 'all';
        render();
      });
    });

    if (input) {
      input.addEventListener('input', () => {
        state.keyword = input.value || '';
        render();
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        state.year = yearSelect.value || 'all';
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
