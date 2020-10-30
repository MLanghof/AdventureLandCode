
let scrolls_to_have = [
    {
        id: "scroll0",
        min_q: 30,
        restock: 50
    },
    {
        id: "cscroll0",
        min_q: 20,
        restock: 30
    },
    {
        id: "scroll1",
        min_q: 6,
        restock: 4
    },
    {
        id: "cscroll1",
        min_q: 5,
        restock: 3
    },
];

// Ensure we have enough of all scrolls.
function checkScrolls() {
    if (character.name != "MKMe") {
        game_log("Not buying scrolls for non-merchant!");
        return;
    }

    set_message("Checking scrolls...");
    let promises = [];
    for (target of scrolls_to_have)
    {
        let item_slot = locate_item(target.id);
        let item = character.items[item_slot];
        if (!item)
            promises.push(buy(target.id, target.min_q + target.restock));
        else if (item.q < target.min_q)
            promises.push(buy(target.id, target.restock));
    }
    return Promise.all(promises);
};


function hasTitle(item)
{
    // Yes, this should be a find.
    for (let title in G.titles)
        if (item.p && item.p === title)
            return true;
    return false;
}


let item_upgrade_whitelist = [
    {
        id: "wgloves",
        target_level: 7
    },
    {
        id: "wshoes",
        target_level: 7
    },
    {
        id: "wbreeches",
        target_level: 7
    },
    {
        id: "wattire",
        target_level: 7
    },
    {
        id: "wcap",
        target_level: 7
    },
    {
        id: "stinger",
        target_level: 7
    },
    {
        id: "sshield",
        target_level: 7
    },
    {
        id: "bow",
        target_level: 8
    },
    {
        id: "wand",
        target_level: 8
    },
    {
        id: "quiver",
        target_level: 7
    },
    {
        id: "hbow",
        target_level: 0
    },
    {
        id: "fireblade",
        target_level: 6
    },
    {
        id: "firestaff",
        target_level: 6
    },
    // Comes last so the autobuy allows at least the above upgrades to still work.
    {
        id: "helmet",
        target_level: 8
    },
    {
        id: "coat",
        target_level: 8
    },
];

// Upgrade something if possible.
function doUpgrade()
{
    if (character.q.upgrade)
        return;

    if (!merchInPosition())
        return;

    checkScrolls()
    .then(function () {
        for (recipe of item_upgrade_whitelist)
        {
            let itemIndex = character.items.findIndex(i => i && i.name == recipe.id && i.level < recipe.target_level);
            if (itemIndex < 0)
                continue;
            let item = character.items[itemIndex];
            // To be safe...
            if (hasTitle(item))
                continue;

            let scrollIndex = -1;
            // The item grades in G.items are the highest level at which that item is still that grade.
            if (item.level < G.items[recipe.id].grades[0])
                scrollIndex = locate_item("scroll0");
            else if (item.level < G.items[recipe.id].grades[1])
                scrollIndex = locate_item("scroll1");
            else
                scrollIndex = locate_item("scroll2"); // uh oh...

            //flog("Attempting to upgrade " + item.name + " +" + item.level);
            return parent.upgrade(itemIndex, scrollIndex);
        }

        return "Nothing to upgrade :)";
    })
    //.then(data => data)
    .catch(e => game_log(e));

}

setInterval(doUpgrade, 500);




let item_combine_whitelist = [
    {
        id: "ringsj",
        target_level: 3
    },
    {
        id: "wbook0",
        target_level: 3
    },
    {
        id: "stramulet",
        target_level: 3
    },
    {
        id: "dexamulet",
        target_level: 3
    },
    {
        id: "intamulet",
        target_level: 3
    },
    {
        id: "strring",
        target_level: 2
    },
    {
        id: "dexring",
        target_level: 2
    },
    {
        id: "intring",
        target_level: 2
    },
    {
        id: "vitring",
        target_level: 2
    },
    {
        id: "strearring",
        target_level: 2
    },
    {
        id: "dexearring",
        target_level: 2
    },
    {
        id: "intearring",
        target_level: 2
    },
];

// Combine items if possible.
function doCombine()
{
    if (character.q.compound)
        return;

    if (!merchInPosition())
        return;
        
    checkScrolls()
    .then(function () {
        for (recipe of item_combine_whitelist)
        {
            for (let level = 0; level < recipe.target_level; ++level)
            {
                let matchingIndices = [];
                character.items.forEach(function (item, index) {
                    if (!item)
                        return;
                    if (hasTitle(item))
                        return;
                    if (item.name == recipe.id && item.level == level)
                        matchingIndices.push(index);
                });
                if (matchingIndices.length < 3)
                    continue;
                
                // Found 3 matching items...
                
                let scrollIndex = -1;
                if (level < G.items[recipe.id].grades[0])
                    scrollIndex = locate_item("cscroll0");
                else if (level < G.items[recipe.id].grades[1])
                    scrollIndex = locate_item("cscroll1");
                else
                    scrollIndex = locate_item("cscroll2"); // uh oh...
                    
                //flog("Attempting to combine " + recipe.id + " +" + level); return;
                return parent.compound(matchingIndices[0], matchingIndices[1], matchingIndices[2], scrollIndex);
            }
        }

        return "Nothing to upgrade :)";
    })
    //.then(data => data)
    .catch(e => game_log("Error: " + e));
}

setInterval(doCombine, 500);




function countItemsWhere(f) {
    let count = 0;
    for (let item of character.items)
        if (item && f(item))
            count++;
    return count;
}


// auto-buy helmets
if (false)
setInterval(function () {
    if (!merchInPosition())
        return;
    if (character.gold < 1000000)
        return;
    if (!haveEmptySlot())
        return;

    //if (countItemsWhere(item => item.name === "helmet") < 5)
    //    buy("helmet");
    if (countItemsWhere(item => item.name === "coat") < 3)
        buy("coat");
}, 500);


// From Archalias in Discord
const baseUpgradeChances = [
    99.99,// 0
    97.00,// 1
    95.00,// 2
    70.00,// 3
    60.20,// 4
    40.00,// 5
    25.00,// 6
    15.00,// 7
    7.00,//  8
    2.40,//  9
    14.00,// X
    11.00,// Y
    0.00, // Z (doesn't exist?... or does it)
];
// From Archalias in Discord
const averageUpgradeChances = [
    100.0,
    98.0,
    95.0,
    71.26,
    61.42,
    41.38,
    26.35,
    15.51,
    7.55,
    3.25
];
const upgradeScrollPrices = [
    1000, // scroll0
    40000, // scroll1
    1600000, // scroll2
];
// TODO: Get actual averages, these are base values.
const averageCompoundChances = [
    99.0,
    75.0,
    40.7,
    25.14,
    // ???
];
const compoundScrollPrices = [
    6400, // cscroll0
    240000, // cscroll1
    9200000, // cscroll2
];

function itemGrade(itemId, level)
{
    return G.items[itemId].grades.findIndex(gradeLevel => level < gradeLevel)
}

function calculateUpgradeInvestment(itemId, plus0Price, targetLevel)
{
    let cost = plus0Price;
    let scrollCost = 0;
    let plus0Items = 1;
    for (let currentLevel = 0; currentLevel < targetLevel; ++currentLevel)
    {
        let grade = itemGrade(itemId, currentLevel);
        let chance = averageUpgradeChances[currentLevel] / 100;
        cost += upgradeScrollPrices[grade];
        scrollCost += upgradeScrollPrices[grade];
        cost /= chance;
        scrollCost /= chance;
        plus0Items /= chance;
	}

    show_json({"numberOfPlus0ItemsNeeded": plus0Items, "scrollCost": scrollCost, "totalCost": cost});
}

function calculateCompoundInvestment(itemId, plus0Price, targetLevel)
{
    let cost = plus0Price;
    let scrollCost = 0;
    let plus0Items = 1;
    for (let currentLevel = 0; currentLevel < targetLevel; ++currentLevel)
    {
        let grade = itemGrade(itemId, currentLevel);
        let chance = averageCompoundChances[currentLevel] / 100;
        cost = (3 * cost + compoundScrollPrices[grade]) / chance;
        scrollCost = (3 * scrollCost + compoundScrollPrices[grade]) / chance;
        plus0Items = (3 * plus0Items) / chance;
	}

    show_json({"numberOfPlus0ItemsNeeded": plus0Items, "scrollCost": scrollCost, "totalCost": cost});
}

function calculateInvestment(itemId, plus0Price, targetLevel)
{
    if (G.items[itemId].upgrade)
        calculateUpgradeInvestment(itemId, plus0Price, targetLevel);
    else if (G.items[itemId].compound)
        calculateCompoundInvestment(itemId, plus0Price, targetLevel);
    else
        show_json("Can't tell whether this is upgraded or compounded...");
}