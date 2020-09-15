function createStatementData(invoice, plays) {
  const statementData = {};

  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalValueCredits = totalValueCredits(statementData);

  return statementData;

  function enrichPerformance(performance) {
    const result = { ...performance };

    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);

    return result;

    function playFor(performance) {
      return plays[performance.playID];
    }

    function amountFor(performance) {
      let result = 0;
      switch (performance.play.type) {
        case "tragedy":
          result = 40000;
          if (performance.audience > 30) {
            result += 1000 * (performance.audience - 30);
          }
          break;
        case "comedy":
          result = 30000;
          if (performance.audience > 20) {
            result += 10000 + 500 * (performance.audience - 20);
          }
          result += 300 * performance.audience;
          break;
        default:
          throw new Error(`unknown type: ${performance.play.type}`);
      }
      return result;
    }

    function volumeCreditsFor(performance) {
      let result = 0;

      result += Math.max(performance.audience - 30, 0);

      if ("comedy" === performance.play.type)
        result += Math.floor(performance.audience / 5);

      return result;
    }
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => p.amount + total, 0);
  }

  function totalValueCredits(data) {
    return data.performances.reduce((total, p) => p.volumeCredits + total, 0);
  }
}

module.exports = {
  createStatementData,
};
