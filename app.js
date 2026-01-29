function today(){
  let d=new Date();
  return d.toLocaleDateString();
}

document.getElementById("todayDate").innerText=today();
document.getElementById("piNo").innerText="PI-"+Date.now();

document.body.addEventListener("input",calculate);

function inchToMM(inch,frac){
  return (parseFloat(inch||0)+parseFloat(frac||0))*25.4;
}

function calculate(){
let row=document.querySelector("#itemBody tr");

let inch=row.querySelector(".inch").value;
let frac=row.querySelector(".frac").value;
let mm=inchToMM(inch,frac);

row.querySelector(".mm").innerText=mm.toFixed(2);

let plusW=parseFloat(document.getElementById("plusW").value||0);
let plusH=parseFloat(document.getElementById("plusH").value||0);

let cW=mm+plusW;
let cH=mm+plusH;

row.querySelector(".cmmW").innerText=cW.toFixed(2);
row.querySelector(".cmmH").innerText=cH.toFixed(2);

let qty=parseFloat(row.querySelector(".qty").value||1);
let area=(cW*cH/1000000)*qty;

row.querySelector(".area").innerText=area.toFixed(3);

let rate=parseFloat(row.querySelector(".rate").value||0);
let amt=area*rate;

row.querySelector(".amount").innerText=amt.toFixed(2);

let sub=amt;
document.getElementById("subTotal").innerText=sub.toFixed(2);

let hole=parseFloat(document.getElementById("holeCharge").value||0);
let cut=parseFloat(document.getElementById("cutCharge").value||0);
let freight=parseFloat(document.getElementById("freight").value||0);
let gst=parseFloat(document.getElementById("gst").value||0);

let grand=sub+hole+cut+freight;
grand+=grand*(gst/100);

document.getElementById("grandTotal").innerText=grand.toFixed(2);
}
