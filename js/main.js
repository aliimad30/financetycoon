import { initPlayer } from "./player.js";
import { initUI, updateUI, selectedStock as uiSelectedStock } from "./ui.js";
import { getStocks, updateMarket } from "./stockMarket.js";
import { getDailyIncome } from "./jobSystem.js";
import { saveGame } from "./firestore.js";

let gameState = {
  day: 1,
  player: null,
  stocks: []
};

async function startGame() {
  gameState.player = await initPlayer();
  gameState.stocks = getStocks();

  // Generate 30 days of fake data
  const history = [];
  for (let day = 1; day <= 30; day++) {
    const entry = { day };
    gameState.stocks.forEach(stock => {
      let lastPrice = history.length > 0 ? history[history.length-1][stock.symbol] : stock.price;
      let volatility = 0.05 + Math.random() * 0.07;
      let direction = (Math.random() - 0.5) * 2;
      let change = lastPrice * volatility * direction;
      entry[stock.symbol] = Math.max(1, Math.round(lastPrice + change));
    });
    history.push(entry);
  }
  gameState.stockHistory = history;

  // Select a random stock first
  const symbols = gameState.stocks.map(s => s.symbol);
  const defaultStock = symbols[Math.floor(Math.random() * symbols.length)];

  // ✅ Set the shared object reference
  uiSelectedStock.value = defaultStock;

  initUI(gameState);
  updateUI(gameState);
}

export async function nextDay() {
  gameState.day += 1;

  gameState.player.cash += getDailyIncome(gameState.player);
  updateMarket(gameState.stocks);

  if (!gameState.stockHistory) gameState.stockHistory = [];

  const historyEntry = { day: gameState.day };
  gameState.stocks.forEach(stock => {
    historyEntry[stock.symbol] = stock.price;
  });

  gameState.stockHistory.push(historyEntry);
  if (gameState.stockHistory.length > 30) gameState.stockHistory.shift();

  await saveGame(gameState);
  updateUI(gameState);
}

startGame();
