const INCH_TO_MM = 25.4;
const SUT = 8;

function inchSutToMM(inch, sut) {
  return ((+inch || 0) + ((+sut || 0) / SUT)) * INCH_TO_MM;
}

function calculateRow(row) {

  const win = row.querySelector(".win").value;
  const wsut = row.querySelector(".wsut").value;
  const hin = row.querySelector(".hin").value;
  const hsut = row.querySelector(".hsut").value;

  const qty = +row.querySelector(".qty").value || 1;
  const rate = +row.querySelector(".rate").value || 0;
  const addMM = +document.getElementById("paimaishMM").value || 0;

  const wMM = inchSutToMM(win, wsut);
  const hMM = inchSutToMM(hin, hsut);

  const cw = wMM + addMM;
  const ch = hMM + addMM;

  row.querySelector(".cw").innerText = cw.toFixed(1);
  row.querySelector(".ch").innerText = ch.toFixed(1);

  const areaSqmt = (cw / 1000) * (ch / 1000);
  const amount = areaSqmt * rate * qty;

  row.querySelector(".area").innerText = areaSqmt.toFixed(3);
  row.querySelector(".amount").innerText = amount.toFixed(2);

  calculateTotal();
}

function calculateTotal() {
  let sub = 0;
  document.querySelectorAll(".amount").forEach(a => {
    sub += +a.innerText || 0;
  });

  const hole = +document.getElementById("hole").value || 0;
  const cutout = +document.getElementById("cutout").value || 0;
  const freight = +document.getElementById("freight").value || 0;
  const gst = +document.getElementById("gst").value || 0;

  const gstAmt = (sub + hole + cutout + freight) * gst / 100;
  const grand = sub + hole + cutout + freight + gstAmt;

  document.getElementById("subTotal").innerText = sub.toFixed(2);
  document.getElementById("grandTotal").innerText = grand.toFixed(2);
}

function bindRow(row) {
  row.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => calculateRow(row));
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // Auto Date
  const d = new Date();
  document.getElementById("invoiceDate").value =
    d.toLocaleDateString("en-GB");

  document.querySelectorAll("#itemsBody tr").forEach(bindRow);

  document.querySelectorAll("#hole,#cutout,#freight,#gst,#paimaishMM")
    .forEach(i => i.addEventListener("input", calculateTotal));
});
