
const OWNER = 4751021054623744;


// Per-character values
var char_const = {};

char_const["MauranKilom"] = {
    move_ratio: 0.13,
};
char_const["MKWa"] = {
    move_ratio: 0.5,
};

function c(key, def) {
    let char_name = character.name;
    if (!(char_name in char_const))
        return def;
    if (!(key in char_const[char_name]))
        return def;
    return char_const[char_name][key];
}

