export function buyStock(player, symbol, price) {
  if (player.cash < price) {
    alert("Not enough cash!");
    return false;
  }
  player.cash -= price;

  if (!player.portfolio[symbol]) {
    player.portfolio[symbol] = { quantity: 0, totalCost: 0 };
  }
  player.portfolio[symbol].quantity += 1;
  player.portfolio[symbol].totalCost += price;

  return true;
}

export function sellStock(player, symbol, price, qty = 1) {
  const stock = player.portfolio[symbol];
  if (!stock || stock.quantity <= 0) {
    alert("You don’t own this stock.");
    return false;
  }

  if (qty > stock.quantity) {
    alert("Not enough shares to sell.");
    return false;
  }

  const avgCostPerShare = stock.totalCost / stock.quantity;
  const totalSellAmount = qty * price;
  const profit = (price - avgCostPerShare) * qty;

  // Reduce holding
  stock.quantity -= qty;
  stock.totalCost -= avgCostPerShare * qty;
  player.cash += totalSellAmount;

  // Clean up empty positions
  if (stock.quantity === 0) {
    delete player.portfolio[symbol];
  }

  // ✅ Reputation effects
  if (profit > 0) {
    const repGain = Math.min(5, Math.floor(profit / 100)); // +1 rep per $100 profit
    if (repGain > 0) {
      player.reputation = Math.min(100, player.reputation + repGain);
      alert(`You made $${profit.toFixed(2)} profit. Reputation +${repGain}`);
    }
  } else if (profit < 0) {
    const repLoss = Math.min(5, Math.ceil(Math.abs(profit) / 200)); // -1 rep per $200 loss
    if (repLoss > 0) {
      player.reputation = Math.max(0, player.reputation - repLoss);
      alert(`You lost $${Math.abs(profit).toFixed(2)}. Reputation -${repLoss}`);
    }
  }

  return true;
}


