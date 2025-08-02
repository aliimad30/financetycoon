import { initPlayer } from "./player.js";
import { initUI, updateUI } from "./ui.js";
import { getStocks, updateMarket } from "./stockMarket.js";
import { getDailyIncome } from "./jobSystem.js";
import { saveGame, loadGame } from "./firestore.js";

let gameState = {
  day: 1,
  player: null,
  stocks: []
};

async function startGame() {
  gameState.player = await initPlayer();
  gameState.stocks = getStocks();
  gameState.stockHistory = [{
    day: gameState.day,
    price: gameState.stocks[0].price
  }];
  initUI(gameState);
  updateUI(gameState);
}


export async function nextDay() {
  gameState.day += 1;

  // Job income
  gameState.player.cash += getDailyIncome(gameState.player);

  // Market simulation
  updateMarket(gameState.stocks);

  // Stock history tracking (for chart)
  if (!gameState.stockHistory) gameState.stockHistory = [];

  const aapl = gameState.stocks.find(s => s.symbol === "AAPL");
  if (aapl) {
    gameState.stockHistory.push({ day: gameState.day, price: aapl.price });

    if (gameState.stockHistory.length > 30) gameState.stockHistory.shift();
  }

  // Save and update
  await saveGame(gameState);
  updateUI(gameState);
}


startGame();
