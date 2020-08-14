
const OWNER = 4751021054623744;

const MERCH_POINT = { x: -206, y: -111, id: "main", map: "main" };

function merchInPosition()
{
    if (character.name != "MKMe")
        return false;

    return simple_distance(character, MERCH_POINT) < 250;
}

// Per-character values
var char_const = {};

char_const["MauranKilom"] = {
    move_ratio: 0.13,
    hp_pot_thresh: 0.75,
    mp_pot_thresh: 0.9,
};
char_const["MKRa"] = {
    move_ratio: 0.2,
    hp_pot_thresh: 0.75,
    mp_pot_thresh: 0.6,
    max_targets: 3,
};
char_const["MKWa"] = {
    move_ratio: 0.5,
    hp_pot_thresh: 0.8,
    mp_pot_thresh: 0.6,
    max_targets: 8,
};

function c(key, def) {
    let char_name = character.name;
    if (!(char_name in char_const))
        return def;
    if (!(key in char_const[char_name]))
        return def;
    return char_const[char_name][key];
}
