export const jobList = [
  {
    title: "Unemployed",
    income: 20,
    requirements: []
  },
  {
    title: "Freelancer",
    income: 50,
    requirements: []
  },
  {
    title: "Barista",
    income: 60,
    requirements: [{ type: "reputation", value: 5 }]
  },
  {
    title: "Junior Trader",
    income: 120,
    requirements: [{ type: "reputation", value: 15 }]
  },
  {
    title: "Financial Advisor",
    income: 200,
    requirements: [{ type: "license", value: "Series 7" }]
  },
  {
    title: "Fund Manager",
    income: 400,
    requirements: [{ type: "clients", value: 5 }]
  }
];

export function getDailyIncome(player) {
  const job = jobList.find(j => j.title === player.job);
  return job ? job.income : 20;
}

export function getAvailableJobs(player) {
  return jobList.filter(job => {
    // Don't include current job
    if (job.title === player.job) return false;

    // Check if player meets all requirements
    return job.requirements.every(req => {
      if (req.type === "reputation") return player.reputation >= req.value;
      if (req.type === "license") return player.licenses.includes(req.value);
      if (req.type === "clients") return player.clients >= req.value;
      return false;
    });
  });
}
