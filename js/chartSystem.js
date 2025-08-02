let chart;

export function renderStockChart(stockHistory) {
  const ctx = document.getElementById("stockChart").getContext("2d");

  // Ensure canvas has proper size before drawing
  ctx.canvas.width = ctx.canvas.clientWidth || 600;
  ctx.canvas.height = ctx.canvas.clientHeight || 300;

  console.log("📈 Rendering chart with data:", stockHistory);

  const labels = stockHistory.map(day => `Day ${day.day}`);
  
  // Get all stock symbols
  const symbols = Object.keys(stockHistory[0]).filter(k => k !== "day");
  const datasets = symbols.map((symbol, idx) => {
    const colors = [
      "rgba(0, 200, 255, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(255, 206, 86, 0.8)"
    ];
    const backgroundColors = colors.map(c => c.replace("0.8", "0.2"));
    return {
      label: symbol,
      data: stockHistory.map(d => d[symbol]),
      borderColor: colors[idx % colors.length],
      backgroundColor: backgroundColors[idx % colors.length],
      fill: false,
      tension: 0.3
    };
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: { display: true },
        y: { beginAtZero: false }
      }
    }
  });
}
