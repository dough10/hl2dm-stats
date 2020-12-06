HTMLElement.prototype.onClick = function(cb) {
  this.addEventListener('click', cb, false);
};

function qs(selector, scope) {
  return (scope || document).querySelector(selector)
}

function qsa(selector, scope) {
  return (scope || document).querySelectorAll(selector)
}

function attachButtonRipple(button) {
  button.PaperRipple = new PaperRipple();
  button.appendChild(button.PaperRipple.$);
  button.addEventListener('mousedown', ev => button.PaperRipple.downAction(ev));
  button.addEventListener('mouseup', e => button.PaperRipple.upAction());
}

function attachRoundButtonRipple(button) {
  button.PaperRipple = new PaperRipple();
  button.appendChild(button.PaperRipple.$);
  button.PaperRipple.$.classList.add('paper-ripple--round');
  button.PaperRipple.recenters = true;
  button.PaperRipple.center = true;
  button.addEventListener('mousedown', ev => button.PaperRipple.downAction(ev));
  button.addEventListener('mouseup', ev => button.PaperRipple.upAction());
}

/**
 * push csS file to DOM
 * @param {String} src - url
 */
function loadCSSFile(src) {
  return new Promise((resolve, reject) => {
    const css = document.createElement( "link" );
    css.href = src;
    css.type = "text/css";
    css.rel = "stylesheet";
    css.onload = resolve;
    css.onerror = reject;
    qs('head').appendChild(css);
  });
}

/**
 * push JS file to DOM
 * @param {String} src - url
 */
function loadJSFile(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = src;
    script.onload = setTimeout(resolve, 50);
    script.onerror = reject;
    qs('body').appendChild(script);
  });
}

/**
 * loads paper ripples effect to DOM
 */
function loadRipples() {
  return new Promise((resolve, reject) => {
    loadCSSFile("../css/paper-ripple.min.css").then(_ => {
      loadJSFile('../js/paper-ripple.min.js').then(resolve).catch(reject);
    }).catch(reject);
  });
}

/**
 * display statistics about a player
 *
 * @param {Object} player - player object from GameDig node js module
 */
function displayPlayer(player) {
  var playerName = player.name;
  const wrapper = document.createElement('div');
  wrapper.classList.add('playeronline');
  const playerDiv = document.createElement('div');
  playerDiv.textContent = playerName;
  const score = document.createElement('div');
  score.textContent = player.score;
  wrapper.appendChild(playerDiv);
  wrapper.appendChild(score);
  return wrapper;
}

/**
 * returns a element with "server offline" text
 */
function offlineServer() {
  const div = document.createElement('div');
  div.textContent = "Server offline";
  return div;
}

/**
 * returns a element with "no players online" text
 */
function emptyServer() {
  const div = document.createElement('div');
  div.style.padding = '16px';
  div.textContent = "No Players Online";
  return div;
}

/**
 * lparse and display server statistics
 *
 * @param {Object} status - status object from GameDig node js module
 */
function parseServerStatus(status) {
  const pContainer = qs('#players');
  pContainer.innerHTML = '';
  pContainer.appendChild(displayPlayer({
    name: "Player Name",
    score: "Score"
  }));
  if (status !== "offline") {
    var numPlayersOnline = status.players.length;
    if (numPlayersOnline === 0) {
      pContainer.appendChild(emptyServer());
    } else {
      for (let i = 0; i < numPlayersOnline; i++) {
        var wrapper = displayPlayer(status.players[i])
        wrapper.onClick(_ => {
          fetch(`https://hl2dm.dough10.me/director/view/${status.players[i].name}`);
        });
        attachButtonRipple(wrapper);
        wrapper.style.cursor = 'pointer';
        pContainer.appendChild(wrapper);
      }
    }
  } else {
    pContainer.appendChild(offlineServer());
  }
}

function getPlayers() {
  fetch('https://hl2dm.dough10.me/api/status').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(data => {
      parseServerStatus(data);
    });
  });
}

function init() {
  loadRipples().then(_ => {
    getPlayers();
    setInterval(_ => {
      getPlayers();
    }, 10000);
    qsa('.rb').forEach(attachRoundButtonRipple);
    if(Hls.isSupported()) {
      var video = qs('video');
      var hls = new Hls();
      hls.loadSource('https://hl2dm.dough10.me/hls/hl2mp.m3u8');
      hls.attachMedia(video);
      // hls.on(Hls.Events.MANIFEST_PARSED, video.play);
      hls.on(Hls.Events.ERROR, _ => {
        video.poster = 'images/offline.webp';
        qsa('.rb').forEach(el => {
          el.setAttribute('disabled', true);
        });
      });
      qs('#play').onClick(_ => {
        if (video.paused) {
          qs('#playIcon').setAttribute('d', `M14,19H18V5H14M6,19H10V5H6V19Z`);
          return video.play();
        }
        qs('#playIcon').setAttribute('d', `M8,5.14V19.14L19,12.14L8,5.14Z`);
        video.pause();
      });
      qs('#mute').onClick(_ => {
        if (!video.muted) {
          qs('#muteIcon').setAttribute('d', 'M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z');
          video.muted = true;
          return;
        }
        qs('#muteIcon').setAttribute('d', 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z');
        video.muted = false;
      });
      qs('#fullscreen').onClick(_ => {
        video.requestFullscreen();
      });
      qs('#pip').onClick(_ => {
        video.requestPictureInPicture();
      });
    }
  });
}

window.onload = init();