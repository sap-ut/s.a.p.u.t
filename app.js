/* =========================
   CONSTANTS
========================= */
const INCH_TO_MM = 25.4;
const SUT_PER_INCH = 8;

/* =========================
   DATE AUTO
========================= */
(function setDate(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  const el = document.getElementById("date");
  if(el) el.value = `${yyyy}-${mm}-${dd}`;
})();

/* =========================
   HELPERS
========================= */
function inchSutToMM(inch, sut){
  inch = Number(inch || 0);
  sut   = Number(sut   || 0);
  return (inch + (sut / SUT_PER_INCH)) * INCH_TO_MM;
}

/* =========================
   ROW CALCULATION
========================= */
function calculateRow(row){

  // actual mm
  const wMM = inchSutToMM(
    row.querySelector(".win").value,
    row.querySelector(".wsut").value
  );

  const hMM = inchSutToMM(
    row.querySelector(".hin").value,
    row.querySelector(".hsut").value
  );

  // +MM (global)
  const addW = Number(document.getElementById("addW").value || 0);
  const addH = Number(document.getElementById("addH").value || 0);

  const cW = wMM + addW;
  const cH = hMM + addH;

  row.querySelector(".cw").innerText = cW.toFixed(1);
  row.querySelector(".ch").innerText = cH.toFixed(1);

  // area (sqmt)
  const area = (cW / 1000) * (cH / 1000);
  row.querySelector(".area").innerText = area.toFixed(3);

  // amount
  const qty  = Number(row.querySelector(".qty").value || 1);
  const rate = Number(row.querySelector(".rate").value || 0);
  const amt  = area * qty * rate;

  row.querySelector(".amount").innerText = amt.toFixed(2);

  calculateTotals();
}

/* =========================
   TOTALS
========================= */
function calculateTotals(){
  let sub = 0;
  document.querySelectorAll(".amount").forEach(a=>{
    sub += Number(a.innerText || 0);
  });

  document.getElementById("subTotal").innerText = sub.toFixed(2);

  const hole    = Number(document.getElementById("hole").value || 0);
  const cutout  = Number(document.getElementById("cutout").value || 0);
  const doc     = Number(document.getElementById("doc").value || 0);
  const freight = Number(document.getElementById("freight").value || 0);
  const gstP    = Number(document.getElementById("gst").value || 0);

  const extra = hole + cutout + doc + freight;
  const gstAmt = (sub + extra) * gstP / 100;

  document.getElementById("grandTotal").innerText =
    (sub + extra + gstAmt).toFixed(2);
}

/* =========================
   AUTO ROW ADD
========================= */
function autoAddRow(currentRow){
  const body = document.getElementById("itemsBody");
  const rows = body.querySelectorAll("tr");
  const last = rows[rows.length - 1];

  if(currentRow === last){
    const clone = currentRow.cloneNode(true);

    clone.querySelectorAll("input").forEach(i=>i.value="");
    clone.querySelectorAll(".cw,.ch,.area,.amount")
         .forEach(td=>td.innerText="0");

    body.appendChild(clone);
    bindRow(clone);
  }
}

/* =========================
   BINDING
========================= */
function bindRow(row){
  row.querySelectorAll("input").forEach(inp=>{
    inp.addEventListener("input",()=>{
      calculateRow(row);
      autoAddRow(row);
    });
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("#itemsBody tr").forEach(bindRow);

  ["addW","addH","hole","cutout","doc","freight","gst"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener("input", calculateTotals);
  });
});
