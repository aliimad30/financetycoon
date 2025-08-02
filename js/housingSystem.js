export const housingOptions = [
  {
    name: "Car",
    cost: 0,
    minReputation: 0,
    repBoost: 0,
    description: "You're living in your car. It's rough, but you're surviving."
  },
  {
    name: "Apartment",
    cost: 1000,
    minReputation: 15,
    repBoost: 5,
    description: "A basic apartment with Wi-Fi and space to think."
  },
  {
    name: "House",
    cost: 5000,
    minReputation: 30,
    repBoost: 10,
    description: "A real home. You’ve made it far."
  },
  {
    name: "Mansion",
    cost: 20000,
    minReputation: 60,
    repBoost: 15,
    description: "Luxury living at its finest."
  }
];

export function getAvailableHousing(player) {
  return housingOptions.filter(option => option.name !== player.housing);
}
