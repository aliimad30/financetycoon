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

  // Reduce holding
  stock.quantity -= qty;
  stock.totalCost -= avgCostPerShare * qty;
  player.cash += totalSellAmount;

  // Clean up empty positions
  if (stock.quantity === 0) {
    delete player.portfolio[symbol];
  }
  return true;
}

