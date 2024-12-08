// BDS elements below
const billingCycleInput = document.querySelector("#billing_cycle");
const bdsStartDateInput = document.querySelector(".bds_start_date");
const bdsDiscountInput = document.querySelector("#bds_discount");
const balanceInput = document.querySelector(".balance_input");
const billedUpToInput = document.querySelector(".billed_date");
const ppStartDateInput = document.querySelector(".payment_start_date");
const submitBdsPayment = document.querySelector(".submit_bds_payment");
const bdsChargeDisplay = document.querySelector(".bds_charge");

const todayDateFormatted = new Date().toISOString().split("T")[0];

// BDS CHARGES CALCULATOR

const calcBdsRenewal = (startDate) => {
  let y = new Date(startDate).getFullYear() + 1;
  let m = new Date(startDate).getMonth() + 1;
  let month = m.toString().length < 2 ? `0${m}` : m;
  let d = new Date(startDate).getDate();
  let day = d.toString().length < 2 ? `0${d}` : d;
  return `${y}-${month}-${day}`;
};

// Prices
const bdsBand1 = 43.75;
const bdsBand2 = 87.5;
const bdsBand3 = 131.25;
const bdsBand4 = 175;
const bdsBand5 = 218.76;
const bdsBand6 = 262.51;
const bdsBand7 = 306.26;

// Calculate days between dates
const calcDays = (date1, date2) => {
  const dateA = new Date(date1);
  const dateB = new Date(date2);
  const aDayInMS = 24 * 60 * 60 * 1000;
  const diffInTime = dateB.getTime() - dateA.getTime();
  const diffInDays = diffInTime / aDayInMS;
  return diffInDays;
};

// Calculate months between dates for PP
const ppMonths = (date1, date2) => {
  const startDate = new Date(date1);
  const endDate = new Date(date2);
  let months;

  months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months -= startDate.getMonth();
  months += endDate.getMonth();
  if (endDate.getDate() - startDate.getDate() >= 0) {
    months++;
  } else {
    months;
  }
  return months;
};

// Calculate charges from April
const calcChargesFromApril = (bdsBand) => {
  const diffInDays = calcDays(billedUpToInput.value, calcBdsRenewal(bdsStartDateInput.value));
  const days = diffInDays < 0 ? 0 : diffInDays;
  const charges = days * (bdsBand / 365);
  return charges;
};

const calcBdsCharge = () => {
  let bdsCharge;
  switch (bdsDiscountInput.value) {
    case "band_1":
      bdsCharge = bdsBand1;
      break;
    case "band_2":
      bdsCharge = bdsBand2;
      break;
    case "band_3":
      bdsCharge = bdsBand3;
      break;
    case "band_4":
      bdsCharge = bdsBand4;
      break;
    case "band_5":
      bdsCharge = bdsBand5;
      break;
    case "band_6":
      bdsCharge = bdsBand6;
      break;
    case "band_7":
      bdsCharge = bdsBand7;
      break;
  }

  let bdsRenewal = calcBdsRenewal(bdsStartDateInput.value);
  let charge = balanceInput.value;
  let monthlyPaymentAmount;
  let numMonths = ppMonths(ppStartDateInput.value, bdsRenewal);
  let totalFutureCharges;

  if (billingCycleInput.value == "unmeasured") {
    // Unmeasured PP
    if (new Date(billedUpToInput.value) <= new Date(bdsRenewal)) {
      totalFutureCharges = calcChargesFromApril(bdsCharge) * 1.05;
      charge = totalFutureCharges + Number(charge);
      monthlyPaymentAmount = charge / ppMonths(ppStartDateInput.value, bdsRenewal);
    } else {
      charge = Number(balanceInput.value);
      monthlyPaymentAmount = charge / ppMonths(ppStartDateInput.value, billedUpToInput.value);
    }
  } else {
    // Measured PP
    var accruedCharge = (bdsCharge / 365) * calcDays(billedUpToInput.value, ppStartDateInput.value);
    let thisYearFutureCharges =
      (bdsCharge / 365) *
      calcDays(ppStartDateInput.value, bdsRenewal < "2025-03-31" ? bdsRenewal : "2025-03-31");
    let chargesFromApril = (bdsCharge / 365) * calcDays("2025-03-31", bdsRenewal) * 1.05;
    chargesFromApril = chargesFromApril < 0 ? 0 : chargesFromApril;
    totalFutureCharges = thisYearFutureCharges + chargesFromApril;
    charge = Number(charge) + totalFutureCharges + accruedCharge;
    monthlyPaymentAmount = charge / ppMonths(ppStartDateInput.value, bdsRenewal);
  }

  bdsChargeDisplay.innerHTML = `<h2>Set for £${monthlyPaymentAmount.toFixed(
    2
  )} over ${numMonths} months</h2>
  ${
    billingCycleInput.value == "unmeasured"
      ? `<h3>Charges up to end of March: £${balanceInput.value}</h3>`
      : ""
  }
  ${
    billingCycleInput.value == "unmeasured"
      ? ""
      : `<h3>Charges up to bill date: £${balanceInput.value}</h3>`
  }
  ${
    billingCycleInput.value == "unmeasured"
      ? ""
      : `<h3>Accrued Charges: £${accruedCharge.toFixed(2)}</h3>`
  }
  ${
    new Date(billedUpToInput.value) <= new Date(bdsRenewal)
      ? `<h3>Future Charges up to renewal: £${totalFutureCharges.toFixed(2)}</h3>`
      : ""
  }
  <h3>Total charges: £${charge.toFixed(2)}</h3>`;
};

submitBdsPayment.addEventListener("click", () => {
  calcBdsCharge();
});
