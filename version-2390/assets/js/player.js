(function () {
  function initPlayer(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var hlsUrl = video ? video.getAttribute("data-hls") : "";
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || attached || !hlsUrl) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = hlsUrl;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      attachStream();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    player.addEventListener("click", function (event) {
      if (event.target.closest(".player-start") || event.target.classList.contains("player-overlay")) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        attached = false;
      });
    }
  }

  function boot() {
    document.querySelectorAll(".site-player").forEach(initPlayer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
