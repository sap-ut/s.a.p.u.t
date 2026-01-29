// ===== AUTO DATE =====
document.getElementById("date").valueAsDate = new Date();

// ===== AUTO PI NUMBER =====
let lastPI = localStorage.getItem("glass_pi_no");
if (!lastPI) lastPI = 0;
let newPI = parseInt(lastPI) + 1;
localStorage.setItem("glass_pi_no", newPI);
document.getElementById("piNo").value = String(newPI).padStart(3,"0");

// ===== CALCULATION =====
document.body.addEventListener("input", calculate);

function inchToMM(inch, frac){
  return (parseFloat(inch||0) + parseFloat(frac||0)) * 25.4;
}

function calculate(){
  const r = document.querySelector("tbody tr");

  let wMM = parseFloat(r.querySelector(".wMM").value);
  let wIn = r.querySelector(".wIn").value;
  let wFrac = r.querySelector(".wFrac").value;

  let actualW = wMM ? wMM : inchToMM(wIn, wFrac);
  let actualH = actualW; // same logic (width/height separate later)

  r.querySelector(".actW").innerText = actualW.toFixed(2);
  r.querySelector(".actH").innerText = actualH.toFixed(2);

  let plusW = parseFloat(document.getElementById("plusW").value||0);
  let plusH = parseFloat(document.getElementById("plusH").value||0);

  let chgW = actualW + plusW;
  let chgH = actualH + plusH;

  r.querySelector(".chgW").innerText = chgW.toFixed(2);
  r.querySelector(".chgH").innerText = chgH.toFixed(2);

  let qty = parseFloat(r.querySelector(".qty").value||1);
  let area = (chgW * chgH * qty) / 1000000;
  r.querySelector(".area").innerText = area.toFixed(3);

  let rate = parseFloat(r.querySelector(".rate").value||0);
  let amt = area * rate;
  r.querySelector(".amt").innerText = amt.toFixed(2);

  document.getElementById("sub").innerText = amt.toFixed(2);

  let holes = parseInt(r.querySelector(".hole").value||0);
  let cuts  = parseInt(r.querySelector(".cut").value||0);

  document.getElementById("holeT").innerText = holes;
  document.getElementById("cutT").innerText = cuts;

  let gst = parseFloat(document.getElementById("gst").value||0);
  let grand = amt + (amt * gst / 100);
  document.getElementById("grand").innerText = grand.toFixed(2);
}
