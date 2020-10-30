

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


function floating_text(text, pos, args) {
    function f(counter, graphic) {
        return function() {
            var c = mssince(graphic.last_fade)
              , d = round(4 * c / graphic.anim_time);
            2 < d && 7 > d && (d = 4);
            graphic.y -= graphic.disp_m * d;
            graphic.alpha = max(0, graphic.alpha - .078 * c / graphic.anim_time);
            graphic.last_fade = new Date;
            if (.25 < graphic.alpha)
                draw_timeout(f(counter + 1, graphic), graphic.anim_time);
            else {
                remove_sprite(graphic);
                try {
                    graphic.destroy({
                        texture: !0,
                        baseTexture: !0
                    })
                } catch (q) {
                    console.log(q)
                }
            }
        }
    }
    var g = null;
    if (!(parent.mode.dom_tests_pixi || parent.no_graphics || parent.paused)) {
        is_object(pos) && (g = pos,
        b = get_x(pos),
        c = get_y(pos),
        2 == g.mscale && (c += 14));
        args || (args = {});
        var color = args.color || "#4C4C4C";
        g = null;
        colors[color] && (color = colors[color]);
        var m = SZ[args.size] || args.size || SZ.normal
          , p = args.parent || window.map;
        a = new PIXI.Text(text,{
            fontFamily: SZ.font,
            fontSize: m * text_quality,
            fontWeight: "bold",
            fill: color,
            align: "center"
        });
        use_layers ? a.parentGroup = text_layer : a.displayGroup = text_layer;
        a.disp_m = SZ.normal / 18;
        m > SZ.normal && (a.disp_m = (SZ.normal + 1) / 18);
        a.anim_time = max(75, parseInt(1800 / m));
        a.type = "text";
        a.alpha = 1;
        a.last_fade = new Date;
        a.anchor.set(.5, 1);
        1 < text_quality && (a.scale = new PIXI.Point(1 / text_quality,1 / text_quality));
        a.x = round(b);
        a.y = round(c) + 0;
        args.y && (a.y -= args.y);
        p.addChild(a);
        draw_timeout(f(0, a), a.anim_time);
        args.s && sfx(args.s, a.x, a.y)
    }
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