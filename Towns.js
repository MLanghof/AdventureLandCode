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
