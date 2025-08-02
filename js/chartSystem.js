let chart;

export function renderStockChart(stockHistory) {
  const canvas = document.getElementById("stockChart");

  if (!canvas) {
    console.warn("❌ stockChart canvas not found in DOM.");
    return;
  }

  const ctx = canvas.getContext("2d");

  // Debug: show incoming data
  console.log("📈 Rendering chart with data:", stockHistory);

  const labels = stockHistory.map((day, i) =>
    day.day !== undefined ? `Day ${day.day}` : `Day ${i + 1}`
  );

  const data = stockHistory.map(day =>
    day.price !== undefined ? day.price : Object.values(day)[0]
  );

  console.log("📅 Chart Labels:", labels);
  console.log("💵 Chart Prices:", data);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "AAPL Price",
        data,
        borderColor: "rgba(0, 200, 255, 0.8)",
        backgroundColor: "rgba(0, 200, 255, 0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: true },
        y: { beginAtZero: false }
      }
    }
  });
}
