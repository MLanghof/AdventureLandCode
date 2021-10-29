



function targetForbiddenForCleave(entity)
{
	let entityWhitelist = ["crab", "goo", "bee", "squig", "squigtoad", "snake", "osnake", "arcticbee", "bat", "phoenix"];
	if (entityWhitelist.indexOf(entity.mtype) == -1)
		return true;
	if (entity.level > 8 && entity.attack > 50)
		return true;
	return false;
}


function couldCleave()
{
	return character.name == "MKWa" && character.slots.mainhand.name == "bataxe" && !isPvP();
}


let cleaveTargetCount = 0;
let cleaveTargetPos = null;

function cleaveLogic()
{
	if (!couldCleave())
		return;

	clear_drawings();
	let msUntilNextAttack = ms_until(parent.next_skill["attack"]);
	if (msUntilNextAttack < 0) msUntilNextAttack = 0;
	let msUntilSufficientMana = 0;
	if (character.mp < G.skills.cleave.mp)
		msUntilSufficientMana = ms_until(parent.next_skill["use_mp"]);
	if (character.mp + G.items.mpot1.gives[0][1] < G.skills.cleave.mp)
		msUntilSufficientMana += G.skills.use_mp.cooldown;

	let msUntilNextCleave = max(msUntilNextAttack, msUntilSufficientMana);

	let cleaveRadius = G.skills.cleave.range - 10;
	let adjustmentRadius = msUntilNextCleave * character.speed / 1000;
	let reachableRadius = cleaveRadius + adjustmentRadius;
	let unavoidableRadius = cleaveRadius - adjustmentRadius;

	// Predict monster positions.
	let futureMonsters = getMonstersWhere(() => true).map((m) => future(m, msUntilNextCleave));
	if (futureMonsters.length == 0)
		return;

	// Keep only those that can be reached by the next cleave time.
	let reachableMonsters = futureMonsters.filter((m) => simple_distance(character, m) < reachableRadius);

	// Check whether there are forbidden cleave targets that we cannot avoid in time.
	let unavoidableMonsters = reachableMonsters.filter((m) => simple_distance(character, m) < unavoidableRadius);
	if (unavoidableMonsters.filter(targetForbiddenForCleave).length > 0)
		return;

	// Sample some reachable circles.
	let best_dx = 0;
	let best_dy = 0;
	let best_count = 0;
	let dd = max(8, adjustmentRadius / 10);
	let di = Math.floor(adjustmentRadius/dd) + 1;
	for (let dyi = -di; dyi <= di; dyi += 1)
		for (let dxi = -di; dxi <= di; dxi += 1)
		{
			let dx = dxi * dd;
			let dy = dyi * dd;
			let malus = 0;
			if (dx * dx + dy * dy > adjustmentRadius * adjustmentRadius)
				if (dx * dx + dy * dy > (adjustmentRadius + 25) * (adjustmentRadius + 25))
					continue;
				else
					malus = 1.5; // Need to kill at least 2 extra monsters to make a delay worth it.

			let pos = { x: character.real_x + dx, y: character.real_y + dy };
			let cleaveTargets = reachableMonsters.filter((m) => simple_distance(m, pos) < cleaveRadius);
			let count = cleaveTargets.length - malus;
			// Something forbidden in range -> don't cleave!
			if (cleaveTargets.filter(targetForbiddenForCleave).length > 0)
				continue;
			//draw_circle(pos.x, pos.y, cleaveRadius, count / 4, 0xF33E00);
			if (count > best_count)
			{
				best_dx = dx;
				best_dy = dy;
				best_count = count;
			}
		}

	cleaveTargetPos = { x: character.real_x + best_dx, y: character.real_y + best_dy };
	cleaveTargetCount = best_count;

	draw_circle(cleaveTargetPos.x, cleaveTargetPos.y, cleaveRadius, best_count / 4, 0xF33E00);
	draw_circle(cleaveTargetPos.x, cleaveTargetPos.y, 4, 1, 0xF33E00);
	draw_circle(character.real_x, character.real_y, reachableRadius, 1, 0x3E00F3);
	draw_text("M: " + best_count, cleaveTargetPos.x, cleaveTargetPos.y + 20);

}









/*
To consider:
  - distance vs character range vs dps
  - level/xp/hp
  - hp cost (and death)
  - ...?
  */
