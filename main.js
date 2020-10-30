loadCode("Data.js")
.then(p => loadCode("General.js"))
.then(p => loadCode("Towns.js"))
.then(p => loadCode("Upgrading.js"))
.then(p => loadCode("Events.js"))
.then(p => loadCode("PhoenixChase.js"))
.then(p => loadCode("UI.js"))
.then(function() {

flog("Code loaded.")

game_log("Finished code loading!");


var attack_mode = true;
var move_to_engage = true;


function prepareAttack()
{

}


function performAttack()
{
    // 
}

function targetChoice(args)
{
    let current_target = get_targeted_monster();
    let targeting_me = [];
    let in_range = [];
    let other = [];
    for (id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_xp && current.xp < args.min_xp) continue;
        if (args.max_att && current.attack > args.max_att) continue;
        if (args.min_att && current.attack < args.min_att) continue;
        if (args.target && current.target != args.target) continue;
        if (args.no_target && current.target && current.target != character.name) continue;
        if (args.exclusive_target && current.target && current.target === character.name) continue;
        if (args.path_check && !can_move_to(current)) continue;
        if (current == current_target) continue; // Treated specially below.

        if (current.target && current.target === character.name)
            targeting_me.push(current);
        else if (is_in_range(current, args.skill))
            in_range.push(current);
        else
            other.push(current);
    }

    // Always include current target if valid and in range.
    let targets = [];
    if (current_target && !current_target.rip && is_in_range(current_target))
        targets.push(current_target)

    // Next add anything else targeting me - it has to die!
    targets = targets.concat(targeting_me);

    // Add other targets in range - but only if we don't have to focus on a specific enemy.
    if (!targets.find(t => t.mtype === "phoenix"))
        targets = targets.concat(in_range)

    // Keep only the first n.
    targets = targets.slice(0, args.max_targets || 1);

    // Got anything? Return it.
    if (targets.length > 0)
        return targets;
	

    // Otherwise, pick the nearest monster (which is necessarily outside our range), or
    // phoenix if it is in range.
    for (id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (current.mtype == "phoenix")
            return [current];
    }
    
    return [getNearestMonster(args)];
}


function targetsInCleaveRange()
{
    let count = 0;
    for (id in parent.entities) {
        let current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        //if (is_in_range(current, "cleave")) // unreliable atm
        if (simple_distance(character, current) < G.skills.cleave.range)
            count++;
    }
    return count;
}


if (false && character.name === "MKRa")
    setInterval(function () {
        var targeting_me = [];
        for (id in parent.entities) {
            var current = parent.entities[id];
            if (current.type != "monster" || !current.visible || current.dead) continue;
            if (current.target && current.target === character.name) targeting_me.push(current);
        }
        var targetMeStr = "(" + targeting_me.length + ")";
        for (t of targeting_me)
            targetMeStr += ", " + t.id;
        flog("Targeting me = " + targetMeStr + "; my attack = " + character.attack + "; my mana = " + character.mp + "; last ping = " + parent.pings[parent.pings.length - 1]);
    }, 20);


function monstersTargetingMe() {
    var targeting_me = [];
    for (id in parent.entities) {
        var current = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (current.target && current.target === character.name) targeting_me.push(current);
    }
    return targeting_me;
}


let lastMove = new Date();

// move that doesn't cause dclimit (outside of packet loss scenarios)
function safe_move(x, y)
{
    if (new Date() - lastMove > 70 /*ms*/) {
        move(x, y);
        lastMove = new Date();
    }
}

function approach(target, upTo) {
    const MAX_DIST = 80;
    let dx = (get_x(target) - get_x(character)) * c("move_ratio", 0.2);
    let dy = (get_y(target) - get_y(character)) * c("move_ratio", 0.2);
    // Only move if it's a nontrivial amount.
    if ((abs(dx) > upTo) || (abs(dy) > upTo))
        safe_move(get_x(character) + min(dx, MAX_DIST), get_y(character) + min(dy, MAX_DIST));
}


// Does a move towards the target, but only for up to the specified amount of time.
function move_max_ms(target, ms)
{
    let fullDist = simple_distance(character, target);
    let speed = character.speed;
    let fullTime = fullDist / character.speed * 1000;
    if (fullTime < ms)
        safe_move(get_x(target), get_y(target));
    else
    {
        let ratio = ms / fullTime;
        let x = get_x(character) + ratio * (get_x(target) - get_x(character));
        let y = get_y(character) + ratio * (get_y(target) - get_y(character));
        safe_move(x, y);
    }
}

let enable3Shot = true;
if (character.name == "MKRa")
  add_bottom_button("enable3Shot_toggle", "3SHOT", function() {enable3Shot = !enable3Shot; set_button_color("enable3Shot_toggle", enable3Shot ? "#21B221" : "#B21221"); });

let enable5Shot = false;
if (character.name == "MKRa")
  add_bottom_button("enable5Shot_toggle", "5SHOT", function() { enable5Shot = !enable5Shot; set_button_color("enable5Shot_toggle", enable5Shot ? "#21B221" : "#B21221"); });

setInterval(function () {

    use_hp_or_mp_fixed();
    loot();

    if (!attack_mode || character.rip) return;
    if (is_moving(character) || isTransportingFixed(character)) return;
    if (in_town(character)) return;

    let targets = targetChoice({ min_xp: 1, max_att: 230, min_att: 10, max_targets: c("max_targets", 1) });
    if (targets.length == 0)
    {
        set_message("No monsters");
        return;
    }

    let primary_target = targets[0];
    if (!primary_target)
        return;
    
    // Dirty fix for soloing phoenix:
    // Random straggler monsters need to be killed or they might overwhelm the regen.
    let targeting_me = monstersTargetingMe();
    if (targeting_me.length > 0)
        primary_target = targeting_me[Math.floor(Math.random() * targeting_me.length)];
    
    let current_target = get_targeted_monster();
    if (current_target != primary_target)
        change_target(primary_target);

    if (!is_in_range(primary_target))
    {
        approach(primary_target, 1);
        return;
    }

    if (can_attack(primary_target))
    {
        set_message("Attacking")
        if (character.name == "MKRa" && enable5Shot && character.mp >= 420 && targets.length > 4)
            use_skill("5shot", targets);
        else if (character.name == "MKRa" && enable3Shot && character.mp >= 300 && targets.length > 2)
            use_skill("3shot", targets);
        else if (character.name == "MKWa" && character.slots.mainhand.name == "bataxe" && character.mp >= 720 && targetsInCleaveRange() >= 4)
            use_skill("cleave");
        else
            attack(primary_target);
    }

}, 1000 / 16 + 5);


// Energize
setInterval(function () {
    if (character.name !== "MauranKilom")
        return;
    if (parent.next_skill["energize"] > new Date())
        return;
    let MKRa = parent.entities["MKRa"];
    if (!MKRa)
        return;
    if (parent.distance(character, MKRa) > 310)
        return;
    //if (MKRa.max_mp - MKRa.mp < 300)
    if (MKRa.mp > 700)
        use_skill("energize", MKRa);
}, 205);


// Hunter's Mark
setInterval(function () {
    if (character.name !== "MKRa")
        return;
    if (parent.next_skill["huntersmark"] > new Date())
        return;
    let target = get_targeted_monster();
    if (!target)
        return;
    if (target.max_hp < 50000)
        return;
    if (parent.distance(character, target) > 310)
        return;
    if (character.mp > 240)
        use_skill("huntersmark");
}, 1005);

let chestSightings = [];

setInterval(function() {
  for (let c in parent.chests) {
    chestSightings[c] = chestSightings[c] ? chestSightings[c] + 1 : 1;
    if (chestSightings[c] == 10)
      chest_log(c);
  }
}, 1000);

function openLoggedChests(str)
{
  // Chest identifiers are currently exactly 30 alphanumeric chars long.
  let chestsToOpen = str.replace(/.*([A-z0-9]{30})/g, "$1").split("\n");

  let chestIndex = 0;

  let interval = setInterval(function(){
    if (character.esize < 8)
      return;

    let id = chestsToOpen[chestIndex];

    game_log("Opening " + id);
    parent.socket.emit("open_chest", {
          id: id
      });

    // This leaves an off-by-one error, but the "undefined" printout is actually useful.
    if (chestIndex >= chestsToOpen.length)
      clearInterval(interval);
    chestIndex += 1;
  }, 500);
}
parent.openLoggedChests = openLoggedChests;

/*


map_key("H", "snippet", "for (let index in character.items) if (character.items[index]) { send_item('MKMe', index, 1000000); break; }");
map_key("G", "snippet", "send_gold('MKMe', 1000000);");

map_key("M", "snippet", 'use("magiport", "MKRa"); setTimeout(() => use("magiport", "MKWa"), 200); setTimeout(() => use("magiport", "MKWa"), 400);');

//Modified source code of: draw_circle
function draw_circle_on_char(radius,size,color)
{
	if(!game.graphics) return;
	if(!color) color=0x00F33E;
	if(!size) size=0.3;
	e=new PIXI.Graphics();
	e.lineStyle(size, color);
	e.drawCircle(0,0,radius);
	parent.drawings.push(e);
	character.addChild(e);
	return e;
}

let eCleave = null;
setInterval(function () {
    if (!eCleave) {
        eCleave = draw_circle_on_char(G.skills.cleave.range);
	}
}, 10);
*/
	
}).catch(e => game_log("Error while loading: " + e));
