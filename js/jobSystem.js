export const jobList = [
  {
    title: "Unemployed",
    income: 0,
    requirements: []
  },
  {
    title: "Gig Worker",
    income: 12,
    requirements: []
  },

  {
    title: "Barista",
    income: 20,
    requirements: []
  },
  {
    title: "Retail Assistant",
    income: 25,
    requirements: []
  },
  {
    title: "Intern - Brokerage",
    income: 35,
    requirements: []
  },
  {
    title: "Junior Trader",
    income: 45,
    requirements: []
  },
  {
    title: "Financial Analyst",
    income: 75,
    requirements: []
  },
  {
    title: "Investment Advisor",
    income: 110,
    requirements: [{ type: "license", value: "Series 7" }]
  },
  {
    title: "Wealth Manager",
    income: 250,
    requirements: [{ type: "license", value: "Series 7" }]
  },
  {
    title: "Fund Manager",
    income: 400,
    requirements: [{ type: "clients", value: 5 }]
  },
  {
    title: "Hedge Fund Partner",
    income: 700,
    requirements: [{ type: "clients", value: 10 }]
  }
];

export function getDailyIncome(player) {
  const job = jobList.find(j => j.title === player.job);
  return job ? job.income : 0;
}

export function getAvailableJobs(player) {
  return jobList.filter(job => {
    if (job.title === player.job) return false; // already in this job
    if (job.title === "Unemployed") return false; // cannot apply to be unemployed

    return job.requirements.every(req => {
      if (req.type === "license") return player.licenses.includes(req.value);
      if (req.type === "clients") return player.clients >= req.value;
      return false;
    });
  });
}