(function () {
  const players = Array.from(document.querySelectorAll('[data-hls-player]'));

  if (!players.length) {
    return;
  }

  let hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function showNote(container, message) {
    const note = container.querySelector('[data-player-note]');
    if (note) {
      note.textContent = message;
      note.classList.add('is-visible');
    }
  }

  function playVideo(container) {
    const video = container.querySelector('video');
    const overlay = container.querySelector('[data-video-overlay]');
    const source = video ? video.dataset.hls : '';

    if (!video || !source) {
      showNote(container, '当前播放源暂不可用。');
      return;
    }

    if (overlay) {
      overlay.style.display = 'none';
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        showNote(container, '浏览器阻止了自动播放，请再次点击播放按钮。');
      });
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showNote(container, '播放已就绪，请点击播放器继续。');
          });
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showNote(container, '播放源连接失败，请稍后刷新页面重试。');
          }
        });
      } else {
        showNote(container, '当前浏览器暂不支持 HLS 播放。');
      }
    }).catch(function () {
      showNote(container, '播放器组件加载失败，请检查网络后重试。');
    });
  }

  players.forEach(function (container) {
    const button = container.querySelector('[data-play-button]');
    const video = container.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(container);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        const overlay = container.querySelector('[data-video-overlay]');
        if (overlay) {
          overlay.style.display = 'none';
        }
      });
    }
  });
})();
