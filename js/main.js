import { initPlayer } from "./player.js";
import { initUI, updateUI } from "./ui.js";
import { getStocks, updateMarket } from "./stockMarket.js";
import { getDailyIncome } from "./jobSystem.js";
import { saveGame, loadGame } from "./firestore.js";
import { selectedStock as uiSelectedStock } from "./ui.js"; // ensure global sync

let gameState = {
  day: 1,
  player: null,
  stocks: []
};

async function startGame() {
  gameState.player = await initPlayer();
  gameState.stocks = getStocks();

  // Generate 30 days of random history for each stock
  const history = [];
  for (let day = 1; day <= 30; day++) {
    const entry = { day };
    gameState.stocks.forEach(stock => {
      // start price base around stock initial price
      let lastPrice = history.length > 0 ? history[history.length-1][stock.symbol] : stock.price;
      let volatility = 0.05 + Math.random() * 0.07;
      let direction = (Math.random() - 0.5) * 2; // -1 to 1
      let change = lastPrice * volatility * direction;
      entry[stock.symbol] = Math.max(1, Math.round(lastPrice + change));
    });
    history.push(entry);
  }
  gameState.stockHistory = history;

  // Select a random stock to highlight and show
  const symbols = gameState.stocks.map(s => s.symbol);
  window.selectedStock = symbols[Math.floor(Math.random() * symbols.length)];

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

const historyEntry = { day: gameState.day };
gameState.stocks.forEach(stock => {
  historyEntry[stock.symbol] = stock.price;
});

gameState.stockHistory.push(historyEntry);
if (gameState.stockHistory.length > 30) gameState.stockHistory.shift();



  // Save and update
  await saveGame(gameState);
  updateUI(gameState);
}


startGame();
