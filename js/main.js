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
  // Load or create player
  gameState.player = await initPlayer();

  // Load stock data (can be random or simulated)
  gameState.stocks = getStocks();

  // Render initial UI
  initUI(gameState);

  // Update display
  updateUI(gameState);
}

export async function nextDay() {
  gameState.day += 1;

  // Simulate job income
  gameState.player.cash += getDailyIncome(gameState.player);

  // Simulate market
  updateMarket(gameState.stocks);

  // Save progress
  await saveGame(gameState);

  // Update display
  updateUI(gameState);
}

startGame();
