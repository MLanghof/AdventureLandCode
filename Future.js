

//TODO: function is_aggro

// Predicts:
// - Position
// (more coming in the future?)
function future(entity, deltaMs, attacking) {
	//let fe = {};
	//"x y vx vy moving abs going_x going_y from_x from_y width height type mtype events angle skin events reopen".split(" ").forEach(function(a) {
	//	fe[a] = entity[a];
	//});

	// Thanks to earthiverse!
	let fe = {...entity};

    if (is_moving(entity)) {
        // Predict x and y
		let predicted_dx = deltaMs * entity.vx / 1000;
		let predicted_dy = deltaMs * entity.vy / 1000;
		if (abs(predicted_dx) > abs(entity.going_x - entity.real_x))
		{
			predicted_dx = entity.going_x - entity.real_x;
			predicted_dy = entity.going_y - entity.real_y;
		}
		// Don't care about the graphics code.
		fe.x = entity.x + predicted_dx;
		fe.y = entity.y + predicted_dy;
		fe.real_x = entity.real_x + predicted_dx;
		fe.real_y = entity.real_y + predicted_dy;
    }
	return fe;
}


// move_num -> some identifier of when move started

/*
 * Examples from parent.entity:
 *
 *
{
	"x": -47.56764523078941,
	"y": -291.769519765363,
	"width": 20,
	"height": 20,
	"alpha": 1,
	"visible": true,
	"cskin": "01",
	"i": 0,
	"j": 1,
	"skin": "rooster",
	"stype": "full",
	"updates": 8019,
	"type": "monster",
	"mtype": "rooster",
	"in": "main",
	"map": "main",
	"hp": 60,
	"max_hp": 60,
	"mp": 1,
	"max_mp": 1,
	"speed": 7,
	"xp": 10,
	"attack": 48,
	"frequency": 1.5,
	"rage": 0.2,
	"aggro": 1,
	"damage_type": "physical",
	"respawn": 200,
	"range": 20,
	"name": "Chicken",
	"armor": 0,
	"resistance": 0,
	"id": "33943818",
	"move_num": 217253437,
	"cid": 1,
	"s": {},
	"last_ms": "2020-10-03T17:39:15.889Z",
	"walking": 552,
	"fx": {},
	"emblems": {},
	"c": {},
	"real_alpha": 1,
	"real_x": -47.56764523078941,
	"real_y": -291.769519765363,
	"vx": -6.913811151715458,
	"vy": -1.0950863469242362,
	"level": 1,
	"base": {
		"h": 12,
		"v": 5,
		"vn": 2
	},
	"drawn": true,
	"resync": false,
	"engaged_move": 217253437,
	"moving": true,
	"abs": false,
	"from_x": -38.10955157524272,
	"from_y": -290.2714416427711,
	"going_x": -100.3070322479565,
	"going_y": -300.1229707637065,
	"ref_speed": 7,
	"angle": -170.99962620319567,
	"a_direction": 1,
	"direction": 1,
	"ms_walk": "2020-10-03T17:39:15.605Z"
},
{
	"x": 0,
	"y": -1184,
	"width": 61,
	"height": 55,
	"alpha": 1,
	"visible": true,
	"cskin": "12",
	"i": 1,
	"j": 2,
	"skin": "phoenix",
	"stype": "full",
	"updates": 295,
	"type": "monster",
	"mtype": "phoenix",
	"in": "cave",
	"map": "cave",
	"hp": 122745,
	"max_hp": 160000,
	"mp": 800,
	"max_mp": 800,
	"speed": 65,
	"xp": 180000,
	"attack": 125,
	"frequency": 1.2,
	"rage": 0,
	"aggro": 0.2,
	"damage_type": "magical",
	"respawn": 32,
	"range": 120,
	"name": "Phoenix",
	"cooperative": true,
	"armor": 0,
	"resistance": 0,
	"id": "33947186",
	"move_num": 217266907,
	"cid": 98,
	"target": "SamWamTanker",
	"s": {},
	"last_ms": "2020-10-03T17:42:43.356Z",
	"walking": 21,
	"fx": {
		"aaa": null,
		"attack": [
			"2020-10-03T17:42:42.826Z",
			0
		]
	},
	"emblems": {},
	"c": {},
	"real_alpha": 1,
	"real_x": 0,
	"real_y": -1184,
	"vx": 0,
	"vy": 0,
	"level": 1,
	"hit": "explode_a",
	"base": {
		"h": 12,
		"v": 9.9,
		"vn": 2
	},
	"drawn": true,
	"resync": false,
	"engaged_move": 217266907,
	"angle": 22.22872333404978,
	"a_direction": 2,
	"direction": 2,
	"moving": false,
	"abs": true,
	"ms_walk": "2020-10-03T17:42:43.338Z",
	"hp_width": 35,
	"hp_color": 11609895,
	"a_angle": 22.22872333404978
}
*/
