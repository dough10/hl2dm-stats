const Gamedig = require('gamedig');                       // get data about game servers

var nr = 0;
function printPlayersToConsole(players) {
  if (new Date().getTime() < nr) {
    return;
  }
  if (players[0].name) {
    console.log(`${new Date().toLocaleString()} - Players Online`);
  }
  // print out players in server name and score  with a fixed length of 80 chars
  for (var i = 0; i < players.length; i++) {
    if (players[i].name) {
      var name = players[i].name;
      var score = players[i].score.toString();
      var l = ((80 - name.length) - score.length) - 9;
      var space = '';
      for (var n = 1; n < l; n++) {
        space = space + '-';
      }
      console.log(`${name.cyan} ${space.grey} score: ${score.green}`)
    }
  }
  nr = new Date().getTime() + 60000;
}

/**
 * get GameDig data from game server
 */
function getstate(onFragLimit) {
  return new Promise((resolve, reject) => {
    Gamedig.query({
      type: 'hl2dm',
      host: require(`../config.json`).gameServerHostname
    }).then((state) => {
      // if a player has 60 kills update stats
      for (var i = 0; i < state.players.length; i++) {
        if (state.players[i].score === Number(state.raw.rules.mp_fraglimit) && !updated) {
          setTimeout(_ => {
            onFragLimit();
          }, 5000);
        }
      }
      if (state.players.length > 0) {
        printPlayersToConsole(state.players);
      }
      resolve(state);
    }).catch(reject);
  });
}


module.exports = getstate;
