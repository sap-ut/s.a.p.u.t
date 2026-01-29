/* ========= CONSTANTS ========= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;
const SQFT_TO_SQMT = 0.092903;

/* ========= AUTO DATE ========= */
document.addEventListener("DOMContentLoaded", () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = d.getFullYear();
  document.getElementById("piDate").value = `${dd}-${mm}-${yy}`;
});

/* ========= HELPERS ========= */
function inchSutToInch(i, s) {
  return (Number(i)||0) + (Number(s)||0)/SUT_PER_INCH;
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
  const addMM = Number(document.getElementById("addMM").value || 0);

  // Actual MM
  const wActual = inchSutToInch(win, wsut) * INCH_TO_MM;
  const hActual = inchSutToInch(hin, hsut) * INCH_TO_MM;

  // Chargeable MM (ONLY THIS ROW)
  const wCharge = wActual + addMM;
  const hCharge = hActual + addMM;

  const chargeCells = row.querySelectorAll(".chargemm");
  chargeCells[0].innerText = wCharge.toFixed(1);
  chargeCells[1].innerText = hCharge.toFixed(1);

  // Area (chargeable)
  const sqft = (wCharge / 304.8) * (hCharge / 304.8);
  const sqmt = sqft * SQFT_TO_SQMT;

  const amount = sqmt * rate * qty;

  row.querySelector(".area").innerText = sqmt.toFixed(3);
  row.querySelector(".amount").innerText = amount.toFixed(2);

  calculateTotals();
}

/* ========= TOTAL ========= */
function calculateTotals() {
  let total = 0;
  document.querySelectorAll(".amount").forEach(td=>{
    total += Number(td.innerText||0);
  });

  document.getElementById("subTotal").innerText = total.toFixed(2);

  const hole = +holeCharge.value||0;
  const cut  = +cutoutCharge.value||0;
  const doc  = +docCharge.value||0;
  const fr   = +freight.value||0;
  const gstp = +gst.value||0;

  const beforeGST = total + hole + cut + doc + fr;
  const gstAmt = beforeGST * gstp / 100;

  document.getElementById("grandTotal").innerText =
    (beforeGST + gstAmt).toFixed(2);
}

/* ========= EVENTS ========= */
document.addEventListener("input", e => {
  const row = e.target.closest("tr");
  if (row && row.parentElement.id === "itemsBody") {
    calculateRow(row);
  } else {
    calculateTotals();
  }
});
