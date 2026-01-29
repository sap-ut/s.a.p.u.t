/* ================= CONSTANTS ================= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;
const SQFT_TO_SQMT = 0.092903;

/* ================= HELPERS ================= */
function inchSutToInch(inch, sut) {
  return (Number(inch) || 0) + ((Number(sut) || 0) / SUT_PER_INCH);
}

/* ================= ROW CALC ================= */
function calculateRow(row) {
  if (!row) return;

  const win  = row.querySelector(".win")?.value;
  const wsut = row.querySelector(".wsut")?.value;
  const hin  = row.querySelector(".hin")?.value;
  const hsut = row.querySelector(".hsut")?.value;

  const qty  = Number(row.querySelector(".qty")?.value || 1);
  const rate = Number(row.querySelector(".rate")?.value || 0);

  // inch
  const wInch = inchSutToInch(win, wsut);
  const hInch = inchSutToInch(hin, hsut);

  // mm
  const wMM = wInch * INCH_TO_MM;
  const hMM = hInch * INCH_TO_MM;

  // area
  const sqft = (wMM / 304.8) * (hMM / 304.8);
  const sqmt = sqft * SQFT_TO_SQMT;

  const amount = sqmt * rate * qty;

  // output
  row.querySelectorAll(".chargemm")[0].innerText = wMM.toFixed(1);
  row.querySelectorAll(".chargemm")[1].innerText = hMM.toFixed(1);
  row.querySelector(".area").innerText = sqmt.toFixed(3);
  row.querySelector(".amount").innerText = amount.toFixed(2);

  calculateTotals();
}

/* ================= TOTALS ================= */
function calculateTotals() {
  let subTotal = 0;

  document.querySelectorAll(".amount").forEach(td => {
    subTotal += Number(td.innerText || 0);
  });

  document.getElementById("subTotal").innerText = subTotal.toFixed(2);

  const hole    = Number(document.getElementById("holeCharge")?.value || 0);
  const cutout  = Number(document.getElementById("cutoutCharge")?.value || 0);
  const doc     = Number(document.getElementById("docCharge")?.value || 0);
  const freight = Number(document.getElementById("freight")?.value || 0);
  const gstP    = Number(document.getElementById("gst")?.value || 0);

  const beforeGST = subTotal + hole + cutout + doc + freight;
  const gstAmt = beforeGST * gstP / 100;

  document.getElementById("grandTotal").innerText =
    (beforeGST + gstAmt).toFixed(2);
}

/* ================= EVENTS ================= */
function bindAll() {
  document.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      const row = inp.closest("tr");
      if (row && row.parentElement.id === "itemsBody") {
        calculateRow(row);
      } else {
        calculateTotals();
      }
    });
  });
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  bindAll();
  calculateTotals();
});
