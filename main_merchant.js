
loadCode("General.js")
.then(p => loadCode("Data.js"))
.then(p => loadCode("Towns.js"))
.then(p => loadCode("Upgrading.js"))
.then(p => loadCode("Exchange.js"))
.then(p => loadCode("Events.js"))
.then(function() {


game_log("Finished code loading!");


add_top_button("electron_dev_tools", "DEV", function() { parent.electron_dev_tools(); })


// Regenerate resources.
setInterval(function () {
    use_hp_or_mp_fixed();
    loot();
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


function getMluckPriority(target)
{
    let mluck = target.s["mluck"];
    let isMyChar = (target.owner === OWNER);
    let isMerchant = (target.ctype && target.ctype === "merchant");
    let distance = simple_distance(character, target);

    // Always prioritize unbuffed chars.
    if (!mluck)
        return 1000 * (isMyChar ? 2 : 1);

    let priority = 0;
    let minutesPassed = 60 - mluck.ms / 1000 / 60;

    // Buffed by me?
    if (mluck.f === character.id)
        priority += minutesPassed * distance / 100;
    // Strong buff (by someone else)?
    else if (mluck.strong)
        return -1;
    // Buffed in the last minute (by someone else)?
    else if (minutesPassed < 1)
        priority += minutesPassed * distance / 100;
    // Ok, good candidate
    else
        priority += 100;

    // Moving (maybe about to leave)?
    if (is_moving(target))
        priority += distance / 10;

    // Definitely leaving?
    if (is_transporting(target))
        priority += 500;

    // Prioritize own characters.
    if (isMyChar)
        priority *= 2;

    // Buffing merchants is kinda pointless.
    if (isMerchant)
        priority /= 60;

    return priority;
}

// Merchant's luck logic.
setInterval(function () {
    // Probably busy healing vs chickens?
    if (character.mp < 0.5 * character.max_mp)
        return;

    let targets = Object.values(parent.entities).filter(entity => is_character(entity) && parent.distance(character, entity) < 320 - 1);

    for (let current of targets) {
        current.priority = getMluckPriority(current);
    }

    // Sort by descending priority.
    let sorted_targets = sort_by(targets, t => -t.priority);
    
    // Buff!
    if (sorted_targets.length > 0 && sorted_targets[0].priority > 0)
        use_skill("mluck", sorted_targets[0]);
}, 1000 / 2);


let secondhands_whitelist = [
    "wcap",
    "wattire",
    "wbreeches",
    "wshoes",
    "wgloves",
    "stramulet",
    "dexamulet",
    "intamulet",
    "strring",
    "dexring",
    "intring",
    "strearring",
    "dexearring",
    "intearring",
    "strbelt",
    "dexbelt",
    "intbelt",
    "santasbelt",
    "elixirstr0",
    "elixirdex0",
    "elixirint0",
    "handofmidas",
    "wingedboots",
    "cape",
    "jacko",
    "orbofstr",
    "orbofdex",
    "orbofint",
    //"cclaw",
    "cape",
    "hbow",
    "t2bow",
    "basher",
    "bataxe",
    "fireblade",
    "firestaff",
    "firebow",
    "sshield",
    "wbook0",
    "wbook1",
    "t2quiver",
    "elixirstr0",
    "elixirdex0",
    "elixirint0",
    "elixirstr1",
    "elixirdex1",
    "elixirint1",
    "elixirstr2",
    "elixirdex2",
    "elixirint2",
    "pumpkinspice",
    "offeringp",

    "essenceoflife",
    "rattail",
    "frogt",
    "carrot",
    "bfur",
    "electronics",
    "essenceofgreed",
    "mbones",
    "gslime",
    "beewings",
    "bandages",

    "seashell",
    "leather",
    "mistletoe",
    "candy1",
    "gem1",
    "goldenegg",
    "armorbox",
    "bugbountybox",
    "candy0",
    "gem0",
    "weaponbox",

    "cxjar",
    "emptyjar",
    "poison",
];

let PARENT = parent;

const MAX_SECONDHANDS_BUY = 500000; // Do not spend more than this.

let lastSBuy = new Date();

PARENT.noSecondhandsUI = false;

let lastRids = [];

function emitSecondhands() {
    parent.socket.emit("secondhands");
    PARENT.noSecondhandsUI = true;
}

// When somebody sells something that we want, immediately ask Ponty about it.
game.on("sell", function (a) {
    flog("[Vendor] " + a.name + " sold " + JSON.stringify(a.item) + " to NPC " + a.npc);

    for (let itemName of secondhands_whitelist) {
        if (a.item.name === itemName) {
            emitSecondhands();
            return;
        }
    }
});

// But also ask Ponty regularly for any new bling.
setInterval(function() {
    if (distance(character, find_npc("secondhands")) < 400)
        emitSecondhands();
}, 600);

// When Ponty shows us merch, check if we want to buy any of it.
register_handler("secondhands", function(d) {
    let boughtItemCount = 0;
    for (let offeredItem of d) {
        let buy = false;

        if (G.items[offeredItem.name].type === "material")
            buy = true;
        for (let itemName of secondhands_whitelist) {
            if (offeredItem.name == itemName)
                buy = true;
        }

        if (!buy)
            continue;

        // We have already requested to buy this item.
        if (lastRids.indexOf(offeredItem.rid) > -1)
            continue;

        // From html.js:
        let itemValue = calculate_item_value(offeredItem) * 2 * (offeredItem.q || 1);
        if (itemValue > MAX_SECONDHANDS_BUY)
            continue;

        //if (new Date() - lastSBuy > 80) {
        if (boughtItemCount < 4) {
            parent.socket.emit("sbuy", {"rid": offeredItem.rid });
            lastRids.push(offeredItem.rid);
            boughtItemCount += 1;
        }
        //}
    }
    PARENT.noSecondhandsUI = false;
});

parent._old_render_secondhands = parent._old_render_secondhands || parent.render_secondhands;

parent.render_secondhands = function(a)
{
    if (PARENT.noSecondhandsUI)
        return;
    PARENT.console.log(PARENT.noSecondHandsUI);
    PARENT._old_render_secondhands(a);
};

// Occasionally clear the rids. We just keep track of them to not get a limitdc.
setInterval(function() {
    lastRids = [];
}, 12345);



// Danger below!

let sell_whitelist = [
    "hpamulet",
    "hpbelt",
    "vitearring",
    "slimestaff",
    "mushroomstaff",
    "stinger",
    "phelmet",
];


setInterval(function () {
    if (!in_town(character))
        return;

    for (let nameToSell of sell_whitelist)
	    for (let index in character.items)
        {
            let item = character.items[index];
            if (!item)
                continue;
            // Only automatically sell lvl 0 items!
            if (item.level && item.level > 0)
                continue;
		    if(item.name === nameToSell)
                sell(index);
        }
}, 500);



setInterval(function () {
    if (character.map !== "cyberland")
        return;
    parent.socket.emit('eval', {'command': "give spares"}); 
    parent.socket.emit('eval', {'command': 'stop'});
}, 1000);






}).catch(e => game_log("Error while loading: " + e));
