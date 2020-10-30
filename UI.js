

function electronZoom(factor) {
  const {webFrame} = require('electron');
  webFrame.setZoomFactor(factor);
}

map_key("DOWN", "snippet", "electronZoom(0.5)");
map_key("UP", "snippet", "electronZoom(1.0)");


function draw_text(text, x, y) {
    let t = new PIXI.Text(text,{fontFamily : parent.SZ.font, fontSize: 36, fontWeight: "bold", fill : 0x005500, align : 'center'});
    t.x = x;
    t.y = y;
    t.type = "text";
    t.scale = new PIXI.Point(0.5, 0.5);
    t.parentGroup = parent.text_layer;
    t.anchor.set(0.5, 1);
    parent.drawings.push(t);
    parent.map.addChild(t);
}

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