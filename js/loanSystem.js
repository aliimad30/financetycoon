function getBaseInterest(player) {
  // Base interest reduces with reputation
  return Math.max(0, 10 - (player.reputation / 10)); // percent
}

export function getLoanOptions(player) {
  const currentBalance = player.loan.balance > 0 ? player.loan.balance : 1000;
  return [
    { amount: 5000, interest: getBaseInterest(player) },
    { amount: currentBalance, interest: getBaseInterest(player) + 2 },
    { amount: currentBalance * 3, interest: getBaseInterest(player) + 4 }
  ];
}

export function takeLoan(player, amount, interestRate) {
  if (amount <= 0) return "Enter a valid amount.";

  player.cash += amount;
  player.loan.balance += amount;
  player.loan.dailyInterest = interestRate / 100; // store as decimal

  return `Loan approved for $${amount} at ${interestRate.toFixed(1)}% daily interest.`;
}

export function repayLoan(player, amount) {
  if (amount <= 0) return "Enter a valid amount.";
  if (amount > player.cash) return "Not enough cash.";
  if (amount > player.loan.balance) amount = player.loan.balance;

  player.cash -= amount;
  player.loan.balance -= amount;

  if (player.loan.balance <= 0) {
    player.loan.balance = 0;
    player.loan.dailyInterest = 0;
    return "Loan fully repaid!";
  }
  return `Repaid $${amount}. Remaining balance: $${player.loan.balance}`;
}

export function applyDailyLoanInterest(player) {
  if (player.loan.balance > 0) {
    const interest = Math.ceil(player.loan.balance * player.loan.dailyInterest);
    if (player.cash >= interest) {
      player.cash -= interest;
    } else {
      player.reputation = Math.max(0, player.reputation - 5);
      player.loan.balance += interest; // unpaid interest gets added
    }
  }
}
