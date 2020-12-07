import * as animations from './modules/animations.js';
import {qs, qsa} from './modules/helpers.js';
import * as ripples from './modules/ripples.js';
import {loadCSSFile, loadJSFile} from './modules/loadFiles.js';
import {Toast} from './modules/toast.js';
import {Timer} from './modules/Timer.js';


var numPlayersOnline = 0;
var playersOnline = [];
var loaded = false;

HTMLElement.prototype.onClick = function(cb) {
  this.addEventListener('click', cb, false);
};


/**
 * apply paper-ripples effect to UI elements
 */
function applyRipples() {
  return new Promise(resolve => {
    ripples.attachButtonRipple(qs('#fab'));
    qsa('.button').forEach(ripples.attachButtonRipple);
    qsa('.icon-button').forEach(ripples.attachRoundButtonRipple);
    qsa('.link').forEach(ripples.attachButtonRipple);
    ripples.attachButtonRipple(qs('#reset'));
    resolve()
  });
}

/**
 * loads paper ripples effect to DOM
 */
function loadRipples() {
  return new Promise((resolve, reject) => {
    loadCSSFile("../css/paper-ripple.min.css").then(_ => {
      loadJSFile('../js/paper-ripple.min.js').then(applyRipples).then(resolve).catch(reject);
    }).catch(reject);
  });
}

/**
 * animate cards in from right side of screen
 *
 * @param {Element} container - element cards are in side of
 */
function cascadeCards(container) {
  return new Promise(resolve => {
    const cards = qsa('.card', container);
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.display = 'block';
      animations.animateElement(cards[i], 'translateX(0)', 200, 1, i * 50);
    }
    const nocard = qs('.nocard', container);
    if (!nocard) return;
    nocard.style.display = 'block';
    animations.animateElement(nocard, 'translateX(0)', 200, 1, i * 50);
    resolve();
  });
}

/**
 * returns flex container element
 */
function createWrapper() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.alignItems = 'center';
  wrapper.style.overflow = 'none';
  return wrapper;
}

/**
 * returns styled card element
 */
function createCard() {
  const card = document.createElement('div');
  card.classList.add('card');
  card.style.transform = 'translateX(50%)';
  card.style.opacity = 0;
  card.style.display = 'none';
  return card;
}

/**
 * returns non styled card element
 */
function createNoCard() {
  const card = document.createElement('div');
  card.classList.add('nocard');
  card.style.transform = 'translateX(50%)';
  card.style.opacity = 0;
  card.style.display = 'none';
  return card;
}

/**
 * returns svg element
 *
 * @param {String} d - svg string value
 * @param {Number} count - number of kills or deaths
 * @param {String} title - thing needing icon
 */
function createSVG(d, count, title, suicides) {
  const wrapper = createWrapper();
  const tooltip = document.createElement('div');
  wrapper.style.margin = '0 0.2em';
  wrapper.classList.add('tooltip');
  tooltip.classList.add('tooltiptext');
  tooltip.style.transformOrigin = 'center';
  var con = document.createElement('div');
  con.classList.add('tt-container');
  var div = document.createElement('div');
  var titleEl = document.createElement('span');
  titleEl.style.color = 'yellow';
  titleEl.textContent = `${title}: `;
  var countEl = document.createElement('span');
  countEl.textContent = `  ${count}`;
  div.appendChild(titleEl);
  div.appendChild(countEl);
  con.appendChild(div);
  if (suicides) {
    var suic = document.createElement('div');
    suic.style.color = 'yellow';
    suic.textContent = 'Deaths by suicide';
    con.appendChild(suic);
    for (var stat in suicides) {
      var statContainer = document.createElement('div');
      var statTitleDiv = document.createElement('span');
      statTitleDiv.style.color = 'yellow';
      var statDiv = document.createElement('span');
      if (stat !== 'count') {
        statTitleDiv.textContent = `${stat}: `;
        statDiv.textContent = `  ${suicides[stat]}`;
      }
      statContainer.appendChild(statTitleDiv);
      statContainer.appendChild(statDiv);
      con.appendChild(statContainer);
    }
  }
  tooltip.appendChild(con);
  wrapper.appendChild(tooltip);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('svg');
  svg.classList.add('eight-right');
  svg.setAttributeNS(null, "viewbox", "0 0 24 24");
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("d", d);
  path.style.stroke = "#00000";
  svg.appendChild(path);
  wrapper.appendChild(svg);
  const text = document.createElement('div');
  text.style = "font-size: 12px;"
  text.textContent = count;
  wrapper.appendChild(text);
  return wrapper;
}

/**
 * returns a element with "server offline" text
 */
function offlineServer() {
  const div = document.createElement('div');
  div.classList.add('playeronline');
  div.style.justifyContent = 'center';
  div.textContent = "Server offline";
  return div;
}

/**
 * returns a element with "no players online" text
 */
function emptyServer() {
  const div = document.createElement('div');
  div.classList.add('playeronline');
  div.style.justifyContent = 'center';
  div.textContent = "No Players Online";
  return div;
}

/**
 * returns month name in string form
 *
 * @param {Number} month - month number 0 - 11
 */
function monthName(month) {
  if (typeof month !== 'number') {
    month = Number(month)
  }
  switch (month) {
    case 0:
      return 'January';
      break;
    case 1:
      return 'Febuary';
      break;
    case 2:
      return 'March';
      break;
    case 3:
      return 'April';
      break;
    case 4:
      return 'May';
      break;
    case 5:
      return 'June';
      break;
    case 6:
      return 'July';
      break;
    case 7:
      return 'August';
      break;
    case 8:
      return 'September';
      break;
    case 9:
      return 'October';
      break;
    case 10:
      return 'November';
      break;
    case 11:
      return 'December';
      break;

  }
}

/**
 * returns the text value to represent the weapon used 
 * also the name of the class to display the correct font
 *
 * @param {String} weapon - weapon needing icon
 */
function getWeaponIcon(weapon) {
  switch (weapon) {
    case "grenade_frag":
      return ['4', 'HL2Weapons'];
      break;
    case "357":
      return ['.', 'HL2Weapons'];
      break;
    case "shotgun":
      return ['0', 'HL2Weapons'];
      break;
    case "pistol":
      return ['-', 'HL2Weapons'];
      break;
    case "smg1":
      return ['/', 'HL2Weapons'];
      break;
    case "smg1_grenade":
      return ['7', 'HL2Weapons'];
      break;
    case "crowbar":
      return ['6', 'HL2Weapons'];
      break;
    case "crossbow_bolt":
      return ['1', 'HL2Weapons'];
      break;
    case "combine_ball":
      return ['8', 'HL2Weapons'];
      break;
    case "ar2":
      return ['2', 'HL2Weapons'];
      break;
    case "rpg_missile":
      return ['3', 'HL2Weapons'];
      break;
    case "physbox":
      return ['9', 'HL2Weapons'];
      break;
    case "stunstick":
      return ['!', 'HL2Weapons'];
      break;
    case "physics":
      return ['9', 'HL2Weapons'];
      break;
    case "headshots":
      return ['D', 'CS'];
      break;
    case "physcannon":
      return [',', 'HL2Weapons'];
      break;
  }
}

/**
 * convers 0's to < 1
 *
 * @param {Number} p - %
 */
function isLessThenOne(p) {
  if (p === 0) {
    return '< 1';
  }
  return p;
}

/**
 * creates a element and add text content
 *
 * @param {String} text - the string of text to display in the element
 * @param {String} color - color to display the text
 */
function textDiv(text, color) {
  var div = document.createElement('div');
  if (color) {
    div.style.color = color;
  }
  div.textContent = text;
  return div;
}

/**
 * seperate a number with commas
 *
 * @param {Number} x - number to be seperated
 */
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * creates HTML for weapon info tooltips
 *
 * @param {String} weaponName - name of the weapon
 * @param {Number} precent - precentage of kills withs the weapon
 * @param {Number} shots - Number of shots fired
 * @param {Number} hitPrecent - precentage of shots fired that hit the target
 * @param {Number} hsPrecent - precentage of shots fired that hit in the head
 */
function tooltipHTML(weaponName, count, precent, shots, hitPrecent, hsPrecent, shotsToKill, damage, adpk, adph, hss, lss) {
  var container = document.createElement('div');
  container.classList.add('tt-container');
  var weaponIcon = document.createElement('div');
  weaponIcon.style.color = '#ff0';
  var icon = getWeaponIcon(weaponName);
  weaponIcon.classList.add(icon[1]);
  weaponIcon.textContent = icon[0];
  container.appendChild(weaponIcon);
  var header = document.createElement('div');
  header.classList.add('tt-header');
  header.textContent = weaponName;
  container.appendChild(header);
  container.appendChild(textDiv(`${numberWithCommas(count)} kills`));
  container.appendChild(textDiv(`${precent}% of total kills`));
  if (damage) {
    container.appendChild(textDiv(`${numberWithCommas(damage)} damage`));
  }
  // if (adpk) {
  //   container.appendChild(textDiv(`${numberWithCommas(adpk)} avg dam per kill`));
  // }
  if (shots && hitPrecent && hsPrecent) {
    container.appendChild(textDiv(`${numberWithCommas(shots)} fired shots`));
    container.appendChild(textDiv(`${hitPrecent}% of shots hit`));
    container.appendChild(textDiv(`${hsPrecent}% headshots`));
    if (shotsToKill) {
      container.appendChild(textDiv(`${numberWithCommas(shotsToKill)} avg shots pre kill`));
    }
    if (adph) {
      container.appendChild(textDiv(`Damage per hit`, 'yellow'));
      container.appendChild(textDiv(`${numberWithCommas(adph)} average`));
    }
    if (hss) {
      container.appendChild(textDiv(`${numberWithCommas(hss)} highest`));
    }
    if (lss && lss !== 9999) {
      container.appendChild(textDiv(`${numberWithCommas(lss)} lowest`));
    }
  }
  return container;
}

/**
 * displays weapon stats
 *
 * @param {Array} wrappers - pair of elements to send output to limit 2
 * @param {Array} weapons - list of weapons
 * @param {Number} kills - total number of kills
 */
function displayWeaponData(wrappers, weapons, kills) {
  if (wrappers.length > 2) {
    throw Error('List or wrappers for weapons must not excede length of 2');
  }
  for (let i = 0; i < weapons.length; i++) {
    const weaponName = weapons[i][0];
    var count = weapons[i][1];
    var shots;
    var hitPrecent;
    var hsPrecent;
    var shotsToKill;
    var damage;
    var adpk;
    var adph;
    var hss;
    var lss;
    if (weapons[i][2]) {
      shots = weapons[i][2][0];
      hitPrecent = isLessThenOne(weapons[i][2][1]);
      hsPrecent = isLessThenOne(weapons[i][2][2]);
      shotsToKill = weapons[i][2][3];
      damage = weapons[i][2][4];
      adpk = weapons[i][2][5];
      adph = weapons[i][2][6];
      hss = weapons[i][2][7];
      lss = weapons[i][2][8];
    }
    let precent = isLessThenOne(Math.round((count / kills) * 100));
    const weapContainer = document.createElement('div');
    weapContainer.classList.add('tooltip');
    const weaponIcon = document.createElement('div');
    const text = document.createElement('div');
    const tooltip = document.createElement('div');
    text.classList.add('weapon-count');
    var icon = getWeaponIcon(weaponName);
    weaponIcon.classList.add(icon[1]);
    weaponIcon.textContent = icon[0];
    text.textContent = count;
    tooltip.classList.add('tooltiptext');
    tooltip.appendChild(tooltipHTML(
      weaponName,
      count,
      precent,
      shots,
      hitPrecent,
      hsPrecent,
      shotsToKill,
      damage,
      adpk,
      adph,
      hss,
      lss
    ));
    weapContainer.appendChild(tooltip);
    weapContainer.appendChild(weaponIcon);
    weapContainer.appendChild(text);
    if (i < weapons.length / 2) {
      wrappers[0].appendChild(weapContainer);
    } else {
      wrappers[1].appendChild(weapContainer);
    }
  }
}

/**
 * removes loading screen overlay to show the main app body
 */
function showApp() {
  animations.fadeIn(qs('#stuff-below'));
  setTimeout(_ => {
    animations.animateElement(qs('#load'), 'translateY(-102%)', 350);
    if (!loaded) {
      displayPlayerOnline(numPlayersOnline);
    }
  }, 800);
}

/**
 * displays data about who is connected to the game server
 *
 * @param {Number} playersOnline - Number of players connected to the server
 */
function displayPlayerOnline(playersOnline) {
  var el = qs('#reset');
  var loadtime = new Date();
  // lastDay = last day of the month
  var lastDay = new Date(loadtime.getFullYear(), loadtime.getMonth() + 1, 0);
  // set resetTime  to 5am on 1st of the month
  var resetTime = new Date();
  resetTime.setHours(5);
  resetTime.setMinutes(0);
  resetTime.setSeconds(0);
  resetTime.setMonth(resetTime.getMonth() + 1, 1);
  console.log('resetday', loadtime.getDate() === lastDay.getDate(), 'before', loadtime.getDate() > lastDay.getDate() - 3, 'after', loadtime.getDate() <= 2)
  if (loadtime.getDate() === lastDay.getDate()) {
    var doTime = _ => {
      var now = new Date().getTime();
      var distance = resetTime.getTime() - now;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      qs('#reset-text').textContent = `Stats will reset in ${hours} hours ${minutes} minutes ${seconds} seconds`;
      if (distance < 0) {
        clearInterval(x);
      }
    };
    doTime();
    var x = setInterval(doTime, 1000);
    animations.animateElement(el, 'translateY(0)', 800, 1, 0);
  } else if (loadtime.getDate() > lastDay.getDate() - 3) {
    qs('#reset-text').textContent = `Stats will reset ${resetTime.toDateString()} at ${resetTime.toLocaleTimeString()}`;
    animations.animateElement(el, 'translateY(0)', 800, 1, 0);
  } else if (loadtime.getDate() <= 2) {
    var lastReset = new Date(loadtime.getFullYear(), loadtime.getMonth(), 1);
    lastReset.setHours(5);
    lastReset.setMinutes(0);
    lastReset.setSeconds(0);
    qs('#reset-text').textContent = `Stats were reset ${lastReset.toDateString()} at ${lastReset.toLocaleTimeString()}`;
    animations.animateElement(el, 'translateY(0)', 800, 1, 0);
  }
  var say = '';
  switch (playersOnline) {
    case 0:
      say = `${playersOnline} players online.`;
      break;
    case 1:
      say = `${playersOnline} players online. He needs someone to kill`;
      break;
    case 2:
      say = `${playersOnline} players online. 1v1 in progress`;
      break;
    case 3:
      say = `${playersOnline} players online. 3's company too`;
      break;
    case 4:
      say = `${playersOnline} players online. Deathmatch has begun`;
      break;
    case 5:
      say = `${playersOnline} players online. Shits poppin off`;
      break;
    case 6:
      say = `${playersOnline} players online. Server getting crowded`;
      break;
    case 7:
      say = `${playersOnline} players online. It's a mad house`;
      break;
    case 8:
      say = `${playersOnline} players online. Full... And it hurts.`;
      break;
  }
  new Toast(say, 3, 'steam://connect/hl2dm.dough10.me:27015', 'Join');
  loaded = true;
}

/**
 * converts a number to a more readable form
 *
 * @param {Number} num - numberr to be made readable
 */
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

/**
 * displays top player list in UI
 *
 * @param {Array} top - list containing all the player and server stats from API
 * @param {String} page - name of the element the output will be pushed to
 * @param {Function} cb - ip address of the client connected to the server
 */
function parseTopData(top, page, cb) {
  const killsIcon = "M7,5H23V9H22V10H16A1,1 0 0,0 15,11V12A2,2 0 0,1 13,14H9.62C9.24,14 8.89,14.22 8.72,14.56L6.27,19.45C6.1,19.79 5.76,20 5.38,20H2C2,20 -1,20 3,14C3,14 6,10 2,10V5H3L3.5,4H6.5L7,5M14,12V11A1,1 0 0,0 13,10H12C12,10 11,11 12,12A2,2 0 0,1 10,10A1,1 0 0,0 9,11V12A1,1 0 0,0 10,13H13A1,1 0 0,0 14,12Z";
  const deathsIcon = "M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.82 7,18.47V22H9V19H11V22H13V19H15V22H17V18.46C19.47,16.81 21,14 21,11A9,9 0 0,0 12,2M8,11A2,2 0 0,1 10,13A2,2 0 0,1 8,15A2,2 0 0,1 6,13A2,2 0 0,1 8,11M16,11A2,2 0 0,1 18,13A2,2 0 0,1 16,15A2,2 0 0,1 14,13A2,2 0 0,1 16,11M12,14L13.5,17H10.5L12,14Z";
  const kdrIcon = "M3 18.34C3 18.34 4 7.09 7 3L12 4L11 7.09H9V14.25H10C12 11.18 16.14 10.06 18.64 11.18C21.94 12.71 21.64 17.32 18.64 19.36C16.24 21 9 22.43 3 18.34Z";
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
    ipLookup(player.ip, player.id).then(res => {
      name.textContent = name.textContent + ` (${res.country})`;
      name.title = name.title + ` (${res.country})`;
    });
    name.classList.add('player-name');
    const stats = document.createElement('div');
    stats.style.display = "inline-flex";
    const kills = createSVG(killsIcon, player.kills, "Kills");
    const deaths = createSVG(deathsIcon, player.deaths, "Deaths", player.suicide);
    const kdr = createSVG(kdrIcon, player.kdr, "KDR");
    wrapper.appendChild(name);
    const fav = favWeapon(player.weapons)
    const favWrapper = createWrapper();
    favWrapper.classList.add('tooltip');
    if (window.innerWidth <= 500) {
      favWrapper.style.display = 'none';
    }
    const tooltip = document.createElement('div');
    const icon = document.createElement('div');
    const text = document.createElement('div');
    tooltip.classList.add('tooltiptext');
    tooltip.style.transformOrigin = 'center';
    var shots;
    var hits;
    var hs;
    var stk;
    var dam;
    var adpk;
    var adph;
    var hss;
    var lss;
    if (fav[2] && fav[2][0] && fav[2][1] && fav[2][2]) {
      shots = fav[2][0];
      hits = fav[2][1];
      hs = fav[2][2];
      stk = fav[2][3];
      dam = fav[2][4];
      adpk = fav[2][5];
      adph = fav[2][6];
      hss = fav[2][7];
      lss = fav[2][8];
    }
    tooltip.appendChild(tooltipHTML(
      fav[0],
      fav[1],
      Math.round((fav[1] / player.kills) * 100),
      shots,
      hits,
      hs,
      stk,
      dam,
      adpk,
      adph,
      hss,
      lss
    ));
    text.style.marginRight = '8px';
    icon.style.marginRight = '4px';
    var wIcon = getWeaponIcon(fav[0])
    icon.classList.add(wIcon[1]);
    icon.textContent = wIcon[0];
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
    qs(page).appendChild(card);
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
  for (var n = 0; n < top[1].length; n++) {
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
  var lud = document.createElement('div');
  lud.classList.add('server-stats');
  lud.style.marginTop = '16px';
  lud.textContent = ` Last updated: ${new Date(top[4]).toLocaleString()}`;
  allWeaponsCard.appendChild(lud);
  qs(page).appendChild(allWeaponsCard);
  if (cb) cb();
  showApp();
}

/**
 * displays the list of demos from server api
 *
 * @param {Array} demos - list of demos from this month
 */
function parseDemos(demos) {
  var timer = new Timer()
  demos.forEach((demo, idx, array) => {
    const a = document.createElement('a');
    a.href = `https://hl2dm.dough10.me/api/download/${demo[0]}`;
    a.download = true;
    a.classList.add('link');
    const card = createCard();
    const wrapper = createWrapper();
    const name = document.createElement('div');
    name.textContent = demo[0];
    const size = document.createElement('div');
    size.textContent = demo[1];
    const time = document.createElement('div');
    var demoTime = new Date(demo[2]);
    time.textContent = `${demoTime.toDateString()} at ${demoTime.toLocaleTimeString()}`;
    wrapper.appendChild(name);
    wrapper.appendChild(size);
    wrapper.appendChild(time);
    card.appendChild(wrapper);
    card.classList.add('stat')
    a.appendChild(card);
    qs('#page3').appendChild(a);
    ripples.attachButtonRipple(card);
    if (idx === array.length - 1) {
      console.log(`time to process demos ${timer.endString()}`);
    }
  });
  showApp();
}

/**
 * display statistics about a player
 *
 * @param {Object} player - player object from GameDig node js module
 */
function displayPlayer(player) {
  const wrapper = document.createElement('div');
  var playerName = player.name;
  if (!playerName) {
    return wrapper;
  }
  wrapper.classList.add('playeronline');
  const playerDiv = document.createElement('div');
  playerDiv.textContent = playerName;
  const score = document.createElement('div');
  score.textContent = player.score;
  wrapper.appendChild(playerDiv);
  wrapper.appendChild(score);
  // for toasts
  if (playerName && !playersOnline.includes(playerName)) {
    playersOnline.push(playerName);
    if (loaded) {
      new Toast(`${playerName} has joined the game`, 3, 'steam://connect/hl2dm.dough10.me:27015', 'Join');
    }
  }
  return wrapper;
}

/**
 * handles notifications for players leaving the server
 */
function removeOfflinePlayers(players) {
  // copy players online
  var notOnline = [...playersOnline];
  for (var ndx = 0; ndx < playersOnline.length; ndx++) {
    for (var ndx2 = 0; ndx2 < players.length; ndx2++) {
      if (notOnline[ndx] === players[ndx2].name) {
        // remove players if still online. notOnline should only contain player who are no longer online
        notOnline.splice(notOnline.indexOf(notOnline[ndx]), 1);
      }
    }
  }
  // remove player from online array and notify UI
  notOnline.forEach(player => {
    new Toast(`${player} has left the server`, 3);
    playersOnline.splice(playersOnline.indexOf(player), 1);
  });
}

/**
 * lparse and display server statistics
 *
 * @param {Object} status - status object from GameDig node js module
 */
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
      pContainer.appendChild(emptyServer());
    } else {
      for (let i = 0; i < numPlayersOnline; i++) {
        pContainer.appendChild(displayPlayer(status.players[i]));
      }
    }
    removeOfflinePlayers(status.players);
  } else {
    pContainer.appendChild(offlineServer());
  }
}

/**
 * check if ip  address is valid
 *
 * @param {String} ip - ip address
 */
function validIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

/**
 * check if ip is LAN address
 *
 * @param {String} ip - ip address of the client connected to the server
 */
function isLocalIP(ip) {
  return /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(ip);
}

/**
 * lookup and caches ip address to get the origin country
 *
 * @param {String} ip - ip address of the client connected to the server
 */
function ipLookup(ip, id) {
  return new Promise((resolve, reject) => {
    if ('localStorage' in window && localStorage[id]) {
      var savedData = JSON.parse(localStorage[id])
      if (ip !== savedData.ip) {
        if (!validIPaddress(ip)) {
          console.error(`error updating IP. IP address invalid ${ip}`);
          return;
        }
        savedData.ip = ip;
      }
      resolve(savedData);
      return;
    }
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
      response.json().then(json => {
        if ('localStorage' in window) {
          localStorage[id] = JSON.stringify(json);
        }
        resolve(json);
      });
    });
  });
}

/**
 * grabs list of demos from server
 */
function fetchDemos() {
  qs('#page3').innerHTML = '';
  fetch('/api/demos').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(parseDemos);
  });
}

/**
 * create a option element and append to the parent element
 *
 * @param {String} option - name the client will see in UI
 * @param {Number} value - the decimal identifier for the keystroke
 * @param {Element} parent - the element to append the finished option element
 */
function makeOption(option, value, parent) {
  var el = document.createElement('option');
  el.textContent = option;
  el.value = value;
  parent.appendChild(el);
}

/**
 * get list of months from server and creates a option element
 *
 * @param {Number} month - # month
 * @param {Function} cb - callback function
 */
function fetchOldMonths(month, cb) {
  if (!month) {
    qs('#months').innerHTML = '';
    fetch('/api/old-months').then(response => {
      if (response.status !== 200) {
        console.error(response.status);
        return;
      }
      response.json().then(months => {
        for (var i = 0; i < months.length; i++) {
          months[i] = Number(months[i].replace('.json', ''));
          var now = new Date(months[i]);
          makeOption(`${monthName(now.getMonth())} ${now.getFullYear()}`, months[i], qs('#months'));
        }
        var m = new Date(Number(months[months.length - 1])).getMonth();
        fetchOldMonths(m);
        qs('#months').selectedIndex = months.length - 1;
      });
    });
    return;
  }
  qs('#oldData').innerHTML = '';
  fetch(`/api/old-stats/${month}`).then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(logs => {
      parseTopData(logs, '#oldData', cb);
    });
  });
}

/**
 * grabs server stats from the server and send it to parse t he response
 */
function fetchServerStatus() {
  fetch('/api/status').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(parseServerStatus);
  });
}

/**
 * grabs the player stats from the server
 */
function fetchTop() {
  qs('#page1').innerHTML = '';
  fetch('/api/stats').then(response => {
    if (response.status !== 200) {
      console.error(response.status);
      return;
    }
    response.json().then(top => {
      parseTopData(top, '#page1');
    });
  });
}

/**
 * registers the service worker
 */
function registerServiceWorker() {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register(`../sw.js`).then(resolve).catch(reject);
      return;
    }
    resolve();
  });
}

/**
 * greturns the stats of the weapon the player has the most kills
 *
 * @param {Array} weapons - array of weapons player has kills with
 */
function favWeapon(weapons) {
  let highest = 0;
  let weapon = "";
  let stats;
  for (let i = 0; i < weapons.length; i++) {
    if (weapons[i][1] > highest) {
      highest = weapons[i][1];
      weapon = weapons[i][0];
      stats = weapons[i][2];
    }
  }
  return [
    weapon,
    highest,
    stats
  ];
}

/**
 * connecs to the api backend over WebSocket
 */
function connectWSS() {
  const socket = new WebSocket('wss://hl2dm.dough10.me/api');
  socket.onopen = console.log(`${new Date().toLocaleString()} - WebSocket connected`);
  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    parseServerStatus(data);
  };
  socket.onclose = _ => {
    var seconds = 2;
    console.log(`${new Date().toLocaleString()} - Socket close. Reconnecting in ${seconds} seconds.`);
    setTimeout(_ => {
      connectWSS();
    }, seconds * 1000);
  };
  socket.onerror = err => {
    console.error(`${new Date().toLocaleString()} - Socket encountered error: ${err.message} closing socket`);
    socket.close();
  };
}

/**
 * homepage or current stats view mode
 */
function homePage() {
  fetchTop();
  window.history.pushState({}, null, '/');

  var home = qs('#home');
  home.style.display = 'none';

  var demos = qs('#demos');
  demos.style.display = 'inline-flex';

  var stats = qs('#oldStats');
  stats.style.display = 'inline-flex';

  var page1 = qs('#page1');
  var page2 = qs('#page2');
  var page3 = qs('#page3');

  if (page2.style.display !== 'none') {
    animations.fadeOut(page2).then(_ => {
      page2.style.display = 'none';
      page1.style.display = 'block';
      animations.fadeIn(page1);
    });
  }
  if (page3.style.display !== 'none') {
    animations.fadeOut(page3).then(_ => {
      page3.style.display = 'none';
      page1.style.display = 'block';
      animations.fadeIn(page1);
    });
  }
}

/**
 * game demos view mode
 */
function demosPage() {
  fetchDemos();
  window.history.pushState({}, null, '/demos');

  var home = qs('#home');
  home.style.display = 'inline-flex';

  var demos = qs('#demos');
  demos.style.display = 'none';

  var stats = qs('#oldStats');
  stats.style.display = 'inline-flex';

  var page1 = qs('#page1');
  var page2 = qs('#page2');
  var page3 = qs('#page3');

  if (page1.style.display !== 'none') {
    animations.fadeOut(page1).then(_ => {
      page1.style.display = 'none';
      page3.style.display = 'block';
      animations.fadeIn(page3);
    });
  }
  if (page2.style.display !== 'none') {
    animations.fadeOut(page2).then(_ => {
      page2.style.display = 'none';
      page3.style.display = 'block';
      animations.fadeIn(page3);
    });
  }
}

/**
 * prevoius months stats view mode
 */
function oldStatsPage() {
  fetchOldMonths();
  window.history.pushState({}, null, '/old-stats');

  var home = qs('#home');
  home.style.display = 'inline-flex';

  var demos = qs('#demos');
  demos.style.display = 'inline-flex';

  var stats = qs('#oldStats');
  stats.style.display = 'none';

  var page1 = qs('#page1');
  var page2 = qs('#page2');
  var page3 = qs('#page3');

  qs('#dl-buttons').style.opacity = 0;
  if (page1.style.display !== 'none') {
    animations.fadeOut(page1).then(_ => {
      page1.style.display = 'none';
      page2.style.display = 'block';
      animations.fadeIn(page2);
    });
  }
  if (page3.style.display !== 'none') {
    animations.fadeOut(page3).then(_ => {
      page3.style.display = 'none';
      page2.style.display = 'block';
      animations.fadeIn(page2);
    });
  }
}

/**
 * page scroll listener
 */
qs('.wrapper').onscroll = (e) => requestAnimationFrame(_ => {
  const infoHeight = qs('#info').offsetHeight / 2;
  var wrapper;
  var page1 = qs('#page1');
  var page2 = qs('#page2');
  var page3 = qs('#page3');
  if (page1.style.display === 'block') {
    wrapper = page1;
  } else if (page2.style.display === 'block') {
    wrapper = page2;
  } else if (page3.style.display === 'block') {
    wrapper = page3;
  }
  const scrollTop = e.target.scrollTop;
  const fab = qs('#fab');
  const change = scrollTop / 6;
  let top = 128 - change;
  if (top <= 65) {
    top = 65;
  }
  if (scrollTop > infoHeight) {
    animations.fadeIn(qs('#dl-buttons'));
    cascadeCards(wrapper);
    animations.fadeOut(qs('#stuff-below'));
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

// qs('#paypal').onClick(_ => {
//   window.location.href = 'https://www.paypal.me/jdough10';
// });

qs('#home').onClick(homePage);

qs('#demos').onClick(demosPage);

qs('#oldStats').onClick(oldStatsPage);

qs('#demoZip').onClick(_ => {
  const a = document.createElement('a')
  a.href = `https://hl2dm.dough10.me/api/download/demos-zip/${qs('#months').value}.zip`;
  a.type = 'application/zip';
  a.download = true;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

qs('#logZip').onClick(_ => {
  const a = document.createElement('a')
  a.href = `https://hl2dm.dough10.me/api/download/logs-zip/${qs('#months').value}.zip`;
  a.type = 'application/zip';
  a.download = true;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

qs('#months').addEventListener('change', e => {
  var m = new Date(Number(e.target.value)).getMonth();
  fetchOldMonths(m, _ => {
    // cascadeCards(qs('#page2'));
  });
});

var alert = qs('#reset');
alert.onClick(_ => {
  animations.animateElement(alert, 'translateY(-120%)', 800, 0, 0);
});

qs('#fab').onClick(animations.animateScroll);

window.onload = registerServiceWorker().then(reg => {
  if (!('PushManager' in window)) {
    return;
  }
  console.log(reg);
}).then(loadRipples).then(_ => {
  if ("WebSocket" in window) {
    connectWSS();
  } else {
    fetchServerStatus();
    setTimeout(fetchServerStatus, 5000);
  }
  if (!page) {
    console.error('Error loading page.js');
    return;
  }
  page('/', homePage);
  page('/old-stats', oldStatsPage);
  page('/demos', demosPage);
  page();
});
