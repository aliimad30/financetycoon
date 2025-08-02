let chart;

export function renderStockChart(stockHistory) {
  const ctx = document.getElementById("stockChart");
  if (!ctx || stockHistory.length === 0) {
    if (chart) chart.destroy();
    return;
  }

  // Take last 30 days only
  const trimmedHistory = stockHistory.slice(-30);

  const context = ctx.getContext("2d");
  if (chart) chart.destroy();

  const labels = trimmedHistory.map(day => day.day); // just numbers
  const symbols = Object.keys(trimmedHistory[0]).filter(k => k !== "day");

  const datasets = symbols.map((symbol, idx) => {
    const colors = [
      "rgba(0, 200, 255, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(255, 206, 86, 0.8)"
    ];
    return {
      label: symbol,
      data: trimmedHistory.map(d => d[symbol]),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length].replace("0.8", "0.2"),
      fill: false,
      tension: 0.3
    };
  });

  chart = new Chart(context, {
    type: "line",
    data: { labels, datasets },
    options: { responsive: true }
  });
}
