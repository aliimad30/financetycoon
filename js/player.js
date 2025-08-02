import { loadGame } from "./firestore.js";

export async function initPlayer() {
  const data = await loadGame();
if (data && data.player && data.player.portfolio) {
  for (const [symbol, val] of Object.entries(data.player.portfolio)) {
    if (typeof val === "number") {
      data.player.portfolio[symbol] = { quantity: val, totalCost: val * 0 };
    }
  }
}


  // New player
  return {
    name: "You",
    cash: 500,
    job: "Unemployed",
    income: 20,
    housing: "Car",
    reputation: 0,
    clients: 0,
    licenses: [],
    mood: 70,
    portfolio: {},
    clientsData: [] // <-- ensure it exists
  };
}
