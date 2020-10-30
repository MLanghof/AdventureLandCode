// Town areas and where to find them.

let towns = [
    {
        in: "main",
        map: "main",
        min_x: -600,
        max_x: 360,
        min_y: -909,
        max_y: 530
    },
    {
        in: "halloween",
        map: "halloween",
        min_x: -112,
        max_x: 459,
        min_y: -273,
        max_y: 50
    }
];


function in_town(entity) {
    for (town of towns) {
        if (entity.in !== town.in)
            continue;
        if (entity.map !== town.map)
            continue;
        if (entity.x < town.min_x)
            continue;
        if (entity.x > town.max_x)
            continue;
        if (entity.y < town.min_y)
            continue;
        if (entity.y > town.max_y)
            continue;
        return true;
    }
    return false;
}


// character.c.town is just unreliable (tends to be cleared too early)
const TOWN_END_MARGIN_MS = 500;
const TOWN_END_HELPER_INTERVAL = 200;

let townEnd = null;

setInterval(function () {
    if (character.c.town && character.c.town.ms < 1.5 * TOWN_END_HELPER_INTERVAL)
        townEnd = new Date(new Date().getTime() + character.c.town.ms + TOWN_END_MARGIN_MS);
}, TOWN_END_HELPER_INTERVAL);

function wasIRecentlyTowning() {
    if (!townEnd)
        return false;
    if (new Date() < townEnd)
        return true;
    // townEnd is in the past.
    townEnd = null;
    return false;
}

function isTransportingFixed(entity) {
    if (is_transporting(entity))
        return true;
    if (entity.me && wasIRecentlyTowning())
        return true;
    return false;
}
