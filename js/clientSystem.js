// ==============================
// NEW CLIENT SYSTEM (clientSystem.js)
// ==============================

// --- CONFIG: Client Pool ---
const CLIENT_POOL = [
  { name: "Alex", wealth: 1200, riskTolerance: "Balanced", patience: 3, reputationNeeded: 0, licenseNeeded: null },
  { name: "Jordan", wealth: 2500, riskTolerance: "Conservative", patience: 5, reputationNeeded: 5, licenseNeeded: "Series 7" },
  { name: "Samira", wealth: 5000, riskTolerance: "Aggressive", patience: 4, reputationNeeded: 10, licenseNeeded: "Series 7" },
  { name: "Luis", wealth: 2000, riskTolerance: "Balanced", patience: 3, reputationNeeded: 2, licenseNeeded: null },
  { name: "Claire", wealth: 7000, riskTolerance: "Aggressive", patience: 6, reputationNeeded: 15, licenseNeeded: "RIA Certification" },
  { name: "Maya", wealth: 3500, riskTolerance: "Conservative", patience: 4, reputationNeeded: 8, licenseNeeded: null },
  { name: "Omar", wealth: 10000, riskTolerance: "Balanced", patience: 5, reputationNeeded: 20, licenseNeeded: "Hedge Fund Manager Permit" }
];

// --- Helper: Initialize player clients ---
export function initClientData(player) {
  if (!player.clientsData) player.clientsData = [];
}

// --- Helper: Mood multiplier for trust changes ---
function moodMultiplier(player) {
  if (!player.mood && player.mood !== 0) return 1;
  if (player.mood >= 80) return 1.2;    // High mood = +20% effectiveness
  if (player.mood <= 40) return 0.6;    // Low mood = -40% effectiveness
  return 1;
}

// --- Discover a random client ---
export function discoverClient(player) {
  const undiscovered = CLIENT_POOL.filter(c => {
    const alreadyHas = player.clientsData.some(cl => cl.name === c.name);
    return !alreadyHas && player.reputation >= c.reputationNeeded;
  });

  if (undiscovered.length === 0) {
    return "No new clients discovered. Improve your reputation or attend more events.";
  }

  const found = undiscovered[Math.floor(Math.random() * undiscovered.length)];
  player.clientsData.push({
    ...found,
    trust: 0,
    invested: 0,
    discovered: true,
    lastInteraction: 0
  });

  return `You met ${found.name}! They might become a client if you build enough trust.`;
}

// --- Talk to a client ---
export function talkClient(player, name) {
  const client = player.clientsData.find(c => c.name === name);
  if (!client) return "Client not found.";

  const mult = moodMultiplier(player);
  const gain = Math.round(5 * mult);

  client.trust = Math.min(100, client.trust + gain);
  client.lastInteraction = 0;
  return `${client.name}'s trust increased by ${gain} (Mood effect). Total: ${client.trust}.`;
}

// --- Pitch investment opportunity ---
export function pitchClient(player, name) {
  const client = player.clientsData.find(c => c.name === name);
  if (!client) return "Client not found.";

  const mult = moodMultiplier(player);

  if (Math.random() < 0.5 * mult) {
    const gain = Math.round(20 * mult);
    client.trust = Math.min(100, client.trust + gain);
    client.lastInteraction = 0;
    return `${client.name} loved your pitch! Trust +${gain}.`;
  } else {
    const loss = Math.round(5 / mult);
    client.trust = Math.max(0, client.trust - loss);
    client.lastInteraction = 0;
    return `${client.name} wasn't convinced. Trust -${loss}.`;
  }
}

// --- Review portfolio ---
export function reviewPortfolio(player, name, roiPercent = 0) {
  const client = player.clientsData.find(c => c.name === name);
  if (!client) return "Client not found.";

  const mult = moodMultiplier(player);

  if (client.invested > 0) {
    if (roiPercent > 0) {
      const gain = Math.round(5 * mult);
      client.trust = Math.min(100, client.trust + gain);
      return `${client.name} is happy with returns! Trust +${gain}.`;
    } else if (roiPercent < 0) {
      const loss = Math.round(5 / mult);
      client.trust = Math.max(0, client.trust - loss);
      return `${client.name} is upset about losses. Trust -${loss}.`;
    }
  }
  return `${client.name} has no investments yet.`;
}

// --- Attempt investment ---
export function tryInvest(player, name) {
  const client = player.clientsData.find(c => c.name === name);
  if (!client) return "Client not found.";

  if (client.trust >= 50) {
    if (client.licenseNeeded && !player.licenses.includes(client.licenseNeeded)) {
      return `${client.name} requires you to have ${client.licenseNeeded} before investing.`;
    }

    if (player.reputation < client.reputationNeeded) {
      return `${client.name} doesn't think your reputation is high enough.`;
    }

    if (client.invested === 0) {
      client.invested = client.wealth;
      player.cash += client.wealth;
      player.clients += 1;
      return `${client.name} invested $${client.wealth} with you!`;
    } else {
      return `${client.name} already invested.`;
    }
  }
  return `${client.name} doesn't trust you enough yet.`;
}

// --- Daily decay and patience check ---
export function updateClientsDaily(player) {
  if (!player.clientsData) return;

  const remainingClients = [];

  player.clientsData.forEach(client => {
    client.lastInteraction++;

    // Client leaves if ignored too long AND trust < 40
    if (client.lastInteraction >= client.patience && client.trust < 40) {
      player.clients = Math.max(0, player.clients - 1);
      // ✅ We simply skip adding them to the new list
    } else {
      remainingClients.push(client);
    }
  });

  player.clientsData = remainingClients;
}


// --- Get client list ---
export function getClientList(player) {
  return player.clientsData || [];
}

// --- Gift client (scaled cost based on wealth) ---
export function giftClient(player, name) {
  const client = player.clientsData.find(c => c.name === name);
  if (!client) return "Client not found.";

  // Gift cost = 2% of client's wealth (min $50)
  const cost = Math.max(50, Math.floor(client.wealth * 0.02));

  if (player.cash < cost) {
    return `You need $${cost} to impress ${client.name}, but you don't have enough cash.`;
  }

  player.cash -= cost;

  // Trust boost scales with cost, capped at 100
  const trustBoost = Math.min(100, Math.floor(10 + cost / 20));
  client.trust = Math.min(100, client.trust + trustBoost);
  client.lastInteraction = 0;

  return `${client.name} appreciated your generous gift! Trust increased to ${client.trust}. (-$${cost})`;
}
