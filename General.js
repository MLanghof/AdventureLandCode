
function sort_by(arr, f) {
    return arr.sort((e1, e2) => (fe1 = f(e1), fe2 = f(e2), (fe1 < fe2 ? -1 : (fe1 > fe2 ? 1 : 0))));
}

function use_hp_or_mp_fixed() {
    if (safeties && mssince(last_potion) < min(200, character.ping * 3)) return;
    var used = false;
    // On cooldown?
    if (new Date() < parent.next_skill.use_hp) return;
    // In dire need of mana?
    if (character.mp / character.max_mp < 0.2) use('use_mp'), used = true;
    // Potion use justified?
    else if (character.hp / character.max_hp < 0.8) use('use_hp'), used = true;
    else if (character.mp / character.max_mp < 0.7) use('use_mp'), used = true;
    // Anything to regen without wasting?
    // Prefer MP as HP is less effective.
    else if (character.mp < character.max_mp - 100) use('regen_mp'), used = true;
    else if (character.hp < character.max_hp - 50) use('regen_hp'), used = true;
    // Anything to regen at all?
    else if (character.hp < character.max_hp) use('regen_hp'), used = true;
    else if (character.mp < character.max_mp) use('regen_mp'), used = true;
    if (used) last_potion = new Date();
}