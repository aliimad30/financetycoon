import { loadGame } from "./firestore.js";

export async function initPlayer() {
  const data = await loadGame();
  if (data && data.player) {
    if (!data.player.portfolio) data.player.portfolio = {};
    if (!data.player.clientsData) {
      const { getClientList } = await import("./clientSystem.js");
      data.player.clientsData = getClientList({}); // uses default template
    }
    return data.player;
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
