export const housingOptions = [
  {
    name: "Car",
    cost: 0,
    minReputation: 0,
    description: "You're living in your car. It's rough, but you're surviving."
  },
  {
    name: "Apartment",
    cost: 1000,
    minReputation: 5,
    description: "A basic apartment with Wi-Fi and space to think."
  },
  {
    name: "House",
    cost: 5000,
    minReputation: 15,
    description: "A real home. You’ve made it far."
  }
];

export function getAvailableHousing(player) {
  return housingOptions.filter(option => {
    return (
      option.name !== player.housing &&
      player.cash >= option.cost &&
      player.reputation >= option.minReputation
    );
  });
}
