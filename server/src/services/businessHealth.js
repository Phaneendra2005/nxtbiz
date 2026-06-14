export const healthScoreWeights = {
  customerSatisfaction: 0.28,
  responseTime: 0.16,
  invoiceCollection: 0.2,
  ticketResolution: 0.2,
  leadConversion: 0.16
};

export const calculateBusinessHealthScore = ({
  customerSatisfaction = 75,
  responseTime = 75,
  invoiceCollection = 75,
  ticketResolution = 75,
  leadConversion = 75,
  meetingMomentum = 75
} = {}) => {
  const score =
    customerSatisfaction * healthScoreWeights.customerSatisfaction +
    responseTime * healthScoreWeights.responseTime +
    invoiceCollection * healthScoreWeights.invoiceCollection +
    ticketResolution * healthScoreWeights.ticketResolution +
    leadConversion * healthScoreWeights.leadConversion;

  return {
    score: Math.round(score),
    factors: {
      customerSatisfaction,
      responseTime,
      invoiceCollection,
      leadConversion,
      ticketResolution,
      meetingMomentum
    }
  };
};
