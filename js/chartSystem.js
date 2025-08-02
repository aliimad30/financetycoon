let chart;

export function renderStockChart(stockHistory) {
  const ctx = document.getElementById("stockChart").getContext("2d");

  const labels = stockHistory.map(day => `Day ${day.day}`);
  const data = stockHistory.map(day => day.price);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "FCO Price",
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
