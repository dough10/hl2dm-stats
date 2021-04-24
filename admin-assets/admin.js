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

function updateStats(stats) {
  console.log(stats);
  try {
    stats = JSON.parse(stats);
  } catch(err) {
    return console.error(err.message.red);
  }
  let cbox = document.querySelector('#cpubox');
  let pbox = document.querySelector('#playersbox');
  let fbox = document.querySelector('#fpsbox');
  cbox.textContent = `CPU: ${stats[0]}`;
  pbox.textContent = `Players: ${stats[6]}`;
  fbox.textContent = `FPS: ${stats[5]}`;
}

function connectDashboard() {
  setTimeout(_ => animateElement(document.querySelector('#loader'),  'translateY(-102%)', 350), 1000);
  let socket = new WebSocket(`ws://${window.location.host}/dashboard`);
  socket.onmessage = m => updateStats(m.data);
  socket.onerror = err => {
    console.log(err.message);
    socket.close();
  };
  socket.onclose = setTimeout(connectDashboard, 2000);
}


window.onload = connectDashboard();