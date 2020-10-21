import * as animations from './modules/animations.js';
import {qs, qsa} from './modules/helpers.js';
import * as ripples from './modules/ripples.js';
import {loadCSSFile, loadJSFile} from './modules/loadFiles.js';

HTMLElement.prototype.onClick = function (cb) {
  this.addEventListener('click', cb, false);
};

function applyRipples() {
  return new Promise(resolve => {
    ripples.attachButtonRipple(qs('#fab'));
    qsa('.button').forEach(ripples.attachButtonRipple);
    qsa('.icon-button').forEach(ripples.attachRoundButtonRipple);
    qsa('.link').forEach(ripples.attachButtonRipple);
    resolve();
  });
}

function loadRipples() {
  return new Promise((resolve, reject) => {
    loadCSSFile("../css/paper-ripple.min.css")
    .then(_ => loadJSFile('../js/paper-ripple.min.js')
    .then(_ => setTimeout(_ => applyRipples(resolve), 50)).catch(reject));
  });
}

function cascadeCards(container) {
  return new Promise(resolve => {
    const cards = qsa('.card', container);
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.display = 'block';
      animations.animateElement(cards[i], 'translateX(0)', 200, 1, i * 50);
    }
    var nocard = qs('.nocard')
    nocard.style.display = 'block';
    animations.animateElement(nocard, 'translateX(0)', 200, 1, i * 50);
  });
}

function createWrapper() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.alignItems = 'center';
  return wrapper;
}

function createCard() {
  const card = document.createElement('div');
  card.classList.add('card');
  card.style.transform = 'translateX(50%)';
  card.style.opacity = 0;
  card.style.display = 'none';
  return card;
}

function createNoCard() {
  const card = document.createElement('div');
  card.classList.add('nocard');
  card.style.transform = 'translateX(50%)';
  card.style.opacity = 0;
  card.style.display = 'none';
  return card;
}

function createSVG(d, count, title) {
  const wrapper = createWrapper();
  wrapper.style.margin = '0 0.2em';
  wrapper.title = `${title}: ${count}`;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '24px';
  svg.style.height = '24px';
  svg.style.marginRight = '8px';
  svg.setAttributeNS(null,"viewbox","0 0 24 24");
  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("d",d);
  path.style.stroke = "#00000";
  svg.appendChild(path);
  wrapper.appendChild(svg);
  const text = document.createElement('div');
  text.style = "font-size: 12px;"
  text.textContent = count;
  wrapper.appendChild(text);
  wrapper.classList.add('weapon');
  return wrapper;
}

function getWeaponIcon(weapon) {
  switch (weapon) {
    case "grenade_frag":
      return '4';
      break;
    case "357":
      return '.';
      break;
    case "shotgun":
      return '0';
      break;
    case "pistol":
      return '-';
      break;
    case "smg1":
      return '/';
      break;
    case "smg1_grenade":
      return '7';
      break;
    case "crowbar":
      return '6';
      break;
    case "crossbow_bolt":
      return '1';
      break;
    case "combine_ball":
      return '8';
      break;
    case "ar2":
      return '2';
      break;
    case "rpg_missile":
      return '3';
      break;
    case "physbox":
      return '9';
      break;
    case "stunstick":
      return '!';
      break;
    case "physics":
      return '9';
      break;
  }
}

function displayWeaponData(wrapper, weapons) {
  for (var i = 0; i < weapons.length; i++) {
    const weaponName = weapons[i][0];
    const count = weapons[i][1];
    var weapContainer = document.createElement('div');
    var icon = document.createElement('div');
    var text = document.createElement('div');
    weapContainer.classList.add('weapon');
    icon.classList.add('favWeapon');
    text.classList.add('weapon-count');
    icon.textContent = getWeaponIcon(weaponName);
    text.textContent = count;
    weapContainer.title = `${weaponName}: ${count}`;
    weapContainer.appendChild(icon);
    weapContainer.appendChild(text);
    wrapper.appendChild(weapContainer);
  }
}

function showApp() {
  setTimeout(_ => {
    animations.animateElement(qs('#load'), 'translateY(-102%)', 350);
  }, 1000);
}

function parseTopData(top) {
  const killsIcon = "M7,5H23V9H22V10H16A1,1 0 0,0 15,11V12A2,2 0 0,1 13,14H9.62C9.24,14 8.89,14.22 8.72,14.56L6.27,19.45C6.1,19.79 5.76,20 5.38,20H2C2,20 -1,20 3,14C3,14 6,10 2,10V5H3L3.5,4H6.5L7,5M14,12V11A1,1 0 0,0 13,10H12C12,10 11,11 12,12A2,2 0 0,1 10,10A1,1 0 0,0 9,11V12A1,1 0 0,0 10,13H13A1,1 0 0,0 14,12Z";
  const deathsIcon = "M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.82 7,18.47V22H9V19H11V22H13V19H15V22H17V18.46C19.47,16.81 21,14 21,11A9,9 0 0,0 12,2M8,11A2,2 0 0,1 10,13A2,2 0 0,1 8,15A2,2 0 0,1 6,13A2,2 0 0,1 8,11M16,11A2,2 0 0,1 18,13A2,2 0 0,1 16,15A2,2 0 0,1 14,13A2,2 0 0,1 16,11M12,14L13.5,17H10.5L12,14Z";
  const kdrIcon =   "M3 18.34C3 18.34 4 7.09 7 3L12 4L11 7.09H9V14.25H10C12 11.18 16.14 10.06 18.64 11.18C21.94 12.71 21.64 17.32 18.64 19.36C16.24 21 9 22.43 3 18.34Z";
  for (let i = 0; i < top[0].length; i++) {
    const player = top[0][i];
    const wrapper = createWrapper();
    const card = createCard();
    card.classList.add('stat');
    const name = document.createElement('div');
    name.textContent = player.name;
    name.title = player.name;
    name.style.transition = `color 200ms ease-in 0ms`;
    const weaponWrapper = createWrapper();
    weaponWrapper.style.marginTop = '24px'
    weaponWrapper.style.display = 'none';
    weaponWrapper.style.opacity = 0;
    ipLookup(player.ip).then(res => {
      name.textContent = name.textContent + ` (${res.country})`;
      name.title = name.title + ` (${res.country})`;
    });
    name.classList.add('player-name');
    const stats = document.createElement('div');
    stats.style.display = "inline-flex";
    const kills = createSVG(killsIcon, player.kills, "Kills");
    const deaths = createSVG(deathsIcon, player.deaths, "Deaths");
    const kdr = createSVG(kdrIcon, player.kdr, "KDR");
    wrapper.appendChild(name);
    const fav = favWeapon(player.weapons)
    const favWrapper = createWrapper();
    favWeapon.classList.add('weapon');
    favWrapper.title = `${fav[0]}: ${fav[1]}`;
    const icon = document.createElement('div');
    const text = document.createElement('div');
    text.style.marginRight = '8px';
    icon.style.marginRight = '4px';
    icon.classList.add('favWeapon');
    icon.textContent = getWeaponIcon(fav[0]);
    text.textContent = fav[1]
    favWrapper.appendChild(icon);
    favWrapper.appendChild(text);
    stats.appendChild(favWrapper);
    stats.appendChild(kills);
    stats.appendChild(deaths);
    stats.appendChild(kdr);
    wrapper.appendChild(stats);
    card.appendChild(wrapper);
    card.style.height = '25px';
    card.onClick(_ => {
      if (weaponWrapper.style.display !== 'none') {
        name.style.color = '#333333';
        animations.fadeOut(weaponWrapper, 75).then(_ => {
          weaponWrapper.style.display = 'none';
          animations.fadeIn(favWrapper, 75);
          animations.animateHeight(card, '25px', 100);
        });
      } else {
        name.style.color = '#b94949';
        animations.fadeOut(favWrapper, 75);
        animations.animateHeight(card, '89px', 100).then(_ => {
          weaponWrapper.style.opacity = 0;
          weaponWrapper.style.display = 'flex';
          animations.fadeIn(weaponWrapper, 75);
        });
      }
    });
    displayWeaponData(weaponWrapper, player.weapons);
    card.appendChild(weaponWrapper);
    qs('#cardsWrapper').appendChild(card);
    setTimeout(_ => {
      ripples.attachButtonRipple(card);
    }, 200);
  }
  const allWeaponsCard = createNoCard();
  const wrapper = createWrapper();
  displayWeaponData(wrapper, top[1]);
  allWeaponsCard.appendChild(wrapper);
  qs('#cardsWrapper').appendChild(allWeaponsCard);
}

function parseServerStatus(status) {
  showApp();
  if (status !== "offline") {
    document.title = status.name;
    qs('.hostname').textContent = status.name;
    qs('#numPlayers').textContent = status.maxplayers;
    qs('#map').textContent = status.map;
    // qs('#next_map').textContent = status.raw.rules.sm_nextmap;
    var pContainer = qs('#players');
    pContainer.innerHTML = '';
    if (status.players.length === 0) {
      var div = document.createElement('div');
      div.textContent = "No Players Online";
      pContainer.appendChild(div);
    } else {
      for (var i = 0; i < status.players.length; i++) {
        var wrapper = document.createElement('div');
        wrapper.classList.add('playeronline');
        var player = document.createElement('div');
        player.textContent = status.players[i].name;
        var score = document.createElement('div');
        score.textContent = status.players[i].score;
        wrapper.appendChild(player);
        wrapper.appendChild(score);
        pContainer.appendChild(wrapper);
        var spacer = document.createElement('div');
        spacer.classList.add('spacer');
        pContainer.appendChild(spacer);
      }
    }
  }
}

function fetchServerStatus() {
  fetch('/api/status').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(parseServerStatus);
  });
}

function isLocalIP(ip) {
  var rx = /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/;
  return rx.test(ip);
}

function ipLookup(ip) {
  return new Promise((resolve, reject) => {
    if (isLocalIP(ip)) {
      resolve({
        country: "US",
        country_3: "USA",
        ip: ip,
        name: "United States"
      });
      return;
    }
    fetch(`https://get.geojs.io/v1/ip/country/${ip}.json`).then(response => {
      if (response.status !== 200) {
        reject(response.status);
        return;
      }
      response.json().then(resolve);
    });
  });
}

function fetchTop() {
  fetch('/api/stats').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(parseTopData);
  });
}

function registerServiceWorker() {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register(`../sw.js`).then(resolve).catch(reject);
      return;
    }
    resolve();
  });
}

function favWeapon(weapons) {
  var highest = 0;
  var weapon = "";
  for (var i = 0; i < weapons.length; i++) {
    if (weapons[i][1] > highest) {
      highest = weapons[i][1];
      weapon = weapons[i][0];
    }
  }
  return [
    weapon,
    highest
  ];
}

qs('.wrapper').onscroll = (e) => requestAnimationFrame(_ => {
  const infoHeight = qs('#info').offsetHeight
  const wrapper = qs('#cardsWrapper');
  const scrollTop = e.target.scrollTop;
  const fab = qs('#fab');
  var change = scrollTop / 6;
  let top = 128 - change;
  if (top <= 65) {
    top = 65;
  }
  if (scrollTop > infoHeight) {
    cascadeCards(wrapper);
    animations.animateElement(fab, "translateY(0px)");
  } else {
    animations.animateElement(fab, "translateY(80px)");
  }
  let scale = 1 - (change / (200 - 65));
  if (scale <= 0.495) {
    scale = 0.495;
  }
  if (scale >= 1) {
    scale = 1;
  }
  qs('.avatar').style.transform = `scale(${scale})`;
  qs(':root').style.setProperty('--header-height', `${top}px`);
});

qs('#join').onClick(_ => {
  window.location.href = 'steam://connect/hl2dm.dough10.me:27015';
});

qs('#discord').onClick(_ => {
  window.location.href = 'https://discord.gg/ZBTqwvw';
});

qs('#github').onClick(_ => {
  window.location.href = 'https://github.com/dough10/hl2dm-stats';
});

qs('#paypal').onClick(_ => {
  window.location.href = 'https://www.paypal.me/jdough10';
});

qs('#demos').onClick(_ => {
  var load = qs('#load');
  animations.animateElement(load, 'translateY(0%)', 350).then(_ => {
    window.location.href = 'https://hl2dm.dough10.me/api/demos';
  });
});

qs('#fab').onClick(animations.animateScroll);

window.onload = registerServiceWorker().then(reg => {
  fetchServerStatus();
  setInterval(fetchServerStatus, 5000);
  fetchTop();
  console.log(reg);
  return;
}).then(loadRipples);
