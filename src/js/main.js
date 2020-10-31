import * as animations from './modules/animations.js';
import {qs, qsa} from './modules/helpers.js';
import * as ripples from './modules/ripples.js';
import {loadCSSFile, loadJSFile} from './modules/loadFiles.js';
import {Toast} from './modules/toast.js';

var numPlayersOnline  = 0;
var playersOnline = [];
var loaded = false;

HTMLElement.prototype.onClick = function (cb) {
  this.addEventListener('click', cb, false);
};

function applyRipples() {
  return new Promise((resolve, reject) => {
    ripples.attachButtonRipple(qs('#fab'));
    qsa('.button').forEach(ripples.attachButtonRipple);
    qsa('.icon-button').forEach(ripples.attachRoundButtonRipple);
    qsa('.link').forEach(ripples.attachButtonRipple);
    ripples.attachButtonRipple(qs('#reset'));
    resolve();
  });
}

function loadRipples() {
  return new Promise((resolve, reject) => {
    loadCSSFile("../css/paper-ripple.min.css")
    .then(_ => loadJSFile('../js/paper-ripple.min.js'))
    .then(_ => applyRipples(_ => resolve())).catch(reject);
  });
}

function cascadeCards(container) {
  return new Promise(resolve => {
    const cards = qsa('.card', container);
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.display = 'block';
      animations.animateElement(cards[i], 'translateX(0)', 200, 1, i * 50);
    }
    const nocard = qs('.nocard')
    nocard.style.display = 'block';
    animations.animateElement(nocard, 'translateX(0)', 200, 1, i * 50);
  });
}

function createWrapper() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.alignItems = 'center';
  wrapper.style.overflow = 'none';
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
  const tooltip = document.createElement('div');
  wrapper.style.margin = '0 0.2em';
  wrapper.classList.add('tooltip');
  tooltip.classList.add('tooltiptext');
  tooltip.textContent = `${title}: ${count}`;
  wrapper.appendChild(tooltip);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('svg');
  svg.classList.add('eight-right');
  svg.setAttributeNS(null,"viewbox","0 0 24 24");
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("d",d);
  path.style.stroke = "#00000";
  svg.appendChild(path);
  wrapper.appendChild(svg);
  const text = document.createElement('div');
  text.style = "font-size: 12px;"
  text.textContent = count;
  wrapper.appendChild(text);
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
    case "headshots":
      return "D";
      break;
    case "physcannon":
      return ",";
      break;
  }
}

function displayWeaponData(wrappers, weapons, kills) {
  for (let i = 0; i < weapons.length; i++) {
    const weaponName = weapons[i][0];
    const count = weapons[i][1];
    let precent = Math.round((count / kills) * 100);
    if (precent === 0) {
      precent = '< 1';
    }
    const weapContainer = document.createElement('div');
    weapContainer.classList.add('tooltip');
    const icon = document.createElement('div');
    const text = document.createElement('div');
    const tooltip = document.createElement('div');
    if (weaponName === 'headshots') {
      icon.classList.add('CS');
    } else {
      icon.classList.add('HL2Weapons');
    }
    text.classList.add('weapon-count');
    icon.textContent = getWeaponIcon(weaponName);
    text.textContent = count;
    tooltip.classList.add('tooltiptext');
    tooltip.textContent = `${weaponName}: ${precent}% of all kills`;
    // weapContainer.title = `${weaponName}: ${precent}% of all kills`;
    weapContainer.appendChild(tooltip);
    weapContainer.appendChild(icon);
    weapContainer.appendChild(text);
    if (i < weapons.length / 2) {
      wrappers[0].appendChild(weapContainer);
    } else {
      wrappers[1].appendChild(weapContainer);
    }
  }
}

function showApp() {
  setTimeout(_ => {
    animations.animateElement(qs('#load'), 'translateY(-102%)', 350);
    if (!loaded) {
      displayPlayerOnline(numPlayersOnline);
    }
  }, 1200);
}

function displayPlayerOnline(playersOnline) {
  var loadtime = new Date();
  var lastDay = new Date(loadtime.getYear(), loadtime.getMonth() + 1, 0);
  var resetTime = new Date();
  resetTime.setHours(5);
  resetTime.setMinutes(0);
  resetTime.setSeconds(0);
  resetTime.setMonth(resetTime.getMonth() + 1, 1);
  if (loadtime.getDate() >= lastDay) {
    var doTime = _ => {
      var now = new Date().getTime();
      var distance = resetTime - now;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      qs('#soon-text').textContent = `in ${hours} hours ${minutes} minutes ${seconds} seconds`;
      if (distance < 0) {
        clearInterval(x);
      }
    };
    doTime();
    var x = setInterval(doTime, 1000);
    animations.animateElement(qs('#soon'), 'translateY(0)', 800, 1, 0);
  } else if (loadtime.getDate() >= lastDay - 3) {
    qs('#soon-text').textContent = `${new Date(resetTime).toDateString()} at ${resetTime.toLocaleTimeString()}`;
    animations.animateElement(qs('#soon'), 'translateY(0)', 800, 1, 0);
  } else if (loadTime.getTime() > resetTime && loadtime.getDate() <= 2) {
    animations.animateElement(qs('#reset'), 'translateY(0)', 800, 1, 0);
  }
  console.log(loadTime.getTime() > resetTime, loadTime.getTime(), resetTime)
  switch (playersOnline) {
    case 0:
    new Toast(`${playersOnline} players online.`, 2);
    break;
    case 1:
    new Toast(`${playersOnline} players online. He needs someone to kill`, 2);
    break;
    case 2:
    new Toast(`${playersOnline} players online. 1v1 in progress`, 2);
    break;
    case 3:
    new Toast(`${playersOnline} players online. Deathmatch had begun`, 2);
    break;
    case 4:
    new Toast(`${playersOnline} players online. Shits poppin off`, 2);
    break;
    case 5:
    new Toast(`${playersOnline} players online. Room for one more`, 2);
    break;
    case 6:
    new Toast(`${playersOnline} players online. Server full`, 2);
    break;
  }
  loaded = true;
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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
    name.style.height = '24px';
    const weaponWrapper1 = createWrapper();
    weaponWrapper1.style.marginTop = '24px'
    weaponWrapper1.style.display = 'none';
    weaponWrapper1.style.opacity = 0;
    const weaponWrapper2 = createWrapper();
    weaponWrapper2.style.marginTop = '24px'
    weaponWrapper2.style.display = 'none';
    weaponWrapper2.style.opacity = 0;
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
    const fav = HL2Weapons(player.weapons)
    const favWrapper = createWrapper();
    favWrapper.classList.add('tooltip');
    if (window.innerWidth <= 500) {
      favWrapper.style.display = 'none';
    }
    const tooltip = document.createElement('div');
    const icon = document.createElement('div');
    const text = document.createElement('div');
    tooltip.classList.add('tooltiptext');
    tooltip.textContent = `${fav[0]}: ${Math.round((fav[1] / player.kills) * 100)}% of all kills`;
    text.style.marginRight = '8px';
    icon.style.marginRight = '4px';
    icon.classList.add('HL2Weapons');
    icon.textContent = getWeaponIcon(fav[0]);
    text.textContent = fav[1];
    favWrapper.appendChild(tooltip);
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
      if (weaponWrapper1.style.display !== 'none') {
        name.style.color = '#333333';
        animations.fadeOut(weaponWrapper2, 50);
        animations.fadeOut(weaponWrapper1, 50).then(_ => {
          weaponWrapper1.style.display = 'none';
          weaponWrapper2.style.display = 'none';
          animations.fadeIn(favWrapper, 50);
          animations.animateHeight(card, '25px', 100);
        });
      } else {
        name.style.color = '#b94949';
        animations.fadeOut(favWrapper, 50);
        animations.animateHeight(card, '154px', 100).then(_ => {
          weaponWrapper1.style.display = 'flex';
          weaponWrapper2.style.display = 'flex';
          animations.fadeIn(weaponWrapper1, 50);
          animations.fadeIn(weaponWrapper2, 50);
        });
      }
    });
    displayWeaponData([
      weaponWrapper1,
      weaponWrapper2
    ], player.weapons, player.kills);
    card.appendChild(weaponWrapper1);
    card.appendChild(weaponWrapper2);
    qs('#cardsWrapper').appendChild(card);
    setTimeout(_ => {
      ripples.attachButtonRipple(card);
    }, 200);
  }
  const allWeaponsCard = createNoCard();
  const head = document.createElement('div');
  const wrapper1 = createWrapper();
  const wrapper2 = createWrapper();
  wrapper2.style.marginTop = '24px';
  var total = 0;
  for (var n = 0; n < top[1].length; n++)  {
    if (top[1][n][0] !== 'headshots') {
      total = total + top[1][n][1];
    }
  }
  displayWeaponData([
    wrapper1,
    wrapper2
  ], top[1], total);
  head.textContent = `Server Totals: ${formatNumber(total)} kills by ${formatNumber(top[2])} players`;
  head.classList.add('server-stats');
  allWeaponsCard.appendChild(head);
  allWeaponsCard.appendChild(wrapper1);
  allWeaponsCard.appendChild(wrapper2);
  qs('#cardsWrapper').appendChild(allWeaponsCard);
}

function parseServerStatus(status) {
  const pContainer = qs('#players');
  pContainer.innerHTML = '';
  if (status !== "offline") {
    document.title = status.name;
    qs('.hostname').textContent = status.name;
    qs('#numPlayers').textContent = status.maxplayers;
    qs('#map').textContent = status.map;
    numPlayersOnline = status.players.length;
    if (numPlayersOnline === 0) {
      const div = document.createElement('div');
      div.textContent = "No Players Online";
      pContainer.appendChild(div);
    } else {
      for (let i = 0; i < numPlayersOnline; i++) {
        var playerName = status.players[i].name;
        const wrapper = document.createElement('div');
        wrapper.classList.add('playeronline');
        const player = document.createElement('div');
        player.textContent = playerName;
        const score = document.createElement('div');
        score.textContent = status.players[i].score;
        wrapper.appendChild(player);
        wrapper.appendChild(score);
        pContainer.appendChild(wrapper);
        const spacer = document.createElement('div');
        spacer.classList.add('spacer');
        pContainer.appendChild(spacer);
        // for toasts
        if (playerName && !playersOnline.includes(playerName)) {
          playersOnline.push(playerName);
          if (loaded) {
            new Toast(`${playerName} has joined the game`, 2);
          }
        }
      }
    }
    // copy players online
    var notOnline = [...playersOnline];
    for (var ndx = 0; ndx < playersOnline.length; ndx++) {
      for (var ndx2 = 0; ndx2 < status.players.length; ndx2++) {
        if (notOnline[ndx] === status.players[ndx2].name) {
          // remove players of still online. notOnline should only contain player who are no longer online
          notOnline.splice(notOnline.indexOf(notOnline[ndx]), 1);
        }
      }
    }
    // remove player from online array and notify UI
    notOnline.forEach(player => {
      new Toast(`${player} has left the server`, 2);
      playersOnline.splice(playersOnline.indexOf(player), 1);
    });
  } else {
    const div = document.createElement('div');
    div.textContent = "Server offline";
    pContainer.appendChild(div);
  }
  showApp();
}

function isLocalIP(ip) {
  const rx = /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/;
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

function fetchServerStatus() {
  fetch('/api/status').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(parseServerStatus);
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

function HL2Weapons(weapons) {
  let highest = 0;
  let weapon = "";
  for (let i = 0; i < weapons.length; i++) {
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

function connectWSS() {
  const socket = new WebSocket('wss://hl2dm.dough10.me/api');
  socket.onopen = console.log(`${new Date()} WebSocket connected`);
  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    parseServerStatus(data);
  };
  socket.onclose = _ => {
    var seconds = 2;
    console.log(`${new Date()} - Socket close. Reconnecting in ${seconds} seconds.`);
    setTimeout(_ => {
      connectWSS();
    }, seconds * 1000);
  };
  socket.onerror = err => {
    console.error(`${new Date()} - Socket encountered error: ${err.message} closing socket`);
    socket.close();
  };
}

qs('.wrapper').onscroll = (e) => requestAnimationFrame(_ => {
  const infoHeight = qs('#info').offsetHeight
  const wrapper = qs('#cardsWrapper');
  const scrollTop = e.target.scrollTop;
  const fab = qs('#fab');
  const change = scrollTop / 6;
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
  animations.animateElement(qs('#load'), 'translateY(0%)', 350).then(_ => {
    window.location.href = 'https://hl2dm.dough10.me/api/demos';
  });
});

var alert = qs('#reset');
alert.onClick(_ => {
  animations.animateElement(alert, 'translateY(-120%)', 800, 0, 0);
});

var soon = qs('#soon');
soon.onClick(_ => {
  animations.animateElement(soon, 'translateY(-120%)', 800, 0, 0);
});

qs('#fab').onClick(animations.animateScroll);

window.onload = registerServiceWorker().then(reg => {
  // console.log(reg);
  fetchTop();
  if ("WebSocket" in window) {
    connectWSS();
  } else {
    fetchServerStatus();
    setTimeout(fetchServerStatus, 5000);
  }
}).then(loadRipples).then(_ => {
  console.log('?')
});
