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
import { getPersonalChoices, initPersonalData } from "./personalSystem.js";
import { applyDailyPersonalEffects } from "./personalSystem.js";



function calculateDailyExpenses(player) {
  let expenses = 0;
  if (player.personal) {
    const { diet, insurance, gym, hobby } = player.personal;
    const { dietOptions, insuranceOptions, gymOptions, hobbyOptions } = getPersonalChoices();

    expenses += (dietOptions.find(d => d.name === diet)?.cost || 0);
    expenses += (insuranceOptions.find(i => i.name === insurance)?.cost || 0);
    expenses += (gymOptions.find(g => g.name === gym)?.cost || 0);
    expenses += (hobbyOptions.find(h => h.name === hobby)?.cost || 0);
  }
  return expenses;  // ✅ No extra penalty for unemployment
}


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
// Conditional colors
const healthColor = player.personal?.health >= 70 ? 'lightgreen' : (player.personal?.health >= 40 ? 'orange' : 'red');
const moodColor = player.mood >= 70 ? 'lightgreen' : (player.mood >= 40 ? 'orange' : 'red');
const cashColor = player.cash >= 1000 ? 'lightgreen' : (player.cash >= 200 ? 'orange' : 'red');
const repColor = player.reputation >= 50 ? 'lightgreen' : 'orange';

document.getElementById("status").innerHTML = `
  <div class="dashboard-card">
    <h2>📅 Day ${day}</h2>
    <div class="dash-row"><strong>Job:</strong> ${player.job}</div>
    <div class="dash-row"><strong>Housing:</strong> ${player.housing}</div>
    <div class="dash-row"><strong>Clients:</strong> ${player.clients}</div>
    <div class="dash-row"><strong>Licenses:</strong> ${player.licenses.join(", ") || "None"}</div>
  </div>

  <div class="dashboard-card">
    <h3>💰 Finances</h3>
    <div class="dash-row" style="color:${cashColor}"><strong>Cash:</strong> $${player.cash.toFixed(2)}</div>
    <div class="dash-row"><strong>Daily Expenses:</strong> $${calculateDailyExpenses(player)}</div>
    <div class="dash-row" style="color:${repColor}"><strong>Reputation:</strong> ${player.reputation}</div>
  </div>

  <div class="dashboard-card">
    <h3>❤️ Well-being</h3>
    <div class="dash-row" style="color:${healthColor}"><strong>Health:</strong> ${player.personal?.health ?? 70}</div>
    <div class="dash-row" style="color:${moodColor}"><strong>Mood:</strong> ${player.mood ?? 70}</div>
  </div>
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

if (document.getElementById("personal")) {
  if (!player.personal) {
    initPersonalData(player);
  }
  renderPersonalTab(player, gameState);
}

  // Restore expanded card after UI refresh
if (expandedCard) {
  const expanded = document.getElementById(`actions-${expandedCard}`);
  if (expanded) {
    expanded.classList.remove("hidden");
    document.querySelector(`[data-symbol="${expandedCard}"]`)?.classList.add("selected-stock");
  }
}

}

function attachTradeListeners(player, stocks, gameState) {
  document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.onclick = async () => {
        expandedCard = btn.getAttribute("data-buy"); // ✅ Remember card
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
        expandedCard = btn.getAttribute("data-buy"); // ✅ Remember card
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
        expandedCard = btn.getAttribute("data-buy"); // ✅ Remember card
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
  moreEl.innerHTML = `<h3>🏠 Housing Options</h3>`;
  
  // === Housing Section ===
  const housingChoices = getAvailableHousing(player);
  if (housingChoices.length === 0) {
    moreEl.innerHTML += `<p>No housing options available.</p>`;
  } else {
    housingChoices.forEach(option => {
      moreEl.innerHTML += `
        <div class="housing">
          <strong>${option.name}</strong> – $${option.cost}<br/>
          <em>${option.description}</em><br/>
          <span style="color:${player.reputation >= option.minReputation ? 'lightgreen' : 'red'}">
            Required Reputation: ${option.minReputation}
          </span><br/>
          <button data-housing="${option.name}">Move In</button>
        </div>
      `;
    });

    document.querySelectorAll("[data-housing]").forEach(btn => {
      btn.onclick = async () => {
        if (!useAction(player)) return;
        const homeName = btn.getAttribute("data-housing");
        const home = housingOptions.find(h => h.name === homeName);
        const current = housingOptions.find(h => h.name === player.housing);

        // Determine rep change
        let repChange = 0;

        // --- Upgrade ---
        if (home.cost > current.cost) {
          if (player.reputation < home.minReputation) {
            alert(`You need at least ${home.minReputation} reputation to move in here.`);
            return;
          }
          if (player.cash < home.cost) {
            alert("Not enough cash to upgrade.");
            return;
          }
          if (home.name === "Apartment") repChange = 5;
          if (home.name === "House") repChange = 10;
          if (home.name === "Mansion") repChange = 15;
        }

        // --- Downgrade ---
        else if (home.cost < current.cost) {
          if (player.cash < home.cost) {
            alert("Not enough cash to downgrade.");
            return;
          }
          if (home.name === "Car" && current.name === "Apartment") repChange = -20;
          if (home.name === "Car" && current.name === "House") repChange = -30;
          if (home.name === "Car" && current.name === "Mansion") repChange = -50;
          if (home.name === "Apartment" && current.name === "House") repChange = -20;
          if (home.name === "Apartment" && current.name === "Mansion") repChange = -40;
          if (home.name === "House" && current.name === "Mansion") repChange = -30;
        }

        // Apply changes
        player.cash -= home.cost;
        player.housing = home.name;
        player.reputation = Math.max(0, Math.min(100, player.reputation + repChange));

        await saveGame(gameState);
        updateUI(gameState);
        alert(`You moved into a ${home.name}! Reputation ${repChange >= 0 ? '+' : ''}${repChange}`);
      };
    });
  }

  // === Clients Section ===
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

  // === Licenses Section ===
  moreEl.innerHTML += `
    <hr/><h3>📜 Licenses</h3>
    <div id="licenseList"></div>
  `;

  const licenseChoices = getAvailableLicenses(player);
  const licenseList = document.getElementById("licenseList");

  if (licenseChoices.length === 0) {
    licenseList.innerHTML = "<p>No licenses available yet.</p>";
  } else {
    licenseChoices.forEach(lic => {
      licenseList.innerHTML += `
        <div class="license">
          <strong>${lic.name}</strong> – $${lic.cost}<br/>
          <em>${lic.description}</em><br/>
          <span style="color:${player.reputation >= lic.minReputation ? 'lightgreen' : 'red'}">
            Required Reputation: ${lic.minReputation}
          </span><br/>
          <button data-license="${lic.name}">Purchase</button>
        </div>
      `;
    });

    document.querySelectorAll("[data-license]").forEach(btn => {
      btn.onclick = async () => {
        const licenseName = btn.getAttribute("data-license");
        const lic = licenses.find(l => l.name === licenseName);

        if (player.cash >= lic.cost && player.reputation >= lic.minReputation) {
          player.cash -= lic.cost;
          player.licenses.push(lic.name);

          // ✅ Reputation boost by license
          let repBoost = 0;
          if (lic.name === "Series 7") repBoost = 10;
          else if (lic.name === "RIA Certification") repBoost = 20;
          else if (lic.name === "Hedge Fund Manager Permit") repBoost = 10;

          player.reputation = Math.min(100, player.reputation + repBoost);

          await saveGame(gameState);
          updateUI(gameState);
          alert(`You obtained the ${lic.name} license! Reputation +${repBoost}`);
        } 
        else if (player.reputation < lic.minReputation) {
          alert(`You need at least ${lic.minReputation} reputation to buy this license.`);
        } 
        else {
          alert("Not enough cash for this license.");
        }
      };
    });
  }

  // Attach client actions last
  attachClientActions(player, gameState);
}



function renderPersonalTab(player, gameState) {
  const personalEl = document.getElementById("personal");
  personalEl.innerHTML = `<h3>🧍 Personal Preferences</h3>`;

  const { dietOptions, insuranceOptions, gymOptions, hobbyOptions } = getPersonalChoices();

  // Render current stats
  personalEl.innerHTML += `
    <p><strong>Health:</strong> ${player.personal?.health ?? 70}</p>
    <p><strong>Mood:</strong> ${player.mood ?? 70}</p>
    <p><strong>Reputation:</strong> ${player.reputation}</p>
    <hr/>
  `;

  // Helper to create choice buttons
  function renderChoices(title, list, current, type) {
    let html = `<h4>${title}</h4>`;
    list.forEach(opt => {
      html += `
        <button data-choice="${type}" data-value="${opt.name}" ${opt.name === current ? "style='background:green;'" : ""}>
          ${opt.name} ($${opt.cost}/day)
        </button><br/>
      `;
    });
    return html;
  }

  personalEl.innerHTML += renderChoices("Diet", dietOptions, player.personal?.diet ?? "Budget Diet", "diet");
  personalEl.innerHTML += renderChoices("Health Insurance", insuranceOptions, player.personal.insurance, "insurance");
  personalEl.innerHTML += renderChoices("Gym Membership", gymOptions, player.personal.gym, "gym");
  personalEl.innerHTML += renderChoices("Hobby/Social Life", hobbyOptions, player.personal.hobby, "hobby");

  // Attach listeners
  document.querySelectorAll("[data-choice]").forEach(btn => {
    btn.onclick = async () => {
      const type = btn.getAttribute("data-choice");
      const value = btn.getAttribute("data-value");
      player.personal[type] = value;
      await saveGame(gameState);
      renderPersonalTab(player, gameState);
    };
  });
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
