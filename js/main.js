import { initPlayer } from "./player.js";
import { initUI, updateUI, selectedStock as uiSelectedStock } from "./ui.js";
import { getStocks, updateMarket } from "./stockMarket.js";
import { getDailyIncome } from "./jobSystem.js";
import { saveGame, loadGame } from "./firestore.js";
import { applyDailyPersonalEffects } from "./personalSystem.js";
import { applyDailyLoanInterest } from "./loanSystem.js";
import { updateClientsDaily } from "./clientSystem.js";

let gameState = {
  day: 1,
  player: null,
  stocks: [],
  stockHistory: []
};

async function startGame() {
  const savedGame = await loadGame();

  // Get a default player structure for merging
  const defaultPlayer = await initPlayer();

  if (savedGame && savedGame.player) {
    // Merge default properties with saved player to avoid undefined fields
    gameState = {
      day: savedGame.day || 1,
      player: {
        ...defaultPlayer,
        ...savedGame.player,
        personal: {
          ...defaultPlayer.personal,
          ...(savedGame.player.personal || {})
        },
        loan: {
          balance: savedGame.player.loan?.balance ?? 0,
          dailyInterest: savedGame.player.loan?.dailyInterest ?? 0
        }
      },
      stocks: savedGame.stocks || getStocks(),
      stockHistory: savedGame.stockHistory || []
    };

    // ✅ Auto-generate stock history if missing or empty
    if (!gameState.stockHistory || gameState.stockHistory.length === 0) {
      gameState.stockHistory = [];
      for (let day = 1; day <= 30; day++) {
        const entry = { day };
        gameState.stocks.forEach(stock => {
          let lastPrice = gameState.stockHistory.length > 0
            ? gameState.stockHistory[gameState.stockHistory.length - 1][stock.symbol]
            : stock.price;
          let volatility = 0.05 + Math.random() * 0.07;
          let direction = (Math.random() - 0.5) * 2;
          let change = lastPrice * volatility * direction;
          entry[stock.symbol] = Math.max(1, Math.round(lastPrice + change));
        });
        gameState.stockHistory.push(entry);
      }
    }

  } else {
    // ✅ New game
    gameState.player = defaultPlayer;
    gameState.stocks = getStocks();
    gameState.day = 1;
    gameState.stockHistory = [];

    // Generate 30 days of fake data
    for (let day = 1; day <= 30; day++) {
      const entry = { day };
      gameState.stocks.forEach(stock => {
        let lastPrice = gameState.stockHistory.length > 0
          ? gameState.stockHistory[gameState.stockHistory.length - 1][stock.symbol]
          : stock.price;
        let volatility = 0.05 + Math.random() * 0.07;
        let direction = (Math.random() - 0.5) * 2;
        let change = lastPrice * volatility * direction;
        entry[stock.symbol] = Math.max(1, Math.round(lastPrice + change));
      });
      gameState.stockHistory.push(entry);
    }
  }

  // Select a random stock first
  const symbols = gameState.stocks.map(s => s.symbol);
  const defaultStock = symbols[Math.floor(Math.random() * symbols.length)];
  uiSelectedStock.value = defaultStock;

  initUI(gameState);
  updateUI(gameState);
}

export async function nextDay() {
  gameState.day += 1;
  gameState.player.actionsLeft = 3;

  // Add daily income
  gameState.player.cash += getDailyIncome(gameState.player);

  // Apply daily loan interest
  applyDailyLoanInterest(gameState.player);

  // Apply lifestyle costs and effects
  applyDailyPersonalEffects(gameState.player);

  // Update clients
  updateClientsDaily(gameState.player);

  // Update stock market
  updateMarket(gameState.stocks);

  // Update stock history
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
