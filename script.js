// Initialize with one row
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = 
        today.toLocaleDateString('en-GB').split('/').join('-');
    
    // Add first row
    addRow();
    calculateTotal();
});

// Add new row to table
function addRow() {
    const tableBody = document.getElementById('tableBody');
    const rowCount = tableBody.children.length + 1;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="form-control" value="12MM CLEAR TOUGHENED GLASS"></td>
        <td>
            <div class="row">
                <div class="col-6">
                    <input type="text" class="form-control width-input" placeholder="Width" value="45 3/4">
                </div>
                <div class="col-6">
                    <input type="text" class="form-control height-input" placeholder="Height" value="44 1/2">
                </div>
            </div>
        </td>
        <td>
            <div class="row">
                <div class="col-6">
                    <input type="text" class="form-control chargeable-width" placeholder="Width" value="46 1/4">
                </div>
                <div class="col-6">
                    <input type="text" class="form-control chargeable-height" placeholder="Height" value="45">
                </div>
            </div>
        </td>
        <td><input type="number" class="form-control qty-input" value="1" min="1"></td>
        <td class="actual-area">0 Sq.Ft.</td>
        <td class="chargeable-area">0 Sq.Ft.</td>
        <td><input type="number" class="form-control rate-input" value="0"></td>
        <td class="amount">₹ 0.00</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></td>
    `;
    
    tableBody.appendChild(row);
    
    // Add event listeners to new row
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateRow);
    });
    
    calculateRow.call(row);
}

// Delete row
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateRowNumbers();
    calculateTotal();
}

// Update row numbers
function updateRowNumbers() {
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// Convert fraction string to decimal
function fractionToDecimal(fraction) {
    if (!fraction) return 0;
    
    // Handle whole numbers
    if (!fraction.includes(' ')) {
        if (fraction.includes('/')) {
            const [num, den] = fraction.split('/').map(Number);
            return num / den;
        }
        return parseFloat(fraction) || 0;
    }
    
    // Handle mixed numbers like "45 3/4"
    const parts = fraction.split(' ');
    if (parts.length === 2) {
        const whole = parseFloat(parts[0]) || 0;
        const fracPart = parts[1];
        if (fracPart.includes('/')) {
            const [num, den] = fracPart.split('/').map(Number);
            return whole + (num / den);
        }
        return whole + parseFloat(fracPart);
    }
    
    return parseFloat(fraction) || 0;
}

// Calculate single row
function calculateRow() {
    const row = this.closest ? this.closest('tr') : this;
    
    const widthInput = row.querySelector('.width-input');
    const heightInput = row.querySelector('.height-input');
    const widthChargeable = row.querySelector('.chargeable-width');
    const heightChargeable = row.querySelector('.chargeable-height');
    const qtyInput = row.querySelector('.qty-input');
    const rateInput = row.querySelector('.rate-input');
    const actualAreaCell = row.querySelector('.actual-area');
    const chargeableAreaCell = row.querySelector('.chargeable-area');
    const amountCell = row.querySelector('.amount');
    
    // Get values
    const width = fractionToDecimal(widthInput.value);
    const height = fractionToDecimal(heightInput.value);
    const widthC = fractionToDecimal(widthChargeable.value);
    const heightC = fractionToDecimal(heightChargeable.value);
    const qty = parseFloat(qtyInput.value) || 1;
    const rate = parseFloat(rateInput.value) || 0;
    
    // Calculate areas in Sq.Ft.
    const actualArea = (width * height) / 144; // Convert from sq.inches to sq.feet
    const chargeableArea = (widthC * heightC) / 144;
    
    // Calculate amount
    const amount = chargeableArea * qty * rate;
    
    // Update cells
    actualAreaCell.textContent = actualArea.toFixed(2) + ' Sq.Ft.';
    chargeableAreaCell.textContent = chargeableArea.toFixed(2) + ' Sq.Ft.';
    amountCell.textContent = '₹ ' + amount.toFixed(2);
    
    calculateTotal();
}

// Calculate total amounts
function calculateTotal() {
    // Calculate table totals
    const rows = document.querySelectorAll('#tableBody tr');
    let totalArea = 0;
    let totalAmount = 0;
    
    rows.forEach(row => {
        calculateRow.call(row);
        
        const chargeableAreaText = row.querySelector('.chargeable-area').textContent;
        const amountText = row.querySelector('.amount').textContent;
        
        const area = parseFloat(chargeableAreaText) || 0;
        const amount = parseFloat(amountText.replace('₹ ', '')) || 0;
        
        totalArea += area;
        totalAmount += amount;
    });
    
    // Calculate fabrication charges
    const holesQty = parseFloat(document.getElementById('holesQty').value) || 0;
    const holesRate = parseFloat(document.getElementById('holesRate').value) || 0;
    const cutoutQty = parseFloat(document.getElementById('cutoutQty').value) || 0;
    const cutoutRate = parseFloat(document.getElementById('cutoutRate').value) || 0;
    const shapeQty = parseFloat(document.getElementById('shapeQty').value) || 0;
    const shapeRate = parseFloat(document.getElementById('shapeRate').value) || 0;
    const bigHoleQty = parseFloat(document.getElementById('bigHoleQty').value) || 0;
    const bigHoleRate = parseFloat(document.getElementById('bigHoleRate').value) || 0;
    const cskQty = parseFloat(document.getElementById('cskQty').value) || 0;
    const cskRate = parseFloat(document.getElementById('cskRate').value) || 0;
    
    const fabCharges = 
        (holesQty * holesRate) +
        (cutoutQty * cutoutRate) +
        (shapeQty * shapeRate) +
        (bigHoleQty * bigHoleRate) +
        (cskQty * cskRate);
    
    // Other charges
    const charge1 = parseFloat(document.getElementById('charge1Amount').value) || 0;
    const charge2 = parseFloat(document.getElementById('charge2Amount').value) || 0;
    const charge3 = parseFloat(document.getElementById('charge3Amount').value) || 0;
    const otherCharges = charge1 + charge2 + charge3;
    
    // GST calculation
    const gstPercent = 18;
    const taxableAmount = totalAmount + fabCharges + otherCharges;
    const gstAmount = (taxableAmount * gstPercent) / 100;
    
    // Grand total
    const grandTotal = taxableAmount + gstAmount;
    
    // Update summary
    document.getElementById('totalArea').textContent = totalArea.toFixed(2) + ' Sq.Ft.';
    document.getElementById('basicAmount').textContent = '₹ ' + totalAmount.toFixed(2);
    document.getElementById('fabricationCharges').textContent = '₹ ' + fabCharges.toFixed(2);
    document.getElementById('gstAmount').textContent = '₹ ' + gstAmount.toFixed(2);
    document.getElementById('grandTotal').textContent = '₹ ' + grandTotal.toFixed(2);
}

// Generate PDF
function generatePDF() {
    calculateTotal();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Get current date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB');
    
    // Add header
    doc.setFillColor(102, 126, 234);
    doc.rect(10, 10, 190, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('GLASS WORKS', 15, 20);
    doc.setFontSize(12);
    doc.text('Address Line 1, Address Line 2, City, State - PIN', 15, 27);
    doc.text('Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5', 15, 32);
    
    // Add proforma title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('PROFORMA INVOICE', 140, 20);
    doc.setFontSize(10);
    doc.text(`Proforma No.: ${document.getElementById('proformaNo').textContent}`, 140, 27);
    doc.text(`Date: ${dateStr}`, 140, 32);
    doc.text(`GST Mode: ${document.getElementById('gstMode').value}`, 140, 37);
    
    // Customer details
    doc.setFontSize(12);
    doc.text('Customer Details:', 15, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${document.getElementById('customerName').value || 'N/A'}`, 15, 57);
    doc.text(`Address: ${document.getElementById('customerAddress').value || 'N/A'}`, 15, 62);
    doc.text(`Contact: ${document.getElementById('customerContact').value || 'N/A'}`, 15, 67);
    
    // Table header
    let yPos = 80;
    doc.setFontSize(10);
    doc.setFillColor(220, 220, 220);
    doc.rect(10, yPos, 190, 10, 'F');
    doc.text('Sr.', 12, yPos + 7);
    doc.text('Description', 25, yPos + 7);
    doc.text('Size (IN)', 80, yPos + 7);
    doc.text('Qty', 110, yPos + 7);
    doc.text('Area', 125, yPos + 7);
    doc.text('Rate', 145, yPos + 7);
    doc.text('Amount', 170, yPos + 7);
    
    // Table data
    yPos += 10;
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach((row, index) => {
        const desc = row.querySelector('td:nth-child(2) input').value;
        const width = row.querySelector('.width-input').value;
        const height = row.querySelector('.height-input').value;
        const qty = row.querySelector('.qty-input').value;
        const area = row.querySelector('.chargeable-area').textContent;
        const rate = row.querySelector('.rate-input').value;
        const amount = row.querySelector('.amount').textContent;
        
        doc.text((index + 1).toString(), 12, yPos + 7);
        doc.text(desc.substring(0, 30), 25, yPos + 7);
        doc.text(`${width} × ${height}`, 80, yPos + 7);
        doc.text(qty, 110, yPos + 7);
        doc.text(area, 125, yPos + 7);
        doc.text(rate, 145, yPos + 7);
        doc.text(amount, 170, yPos + 7);
        
        yPos += 10;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    // Fabrication charges box
    doc.setFillColor(255, 243, 205);
    doc.rect(120, yPos + 10, 80, 50, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('Fabrication Charges', 125, yPos + 17);
    doc.setFontSize(9);
    
    const holes = document.getElementById('holesQty').value;
    const holesR = document.getElementById('holesRate').value;
    doc.text(`Holes (H): ${holes} × ${holesR}`, 125, yPos + 24);
    
    const cutout = document.getElementById('cutoutQty').value;
    const cutoutR = document.getElementById('cutoutRate').value;
    doc.text(`Cutout (C): ${cutout} × ${cutoutR}`, 125, yPos + 29);
    
    const shape = document.getElementById('shapeQty').value;
    const shapeR = document.getElementById('shapeRate').value;
    doc.text(`Shape Cut (SP): ${shape} × ${shapeR}`, 125, yPos + 34);
    
    const bigHole = document.getElementById('bigHoleQty').value;
    const bigHoleR = document.getElementById('bigHoleRate').value;
    doc.text(`Big Hole (BH): ${bigHole} × ${bigHoleR}`, 125, yPos + 39);
    
    // Summary
    yPos += 60;
    doc.setFontSize(12);
    doc.text('Summary', 15, yPos);
    doc.setFontSize(10);
    
    doc.text(`Total Area: ${document.getElementById('totalArea').textContent}`, 15, yPos + 10);
    doc.text(`Basic Amount: ${document.getElementById('basicAmount').textContent}`, 15, yPos + 15);
    doc.text(`Fabrication Charges: ${document.getElementById('fabricationCharges').textContent}`, 15, yPos + 20);
    doc.text(`Other Charges: ₹ ${(charge1 + charge2 + charge3).toFixed(2)}`, 15, yPos + 25);
    doc.text(`GST @ 18%: ${document.getElementById('gstAmount').textContent}`, 15, yPos + 30);
    doc.text(`GRAND TOTAL: ${document.getElementById('grandTotal').textContent}`, 15, yPos + 40);
    
    // Save PDF
    doc.save(`Proforma_${document.getElementById('proformaNo').textContent}.pdf`);
}

// Show report in modal
function showReport() {
    calculateTotal();
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <div class="report-section">
            <h5>Proforma Report - ${document.getElementById('proformaNo').textContent}</h5>
            <hr>
            
            <h6>Customer: ${document.getElementById('customerName').value || 'N/A'}</h6>
            <p><strong>Date:</strong> ${document.getElementById('currentDate').textContent}</p>
            
            <h6 class="mt-3">Items Summary</h6>
            <table class="table table-sm table-bordered">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Total Area</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody id="reportItems">
                    <!-- Items will be populated by JavaScript -->
                </tbody>
            </table>
            
            <h6 class="mt-3">Charges Breakdown</h6>
            <table class="table table-sm table-bordered">
                <tr>
                    <td>Basic Glass Amount</td>
                    <td id="reportBasic">₹ 0.00</td>
                </tr>
                <tr>
                    <td>Fabrication Charges</td>
                    <td id="reportFab">₹ 0.00</td>
                </tr>
                <tr>
                    <td>Other Charges</td>
                    <td id="reportOther">₹ 0.00</td>
                </tr>
                <tr>
                    <td>GST @ 18%</td>
                    <td id="reportGST">₹ 0.00</td>
                </tr>
                <tr class="table-active">
                    <td><strong>GRAND TOTAL</strong></td>
                    <td><strong id="reportTotal">₹ 0.00</strong></td>
                </tr>
            </table>
        </div>
    `;
    
    // Populate items
    const rows = document.querySelectorAll('#tableBody tr');
    const reportItems = document.getElementById('reportItems');
    rows.forEach((row, index) => {
        const desc = row.querySelector('td:nth-child(2) input').value;
        const qty = row.querySelector('.qty-input').value;
        const area = row.querySelector('.chargeable-area').textContent;
        const amount = row.querySelector('.amount').textContent;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${desc}</td>
            <td>${qty}</td>
            <td>${area}</td>
            <td>${amount}</td>
        `;
        reportItems.appendChild(tr);
    });
    
    // Update values
    document.getElementById('reportBasic').textContent = document.getElementById('basicAmount').textContent;
    document.getElementById('reportFab').textContent = document.getElementById('fabricationCharges').textContent;
    
    const charge1 = parseFloat(document.getElementById('charge1Amount').value) || 0;
    const charge2 = parseFloat(document.getElementById('charge2Amount').value) || 0;
    const charge3 = parseFloat(document.getElementById('charge3Amount').value) || 0;
    document.getElementById('reportOther').textContent = '₹ ' + (charge1 + charge2 + charge3).toFixed(2);
    
    document.getElementById('reportGST').textContent = document.getElementById('gstAmount').textContent;
    document.getElementById('reportTotal').textContent = document.getElementById('grandTotal').textContent;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset all data?')) {
        document.getElementById('tableBody').innerHTML = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('customerContact').value = '';
        
        // Reset fabrication charges
        document.getElementById('holesQty').value = '0';
        document.getElementById('cutoutQty').value = '0';
        document.getElementById('shapeQty').value = '0';
        document.getElementById('bigHoleQty').value = '0';
        document.getElementById('cskQty').value = '0';
        
        // Reset other charges
        document.getElementById('charge1Amount').value = '0';
        document.getElementById('charge2Amount').value = '0';
        document.getElementById('charge3Amount').value = '0';
        
        // Add first row
        addRow();
        calculateTotal();
    }
}

// Add event listeners to existing inputs
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all inputs for auto-calculation
    document.querySelectorAll('input').forEach(input => {
        if (input.type === 'number' || input.type === 'text') {
            input.addEventListener('input', calculateTotal);
        }
    });
    
    // Add event listeners to fabrication inputs
    const fabInputs = [
        'holesQty', 'holesRate', 'cutoutQty', 'cutoutRate',
        'shapeQty', 'shapeRate', 'bigHoleQty', 'bigHoleRate',
        'cskQty', 'cskRate', 'charge1Amount', 'charge2Amount', 'charge3Amount'
    ];
    
    fabInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotal);
    });
});
