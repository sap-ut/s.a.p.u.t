/* =========================
   CONSTANTS
========================= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;
const SQFT_TO_SQMT = 0.092903;

/* =========================
   HELPERS
========================= */
function inchSutToInch(inch, sut) {
  return Number(inch || 0) + (Number(sut || 0) / SUT_PER_INCH);
}

function inchToMM(inch) {
  return inch * INCH_TO_MM;
}

function sqftToSqmt(sqft) {
  return sqft * SQFT_TO_SQMT;
}

/* =========================
   ROW CALCULATION
========================= */
function calculateRow(row) {

  // INPUTS
  const win  = row.querySelector(".win").value;
  const wsut = row.querySelector(".wsut").value;
  const hin  = row.querySelector(".hin").value;
  const hsut = row.querySelector(".hsut").value;

  const addMM = Number(row.querySelector(".addmm").value || 0);
  const qty   = Number(row.querySelector(".qty").value || 1);
  const rate  = Number(row.querySelector(".rate").value || 0);

  // ACTUAL SIZE (INCH)
  const wInch = inchSutToInch(win, wsut);
  const hInch = inchSutToInch(hin, hsut);

  // ACTUAL SIZE (MM)
  const wMM = inchToMM(wInch);
  const hMM = inchToMM(hInch);

  // CHARGEABLE SIZE (MM)
  const cwMM = wMM + addMM;
  const chMM = hMM + addMM;

  // AREA (SQFT)
  const areaSqft = (cwMM / 304.8) * (chMM / 304.8);

  // AREA (SQMT)
  const areaSqmt = sqftToSqmt(areaSqft);

  // AMOUNT
  const amount = areaSqmt * rate * qty;

  // OUTPUTS
  row.querySelector(".actualmm").innerText =
    `${wMM.toFixed(1)} × ${hMM.toFixed(1)}`;

  row.querySelector(".chargemm").innerText =
    `${cwMM.toFixed(1)} × ${chMM.toFixed(1)}`;

  row.querySelector(".area").innerText = areaSqmt.toFixed(3);
  row.querySelector(".amount").innerText = amount.toFixed(2);
}

/* =========================
   TOTAL CALCULATION
========================= */
function calculateTotals() {
  let subTotal = 0;

  document.querySelectorAll("#itemsBody tr").forEach(row => {
    subTotal += Number(row.querySelector(".amount").innerText || 0);
  });

  document.getElementById("subTotal").innerText = subTotal.toFixed(2);

  const hole   = Number(document.getElementById("holeCharge").value || 0);
  const cut    = Number(document.getElementById("cutoutCharge").value || 0);
  const doc    = Number(document.getElementById("docCharge").value || 0);
  const freight= Number(document.getElementById("freight").value || 0);
  const gstP   = Number(document.getElementById("gst").value || 0);

  const beforeGST = subTotal + hole + cut + doc + freight;
  const gstAmt = beforeGST * gstP / 100;

  document.getElementById("grandTotal").innerText =
    (beforeGST + gstAmt).toFixed(2);
}

/* =========================
   AUTO ADD ROW (EXCEL STYLE)
========================= */
function autoAddRow(currentRow) {
  const tbody = document.getElementById("itemsBody");
  const rows = tbody.querySelectorAll("tr");
  const lastRow = rows[rows.length - 1];

  if (currentRow === lastRow) {
    const clone = currentRow.cloneNode(true);

    clone.querySelectorAll("input").forEach(i => i.value = "");
    clone.querySelectorAll(".actualmm,.chargemm,.area,.amount")
      .forEach(td => td.innerText = "0");

    tbody.appendChild(clone);
    bindRow(clone);
  }
}

/* =========================
   BIND EVENTS
========================= */
function bindRow(row) {
  row.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      calculateRow(row);
      autoAddRow(row);
      calculateTotals();
    });
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#itemsBody tr").forEach(bindRow);

  document.querySelectorAll(
    "#holeCharge,#cutoutCharge,#docCharge,#freight,#gst"
  ).forEach(inp => {
    inp.addEventListener("input", calculateTotals);
  });
});
