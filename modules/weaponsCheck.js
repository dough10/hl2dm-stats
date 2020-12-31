
/**
 * checks if weapon selection is a valid weapon name
 * @module modules/weaponCheck
 * 
 * @param {String} weapon - name of a weapon
 * 
 * @returns {Boolean} true: is a weapon name, false: is not a weapon name
 * 
 * @example <caption>Example usage of isWeapon() function.</caption>
 * var mag = isWeapon('357');
 * // console.log(mag) = true
 */
function isWeapon(weapon) {
  var w = [
    '357',
    'ar2',
    'combine_ball',
    'crossbow_bolt',
    'crowbar',
    'grenade_frag',
    'physbox',
    'physics',
    'pistol',
    'shotgun',
    'smg1',
    'smg1_grenade',
    'stunstick',
    'rpg_missile',
    'world',
    'headshots',
    'physcannon'
  ];
  return w.includes(weapon);
}

module.exports = isWeapon;
