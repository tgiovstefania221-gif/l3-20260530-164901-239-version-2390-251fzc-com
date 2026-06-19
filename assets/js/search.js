(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card">',
      '<a href="movie/' + movie.file + '" class="poster-wrap" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-float" aria-hidden="true">▶</span>',
      '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="movie/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function render() {
    var input = document.getElementById("search-page-input");
    var target = document.getElementById("search-results");
    var text = document.getElementById("search-result-text");
    var q = getQuery();

    if (input) {
      input.value = q;
    }
    if (!target || !window.MOVIE_INDEX) {
      return;
    }
    if (!q) {
      if (text) {
        text.textContent = "输入关键词后显示匹配内容";
      }
      return;
    }

    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.MOVIE_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (text) {
      text.textContent = results.length ? "找到相关影片" : "没有匹配的影片";
    }
    target.innerHTML = results.length ? results.map(card).join("") : '<p class="empty-state wide">没有匹配的影片</p>';
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
