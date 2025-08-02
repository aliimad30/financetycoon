// ==============================
// PERSONAL SYSTEM (personalSystem.js)
// ==============================

// --- Diet options ---
export const dietOptions = [
  { name: "Budget Diet", cost: 5, healthEffect: -1, moodEffect: 0, repEffect: 0 },
  { name: "Balanced Diet", cost: 15, healthEffect: +1, moodEffect: +1, repEffect: 0 },
  { name: "Luxury Diet", cost: 40, healthEffect: +2, moodEffect: +2, repEffect: +1 }
];

// --- Health insurance options (bill reduction %) ---
export const insuranceOptions = [
  { name: "None", cost: 0, healthRisk: 5, moodEffect: -1, billReduction: 0 },      // full bill
  { name: "Basic Insurance", cost: 10, healthRisk: 2.5, moodEffect: 0, billReduction: 0.4 },  // 40% discount
  { name: "Premium Insurance", cost: 25, healthRisk: 0.5, moodEffect: +1, billReduction: 0.75 } // 75% discount
];

// --- Gym memberships ---
export const gymOptions = [
  { name: "None", cost: 0, healthEffect: -1, moodEffect: -1 },
  { name: "Basic Gym", cost: 5, healthEffect: +1, moodEffect: +1 },
  { name: "Premium Gym", cost: 15, healthEffect: +2, moodEffect: +2 }
];

// --- Hobbies / Social life ---
export const hobbyOptions = [
  { name: "None", cost: 0, moodEffect: -1, repEffect: 0 },
  { name: "Casual Hobby", cost: 20, moodEffect: +1, repEffect: +1 },
  { name: "Exclusive Club", cost: 100, moodEffect: +3, repEffect: +3 }
];


// --- Initialize lifestyle choices ---
export function initPersonalData(player) {
  if (!player.personal) {
    player.personal = {
      diet: dietOptions[0].name,
      insurance: insuranceOptions[0].name,
      gym: gymOptions[0].name,
      hobby: hobbyOptions[0].name,
      health: 70,  // baseline
      mood: 70
    };
  }
}

// --- Get selected option object ---
function findOption(list, selectedName) {
  return list.find(o => o.name === selectedName);
}

// --- Daily effects & expenses ---
export function applyDailyPersonalEffects(player) {
  if (!player.personal) return;

  let totalCost = 0;
  let totalHealthChange = 0;
  let totalMoodChange = 0;
  let totalRepChange = 0;

  // Diet
  const diet = findOption(dietOptions, player.personal.diet);
  totalCost += diet.cost;
  totalHealthChange += diet.healthEffect;
  totalMoodChange += diet.moodEffect;
  totalRepChange += diet.repEffect;

  // Insurance
  const insurance = findOption(insuranceOptions, player.personal.insurance);
  totalCost += insurance.cost;
  totalMoodChange += insurance.moodEffect;

  // ✅ Dynamic medical risk based on health
  const health = player.personal.health ?? 70;
  const adjustedRisk = insurance.healthRisk * ((100 - health) / 100);

  if (Math.random() * 100 < adjustedRisk) {
  let bill = Math.floor(Math.random() * 200) + 100;
  const discount = insurance.billReduction || 0;
  bill = Math.floor(bill * (1 - discount));  // ✅ Apply insurance discount
  totalCost += bill;

    totalMoodChange -= 3;
    totalHealthChange -= 5;

    // ✅ Notify player of the event
    if (typeof window !== "undefined") {
      alert(`🚑 Unexpected medical expense! You were billed $${bill} due to health issues.`);
    }
  }

  // Gym
  const gym = findOption(gymOptions, player.personal.gym);
  totalCost += gym.cost;
  totalHealthChange += gym.healthEffect;
  totalMoodChange += gym.moodEffect;

  // Hobby
  const hobby = findOption(hobbyOptions, player.personal.hobby);
  totalCost += hobby.cost;
  totalMoodChange += hobby.moodEffect;
  totalRepChange += hobby.repEffect;

  // Deduct cost
  player.cash = Math.max(0, player.cash - totalCost);

  // Apply effects
  player.personal.health = Math.max(0, Math.min(100, player.personal.health + totalHealthChange));
  player.mood = Math.max(0, Math.min(100, (player.mood || 70) + totalMoodChange));
  player.reputation = Math.max(0, Math.min(100, player.reputation + totalRepChange));

  return `Daily personal expenses: $${totalCost}`;
}

// --- Get all choices for UI ---
export function getPersonalChoices() {
  return {
    dietOptions,
    insuranceOptions,
    gymOptions,
    hobbyOptions
  };
}
