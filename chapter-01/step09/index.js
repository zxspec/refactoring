const invoices = require("../data/invoices.json");
const plays = require("../data/plays.json");

function statement(invoice, plays) {
  const statementData = {};

  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalValueCredits = totalValueCredits(statementData);

  return renderPlainText(statementData, plays);

  function enrichPerformance(performance) {
    const result = { ...performance };

    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);

    return result;
  }

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

  function totalAmount(data) {
    return data.performances.reduce((total, perf) => total + perf.amount, 0);
  }

  function totalValueCredits(data) {
    return data.performances.reduce(
      (total, perf) => total + perf.volumeCredits,
      0
    );
  }
}

function renderPlainText(data, plays) {
  let result = `Statement for ${data.customer}\n`;

  for (let perf of data.performances) {
    // print line for this order
    result += `  ${perf.play.name}: ${usd(perf.amount)} (${
      perf.audience
    } seats)\n`;
  }

  result += `Amount owed is ${usd(data.totalAmount)}\n`;
  result += `You earned ${data.totalValueCredits} credits\n`;

  return result;

  function usd(number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(number / 100);
  }
}

const result = statement(invoices[0], plays);
console.log("### result: ", result);
