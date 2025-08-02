import { nextDay } from "./main.js";
import { buyStock, sellStock } from "./trading.js";
import { saveGame } from "./firestore.js";
import { getAvailableJobs } from "./jobSystem.js";
import { getAvailableHousing, housingOptions } from "./housingSystem.js";
import { 
  getClientList, 
  talkClient, 
  pitchClient, 
  reviewPortfolio as reviewClient, 
  giftClient, 
  discoverClient 
} from "./clientSystem.js";

import { getAvailableLicenses, licenses } from "./licenseSystem.js";
import { renderStockChart } from "./chartSystem.js";


export let selectedStock = { value: null };
let expandedCard = null;
let stateRef;

export function initUI(gameState) {
  stateRef = gameState;

  // Tab switching
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab").forEach(sec => sec.classList.remove("active"));
      document.getElementById(tab).classList.add("active");
    });
  });

  // Default to dashboard
  document.querySelector("[data-tab='dashboard']").click();

  // Dashboard content
  const dash = document.getElementById("dashboard");
  dash.innerHTML = `
    <div id="status"></div>
    <button id="nextDayBtn">Next Day</button>
  `;
  document.getElementById("nextDayBtn").addEventListener("click", () => nextDay());

  updateUI(gameState);
}

export function updateUI(gameState) {
  const { player, stocks, day } = gameState;

  // Status
  document.getElementById("status").innerHTML = `
    <h3>Day ${day}</h3>
    <p><strong>Job:</strong> ${player.job}</p>
    <p><strong>Cash:</strong> $${player.cash.toFixed(2)}</p>
    <p><strong>Housing:</strong> ${player.housing}</p>
    <p><strong>Reputation:</strong> ${player.reputation}</p>
    <p><strong>Clients:</strong> ${player.clients}</p>
    <p><strong>Licenses:</strong> ${player.licenses.join(", ") || "None"}</p>
  `;

  // Stock Market
  updateChart(gameState);
  const stockList = document.getElementById("stockList");
  stockList.innerHTML = "";
  stocks.forEach(stock => {
    let holding = player.portfolio[stock.symbol] || { quantity: 0, totalCost: 0 };
    const qty = holding.quantity;
    const cost = holding.totalCost;
    const value = qty * stock.price;
    const profit = value - cost;
    const avgPrice = qty > 0 ? (cost / qty) : 0;

    stockList.innerHTML += `
      <div class="stock ${selectedStock.value === stock.symbol ? "selected-stock" : ""}" data-symbol="${stock.symbol}">
        <div class="stock-row">
          <span class="symbol">${stock.symbol}</span>
          <span class="price">$${stock.price}</span>
          <span class="owned">Owned: ${qty}</span>
        </div>
        <div class="stock-row small-text">
          Avg: $${avgPrice.toFixed(2)} | Cost: $${cost.toFixed(2)} | Value: $${value.toFixed(2)} 
          <span style="float:right; color:${profit >= 0 ? 'lightgreen' : 'red'};">
            ${profit >= 0 ? '+' : ''}${profit.toFixed(2)}
          </span>
        </div>
        <div class="stock-actions hidden" id="actions-${stock.symbol}">
          <input type="number" min="1" value="1" style="width:50px;" data-qty="${stock.symbol}" />
          <button data-buy="${stock.symbol}">Buy</button>
          <button data-sell="${stock.symbol}">Sell</button>
          <button data-sellall="${stock.symbol}">Sell All</button>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".stock").forEach(card => {
    card.onclick = e => {
      if (["BUTTON", "INPUT"].includes(e.target.tagName)) return;
      const symbol = card.getAttribute("data-symbol");
      selectedStock.value = symbol;
      document.querySelectorAll(".stock").forEach(c => c.classList.remove("selected-stock"));
      card.classList.add("selected-stock");
      document.querySelectorAll(".stock-actions").forEach(div => div.classList.add("hidden"));
      document.getElementById(`actions-${symbol}`).classList.toggle("hidden");
      updateChart(gameState);
    };
  });

  attachTradeListeners(player, stocks, gameState);
  renderJobs(player);
  renderMore(player, gameState);
}

function attachTradeListeners(player, stocks, gameState) {
  document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.onclick = async () => {
      if (!useAction(player)) return;
      const symbol = btn.getAttribute("data-buy");
      const stock = stocks.find(s => s.symbol === symbol);
      const qty = parseInt(document.querySelector(`[data-qty="${symbol}"]`).value) || 1;
      for (let i = 0; i < qty; i++) if (!buyStock(player, symbol, stock.price)) return;
      await saveGame(gameState);
      updateUI(gameState);
    };
  });

  document.querySelectorAll("[data-sell]").forEach(btn => {
    btn.onclick = async () => {
      if (!useAction(player)) return;
      const symbol = btn.getAttribute("data-sell");
      const stock = stocks.find(s => s.symbol === symbol);
      const qty = parseInt(document.querySelector(`[data-qty="${symbol}"]`).value) || 1;
      for (let i = 0; i < qty; i++) if (!sellStock(player, symbol, stock.price)) return;
      await saveGame(gameState);
      updateUI(gameState);
    };
  });

  document.querySelectorAll("[data-sellall]").forEach(btn => {
    btn.onclick = async () => {
      if (!useAction(player)) return;
      const symbol = btn.getAttribute("data-sellall");
      const stock = stocks.find(s => s.symbol === symbol);
      const holding = player.portfolio[symbol];
      if (!holding || holding.quantity <= 0) return;
      player.cash += holding.quantity * stock.price;
      delete player.portfolio[symbol];
      await saveGame(gameState);
      updateUI(gameState);
    };
  });
}

function renderJobs(player) {
  const jobsEl = document.getElementById("jobs");
  const jobs = getAvailableJobs(player);
  jobsEl.innerHTML = `<h3>Available Jobs</h3>`;
  if (jobs.length === 0) {
    jobsEl.innerHTML += `<p>No jobs available yet. Build your reputation!</p>`;
  } else {
    jobs.forEach(job => {
      jobsEl.innerHTML += `
        <div class="job">
          <strong>${job.title}</strong> – $${job.income}/day
          <button data-job="${job.title}">Apply</button>
        </div>
      `;
    });
    document.querySelectorAll("[data-job]").forEach(btn => {
      btn.onclick = async () => {
        if (!useAction(player)) return;
        const job = jobs.find(j => j.title === btn.getAttribute("data-job"));
        player.job = job.title;
        player.reputation = Math.min(100, player.reputation + Math.floor(job.income / 10));
        await saveGame(stateRef);
        updateUI(stateRef);
        alert(`Congrats! You are now a ${job.title}.`);
      };
    });
  }
}

function renderMore(player, gameState) {
  const moreEl = document.getElementById("more");
  moreEl.innerHTML = `<h3>🏠 Housing Upgrades</h3>`;
  const housingChoices = getAvailableHousing(player);
  if (housingChoices.length === 0) {
    moreEl.innerHTML += `<p>No housing upgrades available yet.</p>`;
  } else {
    housingChoices.forEach(option => {
      moreEl.innerHTML += `
        <div class="housing">
          <strong>${option.name}</strong> – $${option.cost}<br/>
          <em>${option.description}</em><br/>
          <button data-housing="${option.name}">Move In</button>
        </div>
      `;
    });
    document.querySelectorAll("[data-housing]").forEach(btn => {
      btn.onclick = async () => {
        if (!useAction(player)) return;
        const home = housingOptions.find(h => h.name === btn.getAttribute("data-housing"));
        if (player.cash >= home.cost) {
          player.cash -= home.cost;
          player.housing = home.name;
          player.reputation = Math.min(100, player.reputation + (home.name === "Apartment" ? 5 : 15));
          await saveGame(gameState);
          updateUI(gameState);
          alert(`You moved into a ${home.name}!`);
        }
      };
    });
  }

  moreEl.innerHTML += `
    <hr/><h3>👥 Clients</h3>
    <button id="discoverBtn">🔍 Find Clients</button>
    <div id="clientList"></div>
  `;

  document.getElementById("discoverBtn").onclick = async () => {
    const msg = discoverClient(player);
    await saveGame(gameState);
    updateUI(gameState);
    alert(msg);
  };

  const clients = getClientList(player).filter(c => c.discovered);
  const list = document.getElementById("clientList");
  list.innerHTML = clients.map(client => `
    <div class="client">
      <strong>${client.name}</strong> – Trust: ${client.trust} / 100<br/>
      ${client.invested ? `Invested: $${client.invested}<br/>` : ""}
      <details>
        <summary>Details</summary>
        Wealth: $${client.wealth}<br/>
        Risk: ${client.riskTolerance}<br/>
        Patience: ${client.patience} days<br/>
        Required Rep: ${client.reputationNeeded}, License: ${client.licenseNeeded || "None"}<br/>
        <button data-talk="${client.name}">Talk</button>
        <button data-pitch="${client.name}">Pitch</button>
        <button data-review="${client.name}">Review</button>
        <button data-gift="${client.name}">Gift</button>
      </details>
    </div>
  `).join("");

  attachClientActions(player, gameState);
}

function attachClientActions(player, gameState) {
  ["talk", "pitch", "review", "gift"].forEach(type => {
    document.querySelectorAll(`[data-${type}]`).forEach(btn => {
      btn.onclick = async () => {
        if (!useAction(player)) return;
        const name = btn.getAttribute(`data-${type}`);
        const result = {
          talk: talkClient,
          pitch: pitchClient,
          review: reviewClient,
          gift: giftClient
        }[type](player, name);
        await saveGame(gameState);
        updateUI(gameState);
        alert(result);
      };
    });
  });
}

function updateChart(gameState) {
  if (!selectedStock.value) {
    renderStockChart([], "");
    return;
  }
  const data = gameState.stockHistory.map(day => ({
    day: day.day,
    [selectedStock.value]: day[selectedStock.value]
  }));
  renderStockChart(data, selectedStock.value);
}

function useAction(player) {
  if (player.actionsLeft <= 0) {
    alert("You've used all 3 actions for today. Click Next Day to continue.");
    return false;
  }
  player.actionsLeft--;
  return true;
}
