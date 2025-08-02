let chart;

export function renderStockChart(stockHistory, stockName = "") {
  const ctx = document.getElementById("stockChart");
  if (!ctx || stockHistory.length === 0) {
    if (chart) chart.destroy();
    return;
  }

  const trimmedHistory = stockHistory.slice(-30);
  const context = ctx.getContext("2d");
  if (chart) chart.destroy();

  const labels = trimmedHistory.map(day => day.day);
  const symbol = Object.keys(trimmedHistory[0]).find(k => k !== "day");

  const dataset = {
    label: stockName,
    data: trimmedHistory.map(d => d[symbol]),
    borderColor: "rgba(0, 200, 0, 0.9)", // green
    backgroundColor: "rgba(0, 200, 0, 0.1)",
    borderWidth: 2,
    fill: false,
    pointRadius: 0,  // remove dots
    tension: 0.3
  };

  chart = new Chart(context, {
    type: "line",
    data: { labels, datasets: [dataset] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }, // no legend
        title: {
          display: !!stockName,
          text: stockName,
          color: "#fff",
          font: { size: 18 }
        }
      },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" }, beginAtZero: false }
      }
    }
  });
}
