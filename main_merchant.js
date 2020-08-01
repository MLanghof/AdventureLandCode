function load_local_code(fileName) {
    const fs = require('fs')
    const data = fs.readFileSync("D:/Users/Max/Documents/AdventureLand/Code/" + fileName, 'utf8')
    var library = document.createElement("script");
    library.type = "text/javascript";
    library.text = data;
    document.getElementsByTagName("head")[0].appendChild(library);
}

load_local_code("General.js");
load_local_code("Data.js");
load_local_code("Towns.js");
load_local_code("Upgrading.js");

game_log("Finished code loading!");


// Regenerate resources.
setInterval(function () {
    use_hp_or_mp_fixed();
}, 1000 / 10);


// Deploy merchant stand only while stationary.
setInterval(function () {
    if (is_moving(character) && (!!character.stand))
        parent.close_merchant();
    if (!is_moving(character) && (!character.stand))
        parent.open_merchant(locate_item("stand0"));
}, 1000 / 10);


// Cosmetic :)
var i = 0;
setInterval(function () {
    i = (i + 1) % 40;
    if (is_moving(character)) return;
    switch (i) {
        case 1: move(character.x - 0.00001, character.y); break;
        case 4: move(character.x, character.y + 0.00001); break;
        case 15: move(character.x + 0.00001, character.y); break;
        case 21: move(character.x, character.y + 0.00001); break;
        default: break;
    }
}, 1000 / 2);


// Merchant's luck logic.
setInterval(function () {
    let targets = Object.values(parent.entities).filter(entity => is_character(entity) && parent.distance(character, entity) < 320);

    for (current of targets){
        current.priority = 0;

        // Not yet buffed by me?
        var mluck = current.s["mluck"];
        if (mluck && mluck.f === "MKMe")
            current.priority += 60 - (mluck.ms / 1000 / 60);
        else
            current.priority += 100;
        
        // Moving (maybe about to leave)?
        if (is_moving(current))
            current.priority += 10;

        // Definitely leaving?
        if (is_transporting(current))
            current.priority += 1000;

        // Prioritize own characters.
        if (current.owner === OWNER)
            current.priority *= 2;
    }

    // Sort by descending priority.
    let sorted_targets = sort_by(targets, t => -t.priority);
    
    // Buff!
    if (sorted_targets.length > 0)
        use_skill("mluck", sorted_targets[0]);
}, 1000 / 2);

