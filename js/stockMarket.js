const STOCKS = [
  { symbol: "FCO", name: "FutureCo", price: 100, trend: 1 },
  { symbol: "MSP", name: "MediSpark", price: 80, trend: -1 },
  { symbol: "ZEX", name: "Zenix Corp", price: 50, trend: 0 },
  { symbol: "TLK", name: "Talknet", price: 30, trend: 1 },
  { symbol: "ENV", name: "EnviroTech", price: 60, trend: -1 }
];

export function getStocks() {
  return JSON.parse(JSON.stringify(STOCKS)); // return a fresh copy
}

export function updateMarket(stocks) {
  for (let stock of stocks) {
    // Random volatility ±5% to ±12%
    const volatility = 0.05 + Math.random() * 0.07;

    // Random direction but slightly influenced by trend
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to +1
    const direction = (stock.trend * 0.3) + randomFactor;

    const change = stock.price * volatility * direction;
    stock.price = Math.max(1, Math.round(stock.price + change));

    // Occasionally flip trend direction to simulate market sentiment shifts
    if (Math.random() < 0.1) {
      stock.trend = -stock.trend;
    }
  }
}
