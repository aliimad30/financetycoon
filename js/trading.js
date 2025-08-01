export function buyStock(player, symbol, price) {
  if (player.cash < price) {
    alert("Not enough cash!");
    return false;
  }

  player.cash -= price;
  if (!player.portfolio[symbol]) {
    player.portfolio[symbol] = 0;
  }
  player.portfolio[symbol] += 1;
  return true;
}

export function sellStock(player, symbol, price) {
  if (!player.portfolio[symbol] || player.portfolio[symbol] <= 0) {
    alert("You don’t own this stock.");
    return false;
  }

  player.portfolio[symbol] -= 1;
  player.cash += price;
  return true;
}
