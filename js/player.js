import { loadGame } from "./firestore.js";

export async function initPlayer() {
  const data = await loadGame();

  // ✅ If saved game exists, return it fully
  if (data && data.player) {
    return data.player;
  }

  // ✅ New player
  return {
    name: "You",
    cash: 500,
    job: "Unemployed",
    income: 20,
    housing: "Car",
    reputation: 0,
    clients: 0,
    loan: {
  balance: 0,
  dailyInterest: 0
},

    licenses: [],
    mood: 70,
    actionsLeft: 3,
    portfolio: {},
    personal: {
      diet: "Budget Diet",
      insurance: "None",
      gym: "None",
      hobby: "None",
      health: 70
    },
    clientsData: []
  };
}
