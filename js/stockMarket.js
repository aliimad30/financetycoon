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
    const volatility = Math.random() * 0.1; // up to ±10%
    const direction = stock.trend + (Math.random() - 0.5); // slightly biased
    const change = stock.price * volatility * direction;
    stock.price = Math.max(1, Math.round(stock.price + change));
  }
}
