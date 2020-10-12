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

export {attachButtonRipple, attachRoundButtonRipple};
