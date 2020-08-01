
let scrolls_to_have = [
    {
        id: "scroll0",
        min_q: 70,
        restock: 50
    }
];

function checkScrolls() {
    for (target of scrolls_to_have)
    {
        let item = locate_item(target.id);
        if (!item)
            buy(target.id, target.min_q + target.restock);
        if (item.q < target.min_q)
            buy(target.id, target.restock);
    }
};



let item_upgrade_whitelist = [
    {
        id: "bow",
        target_level: 8
    },
    {
        id: "bow",
        target_level: 8
    },
];

// Upgrade something if possible.
setInterval(function(){
    return;
    if(character.q.upgrade) return;
    for (recipe of item_upgrade_whitelist)
    {
        for(var i=0;i<character.items.length;i++)
        {
            if(character.items[i] && character.items[i].name==name) return i;
        }
        return -1;
    }
    item_to_upgrade = "bow";
    upgrade(locate_item("coat"),locate_item("scroll0")).then(function(data){
        if(data.success) game_log("I have a +"+data.level+" coat now!");
        else game_log("Rip coat, you'll be missed.");
    });

    upgrade(locate_item("shoes"),locate_item("scroll0")).then(
        function(data){
            game_log("Upgrade call completed");
        },
        function(data){
            game_log("Upgrade call failed with reason: "+data.reason);
        }
    );
}, 500);

