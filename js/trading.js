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

export function sellStock(player, symbol, price) {
  const stock = player.portfolio[symbol];
  if (!stock || stock.quantity <= 0) {
    alert("You don’t own this stock.");
    return false;
  }

  stock.quantity -= 1;
  player.cash += price;

  // Reduce cost basis proportionally
  const avgCost = stock.totalCost / (stock.quantity + 1);
  stock.totalCost -= avgCost;

  if (stock.quantity === 0) {
    delete player.portfolio[symbol];
  }
  return true;
}
