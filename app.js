// ================================
// CONSTANTS
// ================================
const INCH_TO_MM = 25.4;

// Hole & Cutout rates (₹) – easy to change later
const HOLE_RATE = {
  small: 50,
  big: 120
};

const CUTOUT_RATE = {
  SP: 150,
  CSK: 200,
  BX: 250,
  CC: 300
};

// ================================
// HELPERS
// ================================
function toNumber(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function setValue(id, val) {
  document.getElementById(id).value = val;
}

// ================================
// MM ↔ INCH AUTO CONVERSION
// ================================
document.getElementById("widthMM").addEventListener("input", () => {
  const mm = toNumber("widthMM");
  setValue("widthInch", (mm / INCH_TO_MM).toFixed(2));
});

document.getElementById("heightMM").addEventListener("input", () => {
  const mm = toNumber("heightMM");
  setValue("heightInch", (mm / INCH_TO_MM).toFixed(2));
});

document.getElementById("widthInch").addEventListener("input", () => {
  const inch = toNumber("widthInch");
  setValue("widthMM", (inch * INCH_TO_MM).toFixed(2));
});

document.getElementById("heightInch").addEventListener("input", () => {
  const inch = toNumber("heightInch");
  setValue("heightMM", (inch * INCH_TO_MM).toFixed(2));
});

// ================================
// MAIN CALCULATION
// ================================
function calculate() {

  // ---------- ACTUAL SIZE ----------
  const widthMM = toNumber("widthMM");
  const heightMM = toNumber("heightMM");

  if (widthMM <= 0 || heightMM <= 0) {
    alert("Width / Height MM daalo");
    return;
  }

  const actualAreaMM = widthMM * heightMM;
  const actualAreaInch =
    (widthMM / INCH_TO_MM) * (heightMM / INCH_TO_MM);

  // ---------- ADD CHARGABLE ----------
  const addW = toNumber("addWidthMM");
  const addH = toNumber("addHeightMM");

  const chargableW = widthMM + addW;
  const chargableH = heightMM + addH;

  // ---------- AREA (SQM) ----------
  const chargableAreaSQM =
    (chargableW * chargableH) / 1_000_000;

  // ---------- RATE & QTY ----------
  const qty = toNumber("qty");
  const rate = toNumber("rate");

  const basicAmount =
    chargableAreaSQM * rate * qty;

  // ---------- FABRICATION ----------
  let fabAmount = 0;

  const holeType = document.getElementById("holeType").value;
  if (HOLE_RATE[holeType]) {
    fabAmount += HOLE_RATE[holeType] * qty;
  }

  const cutoutType = document.getElementById("cutoutType").value;
  if (CUTOUT_RATE[cutoutType]) {
    fabAmount += CUTOUT_RATE[cutoutType] * qty;
  }

  fabAmount += toNumber("otherFab");

  // ---------- EXTRA + GST ----------
  const extraCharges = toNumber("extraCharges");
  const gstPercent = toNumber("gst");

  const subTotal = basicAmount + fabAmount + extraCharges;
  const gstAmount = (subTotal * gstPercent) / 100;
  const grandTotal = subTotal + gstAmount;

  // ---------- OUTPUT ----------
  document.getElementById("actualMM").innerText =
    actualAreaMM.toFixed(2);

  document.getElementById("actualInch").innerText =
    actualAreaInch.toFixed(2);

  document.getElementById("chargableArea").innerText =
    chargableAreaSQM.toFixed(4);

  document.getElementById("total").innerText =
    grandTotal.toFixed(2);
}
