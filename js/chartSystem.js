let chart;

export function renderStockChart(stockHistory) {
  console.log("📈 Rendering chart with data:", stockHistory);

  const ctx = document.getElementById("stockChart")?.getContext("2d");
  if (!ctx || stockHistory.length === 0) return;

  const labels = stockHistory.map(day => `Day ${day.day}`);
  const symbols = Object.keys(stockHistory[0]).filter(k => k !== "day");

  const datasets = symbols.map(symbol => ({
    label: symbol,
    data: stockHistory.map(entry => entry[symbol]),
    borderColor: getColor(symbol),
    backgroundColor: getColor(symbol, 0.2),
    fill: false,
    tension: 0.3
  }));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { display: true },
        y: { beginAtZero: false }
      }
    }
  });

  console.log("📅 Chart Labels:", labels);
  console.log("📊 Datasets:", datasets);
}

function getColor(symbol, alpha = 0.8) {
  const colorMap = {
    FCO: `rgba(0, 200, 255, ${alpha})`,
    MSP: `rgba(255, 99, 132, ${alpha})`,
    ZEX: `rgba(54, 162, 235, ${alpha})`,
    TLK: `rgba(75, 192, 192, ${alpha})`,
    ENV: `rgba(255, 206, 86, ${alpha})`,
  };
  return colorMap[symbol] || `rgba(100,100,100,${alpha})`;
}
