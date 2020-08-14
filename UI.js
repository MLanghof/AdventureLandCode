
function bleargh() {
    var b = "";
    b += "<div style='background-color: black; border: 5px solid gray; padding: 14px; font-size: 24px; display: inline-block; max-width: 640px'>";
    b += "<div style='padding: 10px; color: #CC863B; text-align: center'>Work in Progress</div>";
    "ranger rogue warrior mage priest paladin merchant".split(" ").forEach(function (a) {
        b += "<div>" + a.toTitleCase() + "</div>";
        parent.object_sort(G.skills).forEach(function (c) {
            let ident = c[0];
            c = c[1];
            c["class"] && c["class"].includes(a) && (b += parent.item_container({
                skin: c.skin,
                onclick: bloop_test(ident)
            }))
        })
    });
    b += "<div>Item Skills</div>";
    parent.object_sort(G.skills).forEach(function (a) {
        let ident = a[0];
        a = a[1];
        a.slot && (b += parent.item_container({
            skin: a.skin,
            onclick: bloop_test(ident)
        }))
    });
    b += "<div>Abilities and Utilities</div>";
    parent.object_sort(G.skills).forEach(function (a) {
        let ident = a[0];
        a = a[1];
        if ("ability" == a.type || "utility" == a.type) b += parent.item_container({
            skin: a.skin,
            onclick: bloop_test(ident)
        })
    });
    b += "</div>";
    parent.show_modal(b, {
        wrap: !1,
        hideinbackground: !0,
        url: "/docs/guide/all/skills_and_conditions"
    })
}

function bloop_test(skill) {
    return "show_modal('<div id=\\'al_skill_preview\\' style=\\'width: 480px\\'></div>', {wrap: !1,hideinbackground: !0,});render_skill('#al_skill_preview', '" + skill + "');"
}