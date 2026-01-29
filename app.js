/* ========= CONSTANTS ========= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;
const SQFT_TO_SQMT = 0.092903;

/* ========= HELPERS ========= */
function inchSutToInch(inch, sut) {
  return (Number(inch) || 0) + (Number(sut) || 0) / SUT_PER_INCH;
}

/* ========= ROW CALC ========= */
function calculateRow(row) {
  if (!row) return;

  const win  = row.querySelector(".win").value;
  const wsut = row.querySelector(".wsut").value;
  const hin  = row.querySelector(".hin").value;
  const hsut = row.querySelector(".hsut").value;

  const qty  = Number(row.querySelector(".qty").value || 1);
  const rate = Number(row.querySelector(".rate").value || 0);

  // inch → mm
  const wMM = inchSutToInch(win, wsut) * INCH_TO_MM;
  const hMM = inchSutToInch(hin, hsut) * INCH_TO_MM;

  // Chargeable MM (abhi actual = chargeable)
  const chargeCells = row.querySelectorAll(".chargemm");
  chargeCells[0].innerText = wMM.toFixed(1);
  chargeCells[1].innerText = hMM.toFixed(1);

  // Area
  const sqft = (wMM / 304.8) * (hMM / 304.8);
  const sqmt = sqft * SQFT_TO_SQMT;

  // Amount
  const amount = sqmt * rate * qty;

  row.querySelector(".area").innerText = sqmt.toFixed(3);
  row.querySelector(".amount").innerText = amount.toFixed(2);

  calculateTotals();
}

/* ========= TOTALS ========= */
function calculateTotals() {
  let subTotal = 0;

  document.querySelectorAll(".amount").forEach(td => {
    subTotal += Number(td.innerText || 0);
  });

  document.getElementById("subTotal").innerText = subTotal.toFixed(2);

  const hole    = Number(document.getElementById("holeCharge").value || 0);
  const cutout  = Number(document.getElementById("cutoutCharge").value || 0);
  const doc     = Number(document.getElementById("docCharge").value || 0);
  const freight = Number(document.getElementById("freight").value || 0);
  const gstP    = Number(document.getElementById("gst").value || 0);

  const beforeGST = subTotal + hole + cutout + doc + freight;
  const gstAmt = beforeGST * gstP / 100;

  document.getElementById("grandTotal").innerText =
    (beforeGST + gstAmt).toFixed(2);
}

/* ========= EVENTS ========= */
document.addEventListener("DOMContentLoaded", () => {

  // table inputs
  document.querySelectorAll("#itemsBody input").forEach(inp => {
    inp.addEventListener("input", () => {
      calculateRow(inp.closest("tr"));
    });
  });

  // right side charges
  document.querySelectorAll(
    "#holeCharge,#cutoutCharge,#docCharge,#freight,#gst"
  ).forEach(inp => {
    inp.addEventListener("input", calculateTotals);
  });

});
