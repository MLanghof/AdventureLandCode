function load_local_code(fileName) {
    const fs = require('fs')
    const data = fs.readFileSync("D:/Users/Max/Documents/AdventureLand/Code/" + fileName, 'utf8')
    var library = document.createElement("script");
    library.type = "text/javascript";
    library.text = data;
    document.getElementsByTagName("head")[0].appendChild(library);
}


load_local_code("Data.js");
load_local_code("General.js");
load_local_code("Towns.js");
load_local_code("Upgrading.js");



game_log("Finished code loading!");


function get_nearest_monster_new(args)
{
	//args:
	// max_att - max attack
	// min_xp - min XP
	// target: Only return monsters that target this "name" or player object
	// no_target: Only pick monsters that don't have any target
	// exclusive_target: Only pick monsters with target different from own character
	// path_check: Checks if the character can move to the target
	// type: Type of the monsters, for example "goo", can be referenced from `show_json(G.monsters)` [08/02/17]
	var min_d=999999,target=null;

	if(!args) args={};
	if(args && args.target && args.target.name) args.target=args.target.name;
	if(args && args.type=="monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead");
	if(args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'");

	var targeting_me = 0;
	var players_nearby = 0;
	for(id in parent.entities)
	{
		var current=parent.entities[id];
		if (current.type === "character" && parent.distance(character,current) < 150)
			players_nearby++;
		if(current.type!="monster" || !current.visible || current.dead) continue;
		if (current.target && current.target === character.name) targeting_me++;
	}
	if (targeting_me > players_nearby + 1)
	{
		set_message("(scared)");
		return get_targeted_monster();
	}
	
	for(id in parent.entities)
	{
		var current=parent.entities[id];
		if(current.type!="monster" || !current.visible || current.dead) continue;
		if (current.target && current.target === character.name) targeting_me++;
		if(args.type && current.mtype!=args.type) continue;
		if(args.min_xp && current.xp<args.min_xp) continue;
		if(args.max_att && current.attack>args.max_att) continue;
		if(args.target && current.target!=args.target) continue;
		if(args.no_target && current.target && current.target!=character.name) continue;
		if(args.exclusive_target && current.target && current.target===character.name) continue;
		if(args.path_check && !can_move_to(current)) continue;
		var c_dist=parent.distance(character,current);
		if(c_dist<min_d) min_d=c_dist,target=current;
	}
	return target;
}

var attack_mode = true;
var move_to_engage = true;

setInterval(function () {

    use_hp_or_mp_fixed();
    loot();

    if (!attack_mode || character.rip) return;
    if (is_moving(character) || is_transporting(character)) return;
    if (in_town(character)) return;

    //var target = get_targeted_monster();
    var newTarget = get_nearest_monster({ min_xp: 100, max_att: 330 });
    //if (!target || ) {
        if (newTarget) change_target(newTarget);
        else {
            set_message("No Monsters");
            return;
        }
    //}
		
		var target = newTarget;

				if (character.name === "MauranKilom" && character.in === "winterland" && character.hp > 0.5 * character.max_hp)
					target = get_nearest_monster_new({ min_xp: 100, max_att: 330, no_target: true, exclusive_target: true });
        if (target) change_target(target);
				
    if (!is_in_range(target)) {
        if (!move_to_engage) return;
        move(
			character.x + (target.x - character.x) * c("move_ratio", 0.2),
			character.y + (target.y - character.y) * c("move_ratio", 0.2)
			);
        // Walk half the distance
    }
    else if (can_attack(target)) {
        set_message("Attacking");
				if (character.name == "MKRa" && character.mp > 300)
				{
					let targets = Object.values(parent.entities).filter(entity => entity.mtype === "bee" && is_in_range(entity, "3shot"));
					if (targets.length >= 2)
						use_skill("3shot", targets);
					else
						attack(target);
				}
				else
					attack(target);
        //move(character.x, character.y - 0);
    }

}, 1000 / 16 + 5);
