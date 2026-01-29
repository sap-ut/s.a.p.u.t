/* =========================
   CONSTANTS
========================= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;

/* =========================
   HELPERS
========================= */
function inchSutToInch(inch, sut) {
  return Number(inch || 0) + (Number(sut || 0) / SUT_PER_INCH);
}

function inchToMM(inch) {
  return inch * INCH_TO_MM;
}

/* =========================
   ROW CALCULATION
========================= */
function calculateRow(row) {

  const win  = row.querySelector(".win").value;
  const wsut = row.querySelector(".wsut").value;
  const hin  = row.querySelector(".hin").value;
  const hsut = row.querySelector(".hsut").value;

  const addMM    = Number(row.querySelector(".addmm").value || 0);
  const holeMM   = Number(row.querySelector(".holemm").value || 0);
  const cutoutMM = Number(row.querySelector(".cutoutmm").value || 0);
  const qty      = Number(row.querySelector(".qty").value || 1);
  const rate     = Number(row.querySelector(".rate").value || 0);

  /* ACTUAL SIZE */
  const wMM = inchToMM(inchSutToInch(win, wsut));
  const hMM = inchToMM(inchSutToInch(hin, hsut));

  row.querySelector(".actualmm").innerText =
    `${wMM.toFixed(1)} × ${hMM.toFixed(1)}`;

  /* CHARGEABLE SIZE */
  const chargeW = wMM + addMM + holeMM + cutoutMM;
  const chargeH = hMM + addMM + holeMM + cutoutMM;

  row.querySelector(".chargemm").innerText =
    `${chargeW.toFixed(1)} × ${chargeH.toFixed(1)}`;

  /* AREA (SQMT) */
  const area = (chargeW / 1000) * (chargeH / 1000);
  row.querySelector(".area").innerText = area.toFixed(3);

  /* AMOUNT */
  const amount = area * qty * rate;
  row.querySelector(".amount").innerText = amount.toFixed(2);
}

/* =========================
   TOTALS
========================= */
function updateTotals() {
  let totalArea = 0;
  let totalAmount = 0;

  document.querySelectorAll("#itemsBody tr").forEach(row => {
    totalArea += Number(row.querySelector(".area").innerText || 0);
    totalAmount += Number(row.querySelector(".amount").innerText || 0);
  });

  document.getElementById("totalArea").innerText = totalArea.toFixed(3);
  document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
}

/* =========================
   AUTO ADD ROW
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
   EVENTS
========================= */
function bindRow(row) {
  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      calculateRow(row);
      updateTotals();
      autoAddRow(row);
    });
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#itemsBody tr").forEach(bindRow);
  updateTotals();
});
