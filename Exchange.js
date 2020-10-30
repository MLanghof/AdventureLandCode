
const NPC_RANGE = 400;


// Quests

let QUEST_EXCHANGE_WHITELIST = [
  "seashell",
  "leather",
];

function exchangeQuestItems()
{
  if (character.q.exchange)
    return;

  for (let questItemName of QUEST_EXCHANGE_WHITELIST)
  {
    let quest = G.quests[questItemName];
    // Handles wrong map etc.
    if (simple_distance(character, quest) > NPC_RANGE)
      continue;

    let itemSlot = locate_item(questItemName);
    if (itemSlot < 0)
      continue;

    let exchangeAmount = G.items[questItemName].e;
    let haveAmount = character.items[itemSlot].q;
    if (haveAmount < exchangeAmount)
      continue;

    if (haveEmptySlot() || haveAmount == exchangeAmount) {
      flog("Handing in " + exchangeAmount + " " + questItemName);
      return exchange(itemSlot);
    }
  }
}


// TODO: Boxes?


let XYN = find_npc("exchange");

let XYN_EXCHANGE_WHITELIST = [
  "gem0",
  "candy0",
  "candy1",
];

function exchangeWithXyn()
{
  if (character.q.exchange)
    return;

  if (!haveEmptySlot())
    return;

  if (simple_distance(character, XYN) > NPC_RANGE)
    return;

  for (let itemId of XYN_EXCHANGE_WHITELIST)
  {
    let itemSlot = locate_item(itemId);
    if (itemSlot < 0)
      continue;

    flog("[Exchange] Handing in " + itemId);
    exchange(itemSlot);
    return;
  }
}


setInterval(function() {
  exchangeQuestItems();

  exchangeWithXyn();
}, 500);
