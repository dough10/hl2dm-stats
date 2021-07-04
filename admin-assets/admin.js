  
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

async function purgeContent(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function cardClicked(e) {
  let playerID = e.target.id;
  let container = qs('#content');
  await fadeOut(container, 400);
  purgeContent(container);
  let response = await fetch(`/playerStats/${playerID}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let stats = await response.json();
  let card = document.createElement('div');
  card.classList.add('statsCard');
  card.textContent = JSON.stringify(stats, null, 2);
  container.appendChild(card);
  fadeIn(container);
}

function playerEl(player) {
  let name = player.name;
  let id = player.id;
  if (!name) return;
  let container = qs('#content');
  let card = document.createElement('div');
  card.classList.add('card');
  let pn = document.createElement('div');
  pn.style.pointerEvents = 'none';
  pn.textContent = name;
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
  for (let i = 0; i < players.length; i++) {
    playerEl(players[i]);
  }
  animateElement(document.querySelector('#loader'),  'translateY(-102%)', 350);
}

window.onload = getPlayers();