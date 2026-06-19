const Hls = window.Hls;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function openNav() {
  const toggle = qs('[data-nav-toggle]');
  const links = qs('[data-nav-links]');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('is-open');
  });
  qsa('.nav-links a').forEach((a) => {
    if (a.getAttribute('href') && location.pathname.endsWith(a.getAttribute('href').replace('./', ''))) {
      a.classList.add('active');
    }
  });
}

function initHeroRotator() {
  const hero = qs('[data-hero-rotator]');
  const featured = window.__FEATURED__ || [];
  if (!hero || !featured.length) return;

  const bg = qs('[data-hero-bg]', hero);
  const titles = qsa('[data-hero-title]', hero);
  const descs = qsa('[data-hero-desc]', hero);
  const metas = qsa('[data-hero-meta]', hero);
  const poster = qs('[data-hero-poster]', hero);
  const link = qs('[data-hero-link]', hero);
  const list = qs('[data-hero-list]', hero);
  const chips = qs('[data-hero-chips]', hero);

  let index = 0;
  let timer = null;

  function render(item) {
    if (bg) bg.style.backgroundImage = `url(${item.poster})`;
    titles.forEach((el) => (el.textContent = item.title));
    descs.forEach((el) => (el.textContent = item.one_line));
    metas.forEach((el) => (el.textContent = `${item.year} · ${item.region} · ${item.genre_raw}`));
    if (poster) {
      poster.src = item.poster;
      poster.alt = item.title;
    }
    if (link) link.href = item.detail_url;
    if (chips) {
      chips.innerHTML = '';
      const values = [item.year, item.region, item.type, item.category_name];
      values.forEach((v) => {
        const span = document.createElement('span');
        span.className = 'pill';
        span.textContent = v;
        chips.appendChild(span);
      });
    }
    if (list) {
      list.innerHTML = '';
      featured.slice(1, 6).forEach((movie) => {
        const a = document.createElement('a');
        a.className = 'mini-item';
        a.href = movie.detail_url;
        a.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}">
          <div>
            <strong>${movie.title}</strong>
            <span>${movie.year} · ${movie.region} · ${movie.genre_raw}</span>
          </div>
        `;
        list.appendChild(a);
      });
    }
  }

  function next() {
    index = (index + 1) % featured.length;
    render(featured[index]);
  }

  render(featured[index]);
  timer = window.setInterval(next, 4500);

  qsa('[data-hero-skip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      next();
      window.clearInterval(timer);
      timer = window.setInterval(next, 4500);
    });
  });
}

function filterCards(root) {
  const cards = qsa('[data-title]', root);
  const queryInput = qs('[data-filter-query]', root);
  const regionSelect = qs('[data-filter-region]', root);
  const typeSelect = qs('[data-filter-type]', root);
  const yearSelect = qs('[data-filter-year]', root);
  const count = qs('[data-filter-count]', root);

  function matches(card) {
    const q = (queryInput?.value || '').trim().toLowerCase();
    const region = regionSelect?.value || '';
    const type = typeSelect?.value || '';
    const year = yearSelect?.value || '';
    const text = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.type
    ].join(' ').toLowerCase();
    const okQuery = !q || text.includes(q);
    const okRegion = !region || card.dataset.region === region;
    const okType = !type || card.dataset.type === type;
    const okYear = !year || String(card.dataset.year) === year;
    return okQuery && okRegion && okType && okYear;
  }

  function apply() {
    let shown = 0;
    cards.forEach((card) => {
      const ok = matches(card);
      card.classList.toggle('hidden', !ok);
      if (ok) shown += 1;
    });
    if (count) count.textContent = `${shown} 条内容`;
  }

  [queryInput, regionSelect, typeSelect, yearSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  });

  apply();
}

function initSearchPage() {
  const mount = qs('[data-global-search]');
  if (!mount) return;

  const renderShell = (items, queryText) => {
    const html = items.map((item) => `
      <a class="search-card movie-card" href="${item.detail_url}" data-title="${item.title}" data-region="${item.region}" data-year="${item.year}" data-type="${item.type}" data-genre="${item.genre_raw}" data-tags="${item.tags.join(' ')}">
        <div class="poster">
          <img src="${item.poster}" alt="${item.title}">
          <div class="poster-overlay"></div>
          <div class="poster-badges">
            <span>${item.year}</span>
            <span>${item.region}</span>
          </div>
        </div>
        <div class="movie-body">
          <h3>${item.title}</h3>
          <p class="movie-meta">${item.genre_raw}</p>
          <p class="movie-desc">${item.one_line}</p>
        </div>
      </a>
    `).join('');
    mount.innerHTML = html || `<div class="intro-note">没有找到与 <strong>${queryText || '当前条件'}</strong> 匹配的影片。</div>`;
  };

  const init = () => {
    const movies = window.MOVIES || [];
    const form = qs('[data-search-form]');
    const qInput = qs('[data-search-query]');
    const region = qs('[data-search-region]');
    const type = qs('[data-search-type]');
    const year = qs('[data-search-year]');
    const count = qs('[data-search-results-count]');
    const params = new URLSearchParams(location.search);

    qInput.value = params.get('q') || '';
    if (region) region.value = params.get('region') || '';
    if (type) type.value = params.get('type') || '';
    if (year) year.value = params.get('year') || '';

    function filtered() {
      const q = qInput.value.trim().toLowerCase();
      const r = region?.value || '';
      const t = type?.value || '';
      const y = year?.value || '';
      return movies.filter((item) => {
        const text = `${item.title} ${item.region} ${item.type} ${item.year} ${item.genre_raw} ${item.tags.join(' ')} ${item.one_line}`.toLowerCase();
        return (!q || text.includes(q))
          && (!r || item.region === r)
          && (!t || item.type === t)
          && (!y || String(item.year) === y);
      });
    }

    function update() {
      const items = filtered();
      if (count) count.textContent = `${items.length} 条结果`;
      renderShell(items, qInput.value.trim());
    }

    form?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const url = new URL(location.href);
      url.searchParams.set('q', qInput.value.trim());
      if (region?.value) url.searchParams.set('region', region.value); else url.searchParams.delete('region');
      if (type?.value) url.searchParams.set('type', type.value); else url.searchParams.delete('type');
      if (year?.value) url.searchParams.set('year', year.value); else url.searchParams.delete('year');
      history.replaceState({}, '', url);
      update();
    });

    [qInput, region, type, year].forEach((el) => el && el.addEventListener('input', update));
    [region, type, year].forEach((el) => el && el.addEventListener('change', update));
    update();
  };

  try {
    init();
  } catch (err) {
    mount.innerHTML = `<div class="intro-note">搜索数据加载失败：${String(err.message || err)}</div>`;
  }
}

function initPlayer() {
  const video = qs('.js-player');
  if (!video) return;

  const src = video.dataset.src || '';
  const fallback = video.dataset.fallback || '';
  const poster = video.dataset.poster || '';

  if (poster && !video.getAttribute('poster')) {
    video.setAttribute('poster', poster);
  }

  const setFallback = () => {
    if (fallback && video.src !== fallback) {
      video.src = fallback;
      video.load();
    }
  };

  try {
    if (src.endsWith('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data?.fatal) {
            setFallback();
          }
        });
      } else {
        setFallback();
      }
    } else if (src) {
      video.src = src;
    } else {
      setFallback();
    }
  } catch (err) {
    setFallback();
  }

  video.addEventListener('error', setFallback);
  const playBtn = qs('[data-player-play]');
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      try {
        await video.play();
      } catch (err) {
        // ignore autoplay restrictions; user can click again
      }
    });
  }
}

function initSortHelpers() {
  qsa('[data-sort-list]').forEach((root) => {
    const select = qs('[data-sort-select]', root);
    const list = qs('[data-sort-target]', root);
    if (!select || !list) return;
    const cards = qsa('[data-sort-card]', list);
    const frag = document.createDocumentFragment();

    function compare(a, b, mode) {
      const aa = a.dataset;
      const bb = b.dataset;
      if (mode === 'year-desc') return Number(bb.year) - Number(aa.year);
      if (mode === 'year-asc') return Number(aa.year) - Number(bb.year);
      if (mode === 'title') return aa.title.localeCompare(bb.title, 'zh-Hans-CN');
      return Number(bb.score) - Number(aa.score);
    }

    function apply() {
      const mode = select.value;
      cards.sort((a, b) => compare(a, b, mode)).forEach((card) => frag.appendChild(card));
      list.appendChild(frag);
    }

    select.addEventListener('change', apply);
    apply();
  });
}

function initCollapsibles() {
  qsa('[data-collapsible-target]').forEach((panel) => {
    const trigger = qs('[data-collapsible]', panel);
    const content = qs('[data-collapsible-content]', panel);
    if (!trigger || !content) return;
    trigger.addEventListener('click', () => {
      content.classList.toggle('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  openNav();
  initHeroRotator();
  filterCards(document);
  initSearchPage();
  initPlayer();
  initSortHelpers();
  initCollapsibles();
});
