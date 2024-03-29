
let PARENT = parent;

const CHARACTER_NAME = parent.character.name;
const IS_ELECTRON = is_electron();

var fs;
var path;
if (IS_ELECTRON) {
    fs = require('fs');
    path = require('path');
}

function flog(message) {
    if (!IS_ELECTRON)
        return;
    var now = new Date();
    var full_message = "[" + now.toISOString() + "] " + message;
    var filePath = path.join("D:/Users/Max/Documents/AdventureLand/Logs/", CHARACTER_NAME + ".log");
    fs.appendFileSync(filePath, full_message + "\n", (err) => {});
};

function flog_alt(message) {
    if (!IS_ELECTRON)
        return;
    var now = new Date();
    var full_message = "[" + now.toISOString() + "] " + message;
    var filePath = path.join("D:/Users/Max/Documents/AdventureLand/Logs/", CHARACTER_NAME + ".alt.log");
    fs.appendFileSync(filePath, full_message + "\n", (err) => {});
};

function chest_log(message) {
    if (!IS_ELECTRON)
        return;
    var now = new Date();
    var full_message = "[" + now.toISOString() + "] " + message;
    var filePath = path.join("D:/Users/Max/Documents/AdventureLand/Logs/", CHARACTER_NAME + ".chests.log");
    fs.appendFileSync(filePath, full_message + "\n", (err) => {});
};

function upgrade_log(message) {
    if (!IS_ELECTRON)
        return;
    var now = new Date();
    var full_message = "[" + now.toISOString() + "] " + message;
    var filePath = path.join("D:/Users/Max/Documents/AdventureLand/Logs/", CHARACTER_NAME + ".upgrade.log");
    fs.appendFileSync(filePath, full_message + "\n", (err) => {});
    game_log("U: " + message);
};


// Wishlist:
// - is traveling (moving for extended period)

function sort_by(arr, f) {
    return arr.sort((e1, e2) => (fe1 = f(e1), fe2 = f(e2), (fe1 < fe2 ? -1 : (fe1 > fe2 ? 1 : 0))));
}

let assertCount = 0;

function assert(condition, ...params) {
    if (!condition)
    {
        let str = "[ASSERT] ASSERTION FAILURE, CHECK CONSOLE";
        if (assertCount < 10)
            show_json({"assert": str, "counter": assertCount});
        game_log(str);
        flog(str);
        ++assertCount;
        console.assert(condition, ...params);
    }
}


function isPvP()
{
    return (parent.is_pvp || G.maps[character.map].pvp);
}

function use_hp_or_mp_fixed() {
    if (safeties && mssince(last_potion) < min(200, character.ping * 3)) return;
    var used = false;
    // On cooldown?
    if (new Date() < parent.next_skill.use_hp) return;
    // In dire need of mana?
    if (character.mp / character.max_mp < 0.1) use('use_mp'), used = true;
    // Potion use justified?
    else if (character.hp < character.max_hp - 400) use('use_hp'), used = true;
    else if (character.mp < character.max_mp - 500) use('use_mp'), used = true;
    // Anything to regen without wasting?
    // Prefer MP as HP is less effective.
    else if (character.mp < character.max_mp - 100) use('regen_mp'), used = true;
    else if (character.hp < character.max_hp - 50) use('regen_hp'), used = true;
    // Anything to regen at all?
    else if (character.hp < character.max_hp) use('regen_hp'), used = true;
    else if (character.mp < character.max_mp) use('regen_mp'), used = true;
    if (used) last_potion = new Date();
}

function for_nearby_monsters(f)
{
    for (id in parent.entities) {
        var current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (current.target && current.target === character.name) targeting_me++;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_xp && current.xp < args.min_xp) continue;
        if (args.max_att && current.attack > args.max_att) continue;
        if (args.target && current.target != args.target) continue;
        if (args.no_target && current.target && current.target != character.name) continue;
        if (args.exclusive_target && current.target && current.target === character.name) continue;
        if (args.path_check && !can_move_to(current)) continue;
        var c_dist = parent.distance(character, current);
        if (c_dist < min_d) min_d = c_dist, target = current;
    }
}


// Extended version of get_nearest_monster
function getNearestMonster(args)
{
    //args:
    // max_att - max attack
    // min_xp - min XP
    // target: Only return monsters that target this "name" or player object
    // no_target: Only pick monsters that don't have any target
    // path_check: Checks if the character can move to the target
    // type: Type of the monsters, for example "goo", can be referenced from `show_json(G.monsters)` [08/02/17]
    var min_d=999999,target=null;
    
    if(!args) args={};
    if(args && args.target && args.target.name) args.target=args.target.name;
    if(args && args.type=="monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead");
    if(args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'");
    
    for(id in parent.entities)
    {
        var current=parent.entities[id];
        if(current.type!="monster" || !current.visible || current.dead) continue;
        if(args.type && current.mtype!=args.type) continue;
        if(args.min_xp && current.xp<args.min_xp) continue;
        if(args.max_att && current.attack>args.max_att) continue;
		if(args.min_att && current.attack<args.min_att) continue;
        if(args.target && current.target!=args.target) continue;
        if(args.no_target && current.target && current.target!=character.name) continue;
		if(args.exclusive_target && current.target && current.target===character.name) continue;
        if(args.path_check && !can_move_to(current)) continue;
        var c_dist=parent.distance(character,current);
        if(c_dist<min_d) min_d=c_dist,target=current;
    }
    return target;
}


function getMonstersWhere(f)
{
    let ret = [];
    // Yes, you could filter or map or whatever. If I had type safety I would.
    for (let id in parent.entities)
    {
        let e = parent.entities[id];
        if (e.type != "monster" || !e.visible || e.dead)
            continue;
        if (f(e))
            ret.push(e);
    }
    return ret;
}


function haveEmptySlot() {
    return character.items.findIndex(i => !i) != -1;
}


function ms_until(a, b)
{
    b || (b = new Date);
    return a.getTime() - b.getTime()
}
