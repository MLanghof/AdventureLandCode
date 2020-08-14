//Clean out an pre-existing listeners
if (parent.prev_handler) 
{
    for (let [event, handler] of parent.prev_handler) 
    {
        parent.socket.removeListener(event, handler);
    }
}

if (character.prev_handler) 
{
    for (let [event, handler] of character.prev_handler) 
    {
        character.socket.removeListener(event, handler);
    }
}

parent.prev_handler = [];
character.prev_handler = [];

//handler pattern shamelessly stolen from JourneyOver
function register_handler(event, handler) 
{
    parent.prev_handler.push([event, handler]);
    parent.socket.on(event, handler);
}
function register_characterhandler(event, handler) 
{
    character.prev_handler.push([event, handler]);
    character.on(event, handler);
}

function upgradeHandler(event)
{
    let result;
    if (event.p.failure)
        result = "Failure"
    else if (event.p.success)
        result = "Success"
    else
        return; // Still waiting for result.

    let output = "[Upgrade] +" + event.p.level + " " + G.items[event.p.name].name + " with " + event.p.scroll + " - " + result +": " + event.p.nums[3]+event.p.nums[2]+"."+event.p.nums[1]+event.p.nums[0] + "% vs. "+ event.p.chance*100 + "%"
    flog(output);
}

register_handler("q_data", upgradeHandler);

function on_cm(name, data)
{
    // Taken from safe_log
    /*if (is_object(data)) data = JSON.stringify(data);
    let safeMessage = html_escape(data);
    if (safeMessage.length > 100)
        safeMessage = safeMessage.substr(0, 100) + "...";*/
    if (is_object(data)) data = JSON.stringify(data);
    safeMessage = data;
    flog("[CM] Received CM from " + name + ": " + safeMessage);
    game_log("Received CM from " + name + ": " + safeMessage);
}

character.on("level_up", function (data) {
    flog("[LevelUp] Reached level " + data.level + "!");
});

character.on("buy", function (data) {
    flog("[Purchase] Bought " + data.q + " " + data.name + " for " + data.cost + " gold.");
});

character.on("sbuy", function (data) {
    flog("[Purchase] Bought " + data.q + " " + data.name + " for " + data.cost + " gold from Ponty.");
});

game.on("trade", function (data) {
    flog("[Trade] " + data.buyer + " bought " + (data.num || 1) + " " + data.item.name + " from " + data.seller);
});

game.on("gold", function (data) {
    flog("[Gold] " + data.receiver + " received " + data.gold + " gold from " + data.sender);
});

character.on("item", function (data) {
    flog("[Purchase] Bought " + data.q + " " + data.name + " for " + data.cost + " gold.");
});

character.on("death", function (data) {
    flog("[Death] ### Died at " + get_x(character) + ", " + get_y(character) + " in " + character.map + "(" + character.in + ")! ###");
    setTimeout(function () {
        flog("Respawning...");
        respawn();
    }, 15000);
});

game.on("event", function (data) {
    flog("[Event] New event in " + data.map + ": " + event.name);
});

game.on("shutdown", function (data) {
    flog("[Shutdown] Server shutting down in " + data.seconds + " seconds!");
});

