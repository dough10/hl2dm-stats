  
HTMLElement.prototype.onClick = function(cb) {
  this.addEventListener('click', cb, false);
};

function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
  return (scope || document).querySelectorAll(selector);
}

function whichTransitionEvent() {
  let t;
  const el = document.createElement('fakeelement');
  const transitions = {
    'WebkitTransition' :'webkitTransitionEnd',
    'MozTransition'    :'transitionend',
    'MSTransition'     :'msTransitionEnd',
    'OTransition'      :'oTransitionEnd',
    'transition'       :'transitionEnd'
  };
  for (t in transitions) {
    if (el.style[t] !== undefined ) {
      return transitions[t];
    }
  }
}

const transitionEvent = whichTransitionEvent();

function animateElement(el, transform, time, opacity, delay) {
  return new Promise(resolve => {
    if (!el) {
      resolve();
      return; 
    }
    if (el.style.transform === transform) {
      resolve();
      return;
    }
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    if (!time) {
      time = 300;
    }
    if (!delay) {
      delay = 0;
    }
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'auto';
    el.style.transition = `all ${time}ms cubic-bezier(.33,.17,.85,1.1) ${delay}ms`;
    requestAnimationFrame(_ => {
      el.style.transform = transform;
      if (opacity !== undefined) {
        el.style.opacity = opacity;
      }
    });
  });
}

function fadeOut(el, time) {
  return new Promise(resolve => {
    if (!el) {
      return resolve();
    }
    if (el.style.opacity === 0) {
      return resolve();
    }
    if (!time) {
      time = 200;
    }
    var animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 0;
    });
  });
}

function fadeIn(el, time) {
  return new Promise(resolve => {
    if (!el) {
      return resolve();
    }
    if (el.style.opacity === 1) {
      return resolve();
    }
    if (!time) {
      time = 200;
    }
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.willChange = 'initial';
      el.style.transition = 'initial';
      requestAnimationFrame(resolve);
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 1;
    });

  });
}

/**
 * check if ip is LAN address
 *
 * @param {String} ip ip address of the client connected to the server
 */
function isLocalIP(ip) {
  return /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(ip);
}

/**
 * lookup and caches ip address to get the origin country
 *
 * @param {String} ip ip address of the client connected to the server
 */
function ipLookup(ip, id) {
  return new Promise(async (resolve, reject) => {
    if ('localStorage' in window && localStorage[id]) {
      let savedData = JSON.parse(localStorage[id]);
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
    const response = await fetch(`https://get.geojs.io/v1/ip/country/${ip}.json`);
    if (response.status !== 200) {
      reject(response.status);
      return;
    }
    const json = await response.json();
    if ('localStorage' in window) {
      localStorage[id] = JSON.stringify(json);
    }
    resolve(json);
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
 * returns block container element
 */
 function createBlockWrapper() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'block';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.alignItems = 'center';
  wrapper.style.overflow = 'none';
  return wrapper;
}

/**
 * returns svg element
 *
 * @param {String} d svg string value
 * @param {Number} count number of kills or deaths
 * @param {String} title thing needing icon
 */
function createSVG(d, count, title, suicides, deathsBy) {
  const wrapper = createWrapper();
  const tooltip = document.createElement('div');
  wrapper.style.margin = '0 0.2em';
  wrapper.classList.add('tooltip');
  tooltip.classList.add('tooltiptext');
  tooltip.style.transformOrigin = 'center';
  let con = document.createElement('div');
  con.classList.add('tt-container');
  let div = document.createElement('div');
  let titleEl = document.createElement('span');
  titleEl.style.color = 'yellow';
  titleEl.textContent = `${title}: `;
  let countEl = document.createElement('span');
  countEl.textContent = `  ${count}`;
  div.appendChild(titleEl);
  div.appendChild(countEl);
  con.appendChild(div);
  if (deathsBy) {
    div.style.marginBottom = '8px';
    for (let i = 0; i < 3; i++) {
      if (deathsBy[i]) {
        let container = document.createElement('div');
        let title = document.createElement('span');
        title.style.color = 'bisque';
        let stat = document.createElement('span');
        title.textContent = `${deathsBy[i][0]}: `;
        stat.textContent = ` ${deathsBy[i][1]}`;
        container.appendChild(title);
        container.appendChild(stat);
        con.appendChild(container);
      }
    }
  }
  if (suicides) {
    let header = document.createElement('div');
    header.style.marginTop = '8px';
    let suic = document.createElement('span');
    suic.style.color = 'yellow';
    suic.textContent = `Deaths by suicide: `;
    let suicCount = document.createElement('span');
    if (suicides[0]) {
      suicCount.textContent = suicides[0][1];
    } else {
      suicCount.textContent = suicides.count;
    }
    header.appendChild(suic);
    header.appendChild(suicCount);
    con.appendChild(header);
    for (let i = 1; i < 4; i++) {
      if (suicides[i]) {
        header.style.marginBottom = '8px';
        let statContainer = document.createElement('div');
        let statTitleDiv = document.createElement('span');
        statTitleDiv.style.color = 'bisque';
        let statDiv = document.createElement('span');
        statTitleDiv.textContent = `${suicides[i][0]}: `;
        statDiv.textContent = `  ${suicides[i][1]}`;
        statContainer.appendChild(statTitleDiv);
        statContainer.appendChild(statDiv);
        con.appendChild(statContainer);
      }
    }
  }
  tooltip.appendChild(con);
  wrapper.appendChild(tooltip);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.height = '24px';
  svg.style.width = '24px';
  svg.classList.add('svg');
  svg.classList.add('eight-right');
  svg.setAttributeNS(null, "viewbox", "0 0 24 24");
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("d", d);
  path.style.stroke = "#00000";
  svg.appendChild(path);
  wrapper.appendChild(svg);
  const text = document.createElement('div');
  text.style = "font-size: 12px;";
  text.textContent = count;
  wrapper.appendChild(text);
  return wrapper;
}

/**
 * creates HTML for weapon info tooltips
 *
 * @param {String} weaponName name of the weapon
 * @param {Number} precent precentage of kills withs the weapon
 * @param {Number} shots Number of shots fired
 * @param {Number} hitPrecent precentage of shots fired that hit the target
 * @param {Number} hsPrecent precentage of shots fired that hit in the head
 */
function tooltipHTML(weaponName, count, precent, shots, hitPrecent, hsPrecent, shotsToKill, damage, adpk, adph, hss, lss) {
  let container = document.createElement('div');
  container.classList.add('tt-container');
  let weaponIcon = document.createElement('div');
  weaponIcon.style.color = '#ff0';
  let icon = getWeaponIcon(weaponName);
  if (icon) {
    weaponIcon.classList.add(icon[1]);
    weaponIcon.textContent = icon[0];
  }
  container.appendChild(weaponIcon);
  let header = document.createElement('div');
  header.classList.add('tt-header');
  header.textContent = weaponName;
  container.appendChild(header);
  container.appendChild(textDiv(`${numberWithCommas(count)} kills`));
  container.appendChild(textDiv(`${precent}% of total kills`));
  if (damage) {
    container.appendChild(textDiv(`${numberWithCommas(damage)} damage`));
  }
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
 * seperate a number with commas
 *
 * @param {Number} x number to be seperated
 */
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * creates a element and add text content
 *
 * @param {String} text the string of text to display in the element
 * @param {String} color color to display the text
 */
function textDiv(text, color) {
  let div = document.createElement('div');
  if (color) {
    div.style.color = color;
  }
  div.textContent = text;
  return div;
}

/**
 * returns the text value to represent the weapon used 
 * also the name of the class to display the correct font
 *
 * @param {String} weapon weapon needing icon
 */
function getWeaponIcon(weapon) {
  switch (weapon) {
    case "grenade_frag":
      return ['4', 'HL2Weapons'];
    case "357":
      return ['.', 'HL2Weapons'];
    case "shotgun":
      return ['0', 'HL2Weapons'];
    case "pistol":
      return ['-', 'HL2Weapons'];
    case "smg1":
      return ['/', 'HL2Weapons'];
    case "smg1_grenade":
      return ['7', 'HL2Weapons'];
    case "crowbar":
      return ['6', 'HL2Weapons'];
    case "crossbow_bolt":
      return ['1', 'HL2Weapons'];
    case "combine_ball":
      return ['8', 'HL2Weapons'];
    case "ar2":
      return ['2', 'HL2Weapons'];
    case "rpg_missile":
      return ['3', 'HL2Weapons'];
    case "physbox":
      return ['9', 'HL2Weapons'];
    case "stunstick":
      return ['!', 'HL2Weapons'];
    case "physics":
      return ['9', 'HL2Weapons'];
    case "headshots":
      return ['D', 'CS'];
    case "physcannon":
      return [',', 'HL2Weapons'];
  }
}

/**
 * greturns the stats of the weapon the player has the most kills
 *
 * @param {Array} weapons array of weapons player has kills with
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
 * displays weapon stats
 *
 * @param {Array} wrappers pair of elements to send output to limit 2
 * @param {Array} weapons list of weapons
 * @param {Number} kills total number of kills
 */
function displayWeaponData(wrappers, weapons, kills) {
  if (wrappers.length > 2) {
    throw Error('List or wrappers for weapons must not excede length of 2');
  }
  for (let i = 0; i < weapons.length; i++) {
    const weaponName = weapons[i][0];
    let count = weapons[i][1];
    let shots;
    let hitPrecent;
    let hsPrecent;
    let shotsToKill;
    let damage;
    let adpk;
    let adph;
    let hss;
    let lss;
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
    let icon = getWeaponIcon(weaponName);
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
 * convers 0's to < 1
 *
 * @param {Number} p %
 */
function isLessThenOne(p) {
  if (p === 0) {
    return '< 1';
  }
  return p;
}

function purgeContent(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function backToList() {
  let container = qs('#content');
  await fadeOut(container, 400);
  purgeContent(container);
  await getPlayers();
  container.parentNode.scrollTop = pos;
  fadeIn(container);
}

function textBlock(text) {
  let block = document.createElement('div');
  block.textContent = text;
  block.style.marginBottom = '16px';
  block.title = block.textContent;
  block.style.fontSize = '1.5em';
  return block;
}

function KDRBlock(player) {
  const killsIcon = "M7,5H23V9H22V10H16A1,1 0 0,0 15,11V12A2,2 0 0,1 13,14H9.62C9.24,14 8.89,14.22 8.72,14.56L6.27,19.45C6.1,19.79 5.76,20 5.38,20H2C2,20 -1,20 3,14C3,14 6,10 2,10V5H3L3.5,4H6.5L7,5M14,12V11A1,1 0 0,0 13,10H12C12,10 11,11 12,12A2,2 0 0,1 10,10A1,1 0 0,0 9,11V12A1,1 0 0,0 10,13H13A1,1 0 0,0 14,12Z";
  const deathsIcon = "M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.82 7,18.47V22H9V19H11V22H13V19H15V22H17V18.46C19.47,16.81 21,14 21,11A9,9 0 0,0 12,2M8,11A2,2 0 0,1 10,13A2,2 0 0,1 8,15A2,2 0 0,1 6,13A2,2 0 0,1 8,11M16,11A2,2 0 0,1 18,13A2,2 0 0,1 16,15A2,2 0 0,1 14,13A2,2 0 0,1 16,11M12,14L13.5,17H10.5L12,14Z";
  const kdrIcon = "M3 18.34C3 18.34 4 7.09 7 3L12 4L11 7.09H9V14.25H10C12 11.18 16.14 10.06 18.64 11.18C21.94 12.71 21.64 17.32 18.64 19.36C16.24 21 9 22.43 3 18.34Z";
  const stats = document.createElement('div');
  stats.style.width = '100%';
  stats.style.justifyContent = 'space-between';
  stats.style.display = "inline-flex";
  stats.style.marginTop = '48px';
  stats.style.marginBottom = '48px';
  const kills = createSVG(killsIcon, player.kills, "Kills");
  const deaths = createSVG(deathsIcon, player.deaths, "Deaths", player.suicide, player.deathsBy);
  const kdr = createSVG(kdrIcon, player.kdr, "KDR");
  stats.appendChild(kills);
  stats.appendChild(deaths);
  stats.appendChild(kdr);
  return stats;
}

async function nameBlock(player) {
  const name = document.createElement('div');
  name.style.fontSize = '2.5em';
  name.style.fontWeight = 'bold';
  name.style.marginBottom = '24px';
  if (!player.geo) {
    let response = await ipLookup(player.ip, player.id);
    name.textContent = `${player.name} (${response.country})`;
    name.title = `${player.name} (${response.country})`;
  } else {
    name.textContent = `${player.name} (${player.geo.country})`;
    name.title = `${player.name} (${player.geo.country})`;
  }
  if (player.banned) {
    name.textContent += `:  Banned`;
    name.style.color = 'rgb(185, 73, 73)';
  }
  return name;
}

function createMap(ll, username) {
  let loc = { lat: ll[0], lng: ll[1] };
  let map = document.createElement('div');
  map.style.height = '200px';
  map.style.width = '400px';
  map.id = 'map'; 
  let mInstance = new google.maps.Map(map, {
    center: loc,
    zoom: 7,
    disableDefaultUI: true,
  });
  let marker = new google.maps.Marker({
    position: loc,
    title: username,
  });
  marker.setMap(mInstance);
  return map;
}

async function playerStats(player, card) {
  const wrapper = createBlockWrapper();
  wrapper.style.width = '90%';
  const head = createWrapper();
  const name = await nameBlock(player);
  const l = document.createElement('div');
  l.appendChild(name);
  name.onClick(backToList);
  head.appendChild(l);
  wrapper.appendChild(head);
  l.appendChild(textBlock(`Steam ID: U:1:${player.id}`));
  if (player.geo) {
    head.appendChild(createMap(player.geo.ll, player.name));
    l.appendChild(textBlock(`Location: ${player.geo.city}, ${player.geo.region}`));
  } else {
    head.appendChild(createMap([
      35.614342,
      -88.819382
    ]));
    l.appendChild(textBlock(`Location: LAN`));
  }
  l.appendChild(textBlock(`IP Address: ${player.ip}`));
  wrapper.appendChild(KDRBlock(player));
  // top weapon row
  const weaponWrapper1 = createWrapper();
  weaponWrapper1.style.marginTop = '24px';
  weaponWrapper1.style.display = 'flex';
  // bottom weapon row
  const weaponWrapper2 = createWrapper();
  weaponWrapper2.style.marginTop = '24px';
  weaponWrapper2.style.display = 'flex';
  displayWeaponData([
    weaponWrapper1,
    weaponWrapper2
  ], player.weapons, player.kills);
  wrapper.appendChild(weaponWrapper1);
  wrapper.appendChild(weaponWrapper2);
  card.appendChild(wrapper);
}

async function cardClicked(e) {
  let playerID = e.target.id;
  let container = qs('#content');
  pos = container.parentNode.scrollTop;
  await fadeOut(container, 400);
  purgeContent(container);
  let response = await fetch(`/playerStats/${playerID}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let stats = await response.json();
  let card = document.createElement('div');
  card.classList.add('statsCard');
  playerStats(stats, card);
  container.appendChild(card);
  fadeIn(container);
}

function playerCard(player) {
  let name = player.name;
  let id = player.id;
  let country = player.country;
  if (!name) return;
  let container = qs('#content');
  let card = document.createElement('div');
  card.classList.add('card');
  let pn = document.createElement('div');
  pn.style.pointerEvents = 'none';
  pn.textContent = `${name} (${country})`;
  card.appendChild(pn);
  let pid = document.createElement('div');
  pid.style.pointerEvents = 'none';
  pid.textContent = `U:1:${id}`;
  card.appendChild(pid);
  card.id = id;
  container.appendChild(card);
  card.onClick(cardClicked);
} 

async function getPlayers() {
  let response = await fetch('/playerList');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let players = await response.json();
  players.map(playerCard);
  animateElement(document.querySelector('#loader'),  'translateY(-102%)', 350);
}

let pos = 0;
window.onload = getPlayers();


const initMap = () => {};