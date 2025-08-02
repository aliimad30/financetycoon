import { nextDay } from "./main.js";
import { buyStock, sellStock } from "./trading.js";
import { saveGame } from "./firestore.js";
import { getAvailableJobs, getDailyIncome } from "./jobSystem.js";
import { getAvailableHousing, housingOptions } from "./housingSystem.js";
import { getClientList, increaseTrust } from "./clientSystem.js";
import { getAvailableLicenses, licenses } from "./licenseSystem.js";
import { renderStockChart } from "./chartSystem.js";


let selectedStock = null;
let stateRef;


export function initUI(gameState) {
  stateRef = gameState;

  // Handle tab switching
document.querySelectorAll("#tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab").forEach(sec => sec.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  });
});


  // Default to dashboard
  document.querySelector("[data-tab='dashboard']").click();

  // Add next day button
  const dash = document.getElementById("dashboard");
  dash.innerHTML = `
    <div id="status"></div>
    <button id="nextDayBtn">Next Day</button>
  `;

  document.getElementById("nextDayBtn").addEventListener("click", () => {
    nextDay();
  });

  updateUI(gameState);
}

export function updateUI(gameState) {
  const { player, stocks, day } = gameState;

  // Dashboard tab
  document.getElementById("status").innerHTML = `
    <h3>Day ${day}</h3>
    <p><strong>Job:</strong> ${player.job}</p>
    <p><strong>Cash:</strong> $${player.cash.toFixed(2)}</p>
    <p><strong>Housing:</strong> ${player.housing}</p>
    <p><strong>Reputation:</strong> ${player.reputation}</p>
    <p><strong>Clients:</strong> ${player.clients}</p>
<p><strong>Licenses:</strong> ${player.licenses.join(", ") || "None"}</p>
 
    `;

  // Market tab
updateChart(gameState);


// Render stock list in a separate container
const stockList = document.getElementById("stockList");
stockList.innerHTML = "";
stocks.forEach(stock => {
  const owned = player.portfolio[stock.symbol] || 0;
  stockList.innerHTML += `
    <div class="stock" data-symbol="${stock.symbol}">
      <strong>${stock.symbol}</strong> (${stock.name}): $${stock.price}
      <br />
      Owned: ${owned}
      <button data-buy="${stock.symbol}">Buy</button>
      <button data-sell="${stock.symbol}">Sell</button>
    </div>
  `;
});

// Click on stock card to show only that stock's chart
document.querySelectorAll(".stock").forEach(card => {
  card.onclick = () => {
    selectedStock = card.getAttribute("data-symbol");
    updateChart(gameState);
  };
});


  // Event listeners
  document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.onclick = async () => {
      const symbol = btn.getAttribute("data-buy");
      const stock = stocks.find(s => s.symbol === symbol);
      if (buyStock(player, symbol, stock.price)) {
        await saveGame(gameState);
        updateUI(gameState);
      }
    };
  });

  document.querySelectorAll("[data-sell]").forEach(btn => {
    btn.onclick = async () => {
      const symbol = btn.getAttribute("data-sell");
      const stock = stocks.find(s => s.symbol === symbol);
      if (sellStock(player, symbol, stock.price)) {
        await saveGame(gameState);
        updateUI(gameState);
      }
    };
  });

  // Jobs tab
  const jobsEl = document.getElementById("jobs");
  const available = getAvailableJobs(player);
  jobsEl.innerHTML = `<h3>Available Jobs</h3>`;
  if (available.length === 0) {
    jobsEl.innerHTML += `<p>No jobs available yet. Build your reputation!</p>`;
  } else {
    available.forEach(job => {
      jobsEl.innerHTML += `
        <div>
          <strong>${job.title}</strong> – $${job.income}/day
          <button data-job="${job.title}">Apply</button>
        </div>
      `;
    });

    document.querySelectorAll("[data-job]").forEach(btn => {
      btn.onclick = async () => {
        const jobTitle = btn.getAttribute("data-job");
        player.job = jobTitle;
        await saveGame(gameState);
        updateUI(gameState);
        alert(`Congrats! You are now a ${jobTitle}.`);
      };
    });
  }

  // More tab (placeholder)


// ...
// More tab (Housing + Clients)
const moreEl = document.getElementById("more");

// 🏠 Housing
moreEl.innerHTML = `<h3>🏠 Housing Upgrades</h3>`;
const housingChoices = getAvailableHousing(player);

if (housingChoices.length === 0) {
  moreEl.innerHTML += `<p>No housing upgrades available yet.</p>`;
} else {
  housingChoices.forEach(option => {
    moreEl.innerHTML += `
      <div>
        <strong>${option.name}</strong> – $${option.cost}
        <br />
        <em>${option.description}</em>
        <br />
        <button data-housing="${option.name}">Move In</button>
      </div>
    `;
  });

  document.querySelectorAll("[data-housing]").forEach(btn => {
    btn.onclick = async () => {
      const choice = btn.getAttribute("data-housing");
      const selected = housingOptions.find(h => h.name === choice);
      if (player.cash >= selected.cost) {
        player.cash -= selected.cost;
        player.housing = selected.name;
        await saveGame(gameState);
        updateUI(gameState);
        alert(`You moved into a ${selected.name}!`);
      }
    };
  });
}

// 👥 Clients
moreEl.innerHTML += `<hr/><h3>👥 Potential Clients</h3>`;
const clients = getClientList(player);
console.log("🧠 Clients being rendered:", clients);

let clientsHTML = `<hr/><h3>👥 Potential Clients</h3>`;
clients.forEach(client => {
  clientsHTML += `
    <div>
      <strong>${client.name}</strong> – Trust: ${client.trust} / 100
      ${client.invested > 0 ? `<br/>Invested: $${client.invested}` : ""}
      <br />
      <button data-client="${client.name}">Talk</button>
    </div>
  `;
});
moreEl.innerHTML += clientsHTML;

// NOW attach listeners
setTimeout(() => {
  document.querySelectorAll("[data-client]").forEach(btn => {
    btn.onclick = async () => {
      const name = btn.getAttribute("data-client");
      console.log("👤 Talking to client:", name);

      const msg = increaseTrust(player, name);
      console.log("🗨️ Message from trust function:", msg);

      await saveGame(gameState);
      updateUI(gameState);
      alert(msg);
    };
  });
}, 0);


// 📃 Licenses
moreEl.innerHTML += `<hr/><h3>📃 Available Licenses</h3>`;
const availableLicenses = getAvailableLicenses(player);

if (availableLicenses.length === 0) {
  moreEl.innerHTML += `<p>No licenses available right now. Earn more reputation or cash!</p>`;
} else {
  availableLicenses.forEach(lic => {
    moreEl.innerHTML += `
      <div>
        <strong>${lic.name}</strong> – $${lic.cost}
        <br />
        <em>${lic.description}</em>
        <br />
        <button data-license="${lic.name}">Get License</button>
      </div>
    `;
  });

  document.querySelectorAll("[data-license]").forEach(btn => {
    btn.onclick = async () => {
      const name = btn.getAttribute("data-license");
      const lic = licenses.find(l => l.name === name);
      if (lic && player.cash >= lic.cost) {
        player.cash -= lic.cost;
        player.licenses.push(lic.name);
        await saveGame(gameState);
        updateUI(gameState);
        alert(`You earned the ${lic.name} license!`);
      }
    };
  });
}



// Placeholder
moreEl.innerHTML += `
  <hr />
  <h3>Coming Soon</h3>
  <ul>
    <li>📃 License exams</li>
    <li>🏦 Hedge fund / bank system</li>
  </ul>
`;

}

function updateChart(gameState) {
  // Filter history for selected stock or show nothing if null
  if (!selectedStock) {
    renderStockChart([]);
    return;
  }

  const filteredData = gameState.stockHistory.map(day => ({
    day: day.day,
    [selectedStock]: day[selectedStock]
  }));

  renderStockChart(filteredData);
}
