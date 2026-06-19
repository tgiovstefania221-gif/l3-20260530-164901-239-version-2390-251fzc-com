(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cut(value, length) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > length ? text.slice(0, length - 1) + "…" : text;
  }

  function setupMenu() {
    var toggle = select(".nav-toggle");
    var menu = select(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroSearch() {
    selectAll(".hero-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = select("#globalSearch");
        var targetSelector = form.getAttribute("data-scroll-target");
        var keywordInput = select("#searchKeyword");
        if (input && keywordInput) {
          keywordInput.value = input.value;
          keywordInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        var target = targetSelector ? select(targetSelector) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card-wrap">',
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '<div class="poster-box">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="card-chip">' + escapeHtml(cut(movie.genre, 12)) + '</span>',
      '<span class="rating-pill">★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(cut(movie.oneLine, 86)) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function setupSearch() {
    var library = window.MovieLibrary || [];
    var keyword = select("#searchKeyword");
    var region = select("#filterRegion");
    var type = select("#filterType");
    var year = select("#filterYear");
    var results = select("#searchResults");
    var more = select("#searchMore");
    if (!keyword || !region || !type || !year || !results) {
      return;
    }

    function fillSelect(element, values) {
      values.forEach(function (value) {
        if (!value) {
          return;
        }
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        element.appendChild(option);
      });
    }

    fillSelect(region, Array.from(new Set(library.map(function (m) { return m.region; }))).sort().slice(0, 80));
    fillSelect(type, Array.from(new Set(library.map(function (m) { return m.type; }))).sort().slice(0, 80));
    fillSelect(year, Array.from(new Set(library.map(function (m) { return m.year; }))).sort().reverse().slice(0, 80));

    var limit = 36;
    var current = [];

    function apply() {
      var q = keyword.value.trim().toLowerCase();
      var r = region.value;
      var t = type.value;
      var y = year.value;
      current = library.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ").toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!r || movie.region === r) && (!t || movie.type === t) && (!y || movie.year === y);
      });
      render();
    }

    function render() {
      results.innerHTML = current.slice(0, limit).map(movieCard).join("");
      if (more) {
        more.hidden = current.length <= limit;
      }
    }

    [keyword, region, type, year].forEach(function (element) {
      element.addEventListener("input", function () {
        limit = 36;
        apply();
      });
      element.addEventListener("change", function () {
        limit = 36;
        apply();
      });
    });

    if (more) {
      more.addEventListener("click", function () {
        limit += 36;
        render();
      });
    }

    current = library.slice(0, 36);
    render();
  }

  function setupCardFilter() {
    selectAll("[data-card-filter]").forEach(function (input) {
      var block = input.closest(".category-toolbar-block") || document;
      var cards = selectAll(".movie-card-wrap", block);
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.hidden = q && text.indexOf(q) === -1;
        });
      });
    });
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (wrapper) {
      var video = select("video", wrapper);
      var cover = select(".play-cover", wrapper);
      if (!video || !cover) {
        return;
      }
      function start() {
        var streamUrl = cover.getAttribute("data-stream");
        if (!streamUrl) {
          return;
        }
        if (video.getAttribute("data-ready") !== "1") {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            wrapper.hlsInstance = hls;
          } else {
            video.src = streamUrl;
          }
          video.setAttribute("data-ready", "1");
        }
        wrapper.classList.add("is-playing");
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {});
        }
      }
      cover.addEventListener("click", start);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeroSearch();
    setupSearch();
    setupCardFilter();
    setupPlayers();
  });
})();
