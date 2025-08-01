export const licenses = [
  {
    name: "Series 7",
    cost: 2000,
    minReputation: 10,
    description: "Required to legally advise clients and manage their investments."
  },
  {
    name: "RIA Certification",
    cost: 3000,
    minReputation: 15,
    description: "Register as a financial advisor and manage larger accounts."
  },
  {
    name: "Hedge Fund Manager Permit",
    cost: 7000,
    minReputation: 20,
    description: "Legally manage pooled funds with flexible trading strategies."
  }
];

export function getAvailableLicenses(player) {
  return licenses.filter(lic => {
    return (
      !player.licenses.includes(lic.name) &&
      player.reputation >= lic.minReputation &&
      player.cash >= lic.cost
    );
  });
}
