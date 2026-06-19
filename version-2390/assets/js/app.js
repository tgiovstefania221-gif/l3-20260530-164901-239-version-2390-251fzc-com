(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.hasAttribute("hidden");
        if (open) {
          panel.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
          toggle.textContent = "×";
        } else {
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
          toggle.textContent = "☰";
        }
      });
    }

    document.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[type="search"]');
        if (input && input.name === "q" && input.value.trim() === "") {
          event.preventDefault();
          input.focus();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === current);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var next = Number(thumb.getAttribute("data-slide-target"));
        showSlide(next);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll('[data-filterable="true"]').forEach(function (grid) {
      var section = grid.closest("section") || document;
      var keyword = section.querySelector(".filter-input");
      var year = section.querySelector(".filter-year");
      var type = section.querySelector(".filter-type");
      var region = section.querySelector(".filter-region");
      var empty = section.querySelector(".empty-state");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applyFilters() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value.trim() : "";
        var t = type ? type.value.trim() : "";
        var r = region ? region.value.trim().toLowerCase() : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year").indexOf(y) === -1) {
            ok = false;
          }
          if (t && card.getAttribute("data-type").indexOf(t) === -1) {
            ok = false;
          }
          if (r && card.getAttribute("data-region").toLowerCase().indexOf(r) === -1) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [keyword, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    });
  });
})();
