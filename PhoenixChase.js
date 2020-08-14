// Little script for hunting The Phoenix.
// Remove flog calls (or replace with your own logging system) if you want to use this!


const ENABLE_PHOENIX_CHASE = true;

// This is available in G too, but only in ugly array format. TODO: Do the conversion here automatically.
const PHOENIX_SPAWNS = [
    {
        map: "main",
        minx: 708,
        miny: -300,
        maxx: 1668,
        maxy: -86
    },
    {
        map: "main",
        minx: 378,
        miny: 1686,
        maxx: 904,
        maxy: 1920
    },
    // Put a main world spawn to check between halloween and cave so that there's never more than one door to traverse.
    {
        map: "cave",
        minx: -375,
        miny: -1287,
        maxx: 14,
        maxy: -1041
    },
    {
        map: "main",
        minx: -1358,
        miny: -118,
        maxx: -1010,
        maxy: 1680
    },
    // Put halloween before the spider spawn since we might find the phoenix right when we exit from halloween.
    {
        map: "halloween",
        minx: -166,
        miny: 453,
        maxx: 182,
        maxy: 808
    },
];

const PHOENIX_RESPAWN_TIME = G.monsters.phoenix.respawn + 0.5 /*safety margin*/;


let currentSpawn = -1;

let phoenixWasAlive_stored = false;

let nextPhoenixSpawn = null;

let phoenixStatus = "???";

let smart_moving = false;


// If The Phoenix is nearby, return its entity.
function getNearbyPhoenix()
{
    for (let id in parent.entities) {
        let e = parent.entities[id];
        if (e && e.type == "monster" && e.mtype == "phoenix")
            return e;
        // No range check - spawns are assumed to be far enough apart.
	}
    return null;
}


// Calculates the center of the given spawn.
function spawnCenter(spawn)
{
    return [(spawn.minx + spawn.maxx) / 2, (spawn.miny + spawn.maxy) / 2];
}


// Returns the index of the nearest phoenix spawn.
function getClosestSpawnIndex()
{
    let minDist = 99999999;
    let ret = -1;
    for (spawnId in PHOENIX_SPAWNS)
    {
        let spawn = PHOENIX_SPAWNS[spawnId];
        if (character.map != spawn.map)
            continue;
        let dist = simple_distance(character, {x: spawnCenter(spawn)[0], y: spawnCenter(spawn)[1]});
        if (dist < minDist) {
            minDist = dist;
            ret = spawnId;
        }
    }
    return parseInt(ret);
}


// Whether using blink is an option. Duh.
function canBlink()
{
    return (!parent.next_skill["blink"] || parent.next_skill["blink"] < new Date()) && character.mp >= G.skills.blink.mp;
}


// Embarks on a smart_move journey, but only guards against further actions for some time.
function smart_move_limited(args)
{
    if (smart_moving)
        return;
    smart_move(args);
    smart_moving = true;
    setTimeout(function() {
        smart_moving = false;
        stop("smart");
    }, 9000);
}

// Makes whatever progress can be made in reaching the given spawn.
function moveToSpawn(spawnNum)
{
    let spawn = PHOENIX_SPAWNS[spawnNum];
    targetX = (spawn.minx + spawn.maxx) / 2;
    targetY = (spawn.miny + spawn.maxy) / 2;

    if (character.map != spawn.map)
    {
        // Thanks nerd aka welcome aka digestive stones!
        let door = G.maps[character.map].doors.find(d => d[4] == spawn.map);
        if (!door) {
            game_log("Can't find the exit to " + spawn.map + " from " + character.map + " !");
            smart_move_limited({x: targetX, y: targetY, map: spawn.map});
            return; // Character in completely different map?
		}
        // Thanks super aka *S!
        let spawnPos = parent.G.maps[character.map].spawns[door[6]];
            
        if (simple_distance(character, {x: spawnPos[0], y: spawnPos[1]}) < 100) {
            smart_moving = false;
            stop("smart");
            transport(spawn.map, door[5]);
            return;
        }
        
        // Within walking distance?
        if (simple_distance(character, {x: spawnPos[0], y: spawnPos[1]}) < 700) {
            smart_move_limited({x: spawnPos[0], y: spawnPos[1]});
            return;
	    }

        // Conserve mana when escaping cave
        if (character.map == "cave")
            use_skill("town");
        else if (canBlink()) {
            //game_log("Blinking onto door " + door);
            parent.use_skill("blink", spawnPos)/*.then(() => transport(spawn.map, door[5]))*/; // Promise is never resolved atm, bug?
        }
        return;
	}
    
    // Are we there yet? ... *pop*
    if (simple_distance(character, {x: targetX, y: targetY}) < 300) {
        // Yes!
        smart_moving = false;
        stop("smart");
        currentSpawn = spawnNum;
        return;
	}
    
    // Within walking distance?
    if (simple_distance(character, {x: targetX, y: targetY}) < 700) {
        smart_move_limited({x: targetX, y: targetY, map: spawn.map});
        return;
	}

    // Map is correct but we're still far away. Try to blink.
    if (canBlink()) {
        //game_log("Blinking into spawn " + spawnNum);
        use_skill("blink", [targetX, targetY]);
        return;
    }
}


if (ENABLE_PHOENIX_CHASE && character.name == "MauranKilom") // One day I'll have a UI for this stuff...
{
setInterval(function() {

    let phoenix = getNearbyPhoenix();
    
    if (!phoenix && currentSpawn == -1) {
        phoenixStatus = "Initializing";
        currentSpawn = getClosestSpawnIndex();
        if (currentSpawn == -1)
            moveToSpawn(0);
        return;
    }

    let phoenixIsAlive = !!phoenix && !phoenix.dead;
    let phoenixWasAlive = phoenixWasAlive_stored;
    phoenixWasAlive_stored = phoenixIsAlive;

    //game_log("phoenixWasAlive: " + phoenixWasAlive + ", phoenixIsAlive: " + phoenixIsAlive);

    if (phoenixIsAlive) {
        currentSpawn = getClosestSpawnIndex();

        if (!phoenixWasAlive) {
            flog("[Phoenix] Found phoenix at spawn " + currentSpawn);
            game_log("Found phoenix at spawn " + currentSpawn);
        }

        // Stop any ongoing town or smart_move.
        smart_moving = false;
        stop("smart");
        stop("town");

        // Let attack script handle the rest.
        change_target(phoenix);
        phoenixStatus = "Engaging";
        
        return;
    }
    
    //game_log("Phoenix is not alive");

    if (phoenixWasAlive && !phoenixIsAlive){
        flog("[Phoenix] Phoenix gone or dead");
        nextPhoenixSpawn = new Date(new Date().getTime() + PHOENIX_RESPAWN_TIME * 1000);
    }
    
    //game_log("Checking whether phoenix might have respawned");

    if (nextPhoenixSpawn && new Date() < nextPhoenixSpawn) {
        // Dick around wherever we are.
        phoenixStatus = "Idling " + to_pretty_num((nextPhoenixSpawn - new Date()) / 1000);
        //game_log("Next phoenix spawn in " + (nextPhoenixSpawn - new Date()) + " ms");
        return;
	}

    // Ok, at this point there is no phoenix nearby even though it should have respawned by now. Check the next spawn.
    
    let nextSpawn = (currentSpawn + 1) % PHOENIX_SPAWNS.length;
    phoenixStatus = "Searching " + nextSpawn;
    moveToSpawn(nextSpawn);

}, 500);


// Could be displayed wherever you want - using set_message here.
setInterval(function() { set_message(phoenixStatus); }, 10);
}