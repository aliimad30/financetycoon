const friends = [
  { name: "Alex", trust: 0, invested: 0 },
  { name: "Jordan", trust: 0, invested: 0 },
  { name: "Samira", trust: 0, invested: 0 },
  { name: "Luis", trust: 0, invested: 0 }
];

export function getClientList(player) {
  if (!player.clientsData || player.clientsData.length === 0) {
    console.log("⛔ clientsData missing or empty, initializing...");
    player.clientsData = JSON.parse(JSON.stringify(friends));
  } else {
    console.log("✅ Found existing player.clientsData:", player.clientsData);
  }
  return player.clientsData;
}



export function increaseTrust(player, name) {
  const client = player.clientsData.find(c => c.name === name);
  if (client && client.trust < 100) {
    client.trust += 10;
    if (client.trust >= 50 && client.invested === 0) {
      const funds = Math.floor(Math.random() * 400 + 600); // $600–1000
      client.invested = funds;
      player.cash += funds;
      player.clients += 1;
      return `${client.name} now trusts you and gave you $${funds} to manage!`;
    }
    return `${client.name}'s trust increased to ${client.trust}.`;
  }
  return `Nothing changed with ${name}.`;
}

