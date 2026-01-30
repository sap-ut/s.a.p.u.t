// Initialize system
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('proformaDate').value = today;
    
    // Generate 500 rows with ALL COLUMNS
    generateProductRows(500);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial calculation
    calculateTotal();
});

// Generate product rows with ALL columns
function generateProductRows(count) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    
    for(let i = 1; i <= count; i++) {
        const row = document.createElement('tr');
        row.id = `row-${i}`;
        row.innerHTML = `
            <td class="text-center">${i}</td>
            <td>
                <input type="text" class="form-control form-control-sm desc" 
                       placeholder="e.g., 12MM CLEAR TOUGHENED GLASS" 
                       value="${i === 1 ? '12MM CLEAR TOUGHENED GLASS' : ''}">
            </td>
            
            <!-- ACTUAL SIZE IN INCHES -->
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1">
                        <input type="text" class="form-control form-control-sm actual-in-w" 
                               placeholder="W" value="${i === 1 ? '45 3/4' : ''}">
                    </div>
                    <div class="col-6 ps-1">
                        <input type="text" class="form-control form-control-sm actual-in-h" 
                               placeholder="H" value="${i === 1 ? '44 1/2' : ''}">
                    </div>
                </div>
            </td>
            
            <!-- ACTUAL SIZE IN MM -->
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1">
                        <input type="number" class="form-control form-control-sm actual-mm-w" 
                               placeholder="W mm" value="${i === 1 ? '1162' : ''}">
                    </div>
                    <div class="col-6 ps-1">
                        <input type="number" class="form-control form-control-sm actual-mm-h" 
                               placeholder="H mm" value="${i === 1 ? '1130' : ''}">
                    </div>
                </div>
            </td>
            
            <!-- CHARGEABLE SIZE IN INCHES -->
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1">
                        <input type="text" class="form-control form-control-sm charge-in-w" 
                               placeholder="W" readonly>
                    </div>
                    <div class="col-6 ps-1">
                        <input type="text" class="form-control form-control-sm charge-in-h" 
                               placeholder="H" readonly>
                    </div>
                </div>
            </td>
            
            <!-- CHARGEABLE SIZE IN MM -->
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1">
                        <input type="number" class="form-control form-control-sm charge-mm-w" 
                               placeholder="W mm" readonly>
                    </div>
                    <div class="col-6 ps-1">
                        <input type="number" class="form-control form-control-sm charge-mm-h" 
                               placeholder="H mm" readonly>
                    </div>
                </div>
            </td>
            
            <!-- QUANTITY -->
            <td>
                <input type="number" class="form-control form-control-sm qty" 
                       value="1" min="1">
            </td>
            
            <!-- AREA -->
            <td class="text-center area-cell">0</td>
            
            <!-- RATE -->
            <td>
                <input type="number" class="form-control form-control-sm rate" 
                       value="${i === 1 ? '1413.91' : '0'}">
            </td>
            
            <!-- AMOUNT -->
            <td class="text-end amount-cell">0.00</td>
            
            <!-- ACTION -->
            <td class="text-center">
                <button class="btn btn-danger btn-xs" onclick="clearRow(${i})" title="Clear Row">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Add event listeners to this row
        addRowEventListeners(row, i);
        
        // Calculate this row if it has data
        if(i === 1) {
            setTimeout(() => calculateRow(i), 100);
        }
    }
}

// Add event listeners to a row
function addRowEventListeners(row, rowNum) {
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            calculateRow(rowNum);
            calculateTotal();
        });
    });
    
    // Special handling for inch inputs to auto-convert to mm
    const inchInputs = row.querySelectorAll('.actual-in-w, .actual-in-h');
    inchInputs.forEach(input => {
        input.addEventListener('blur', function() {
            convertInchToMM(rowNum);
        });
    });
    
    // Special handling for mm inputs to auto-convert to inches
    const mmInputs = row.querySelectorAll('.actual-mm-w, .actual-mm-h');
    mmInputs.forEach(input => {
        input.addEventListener('blur', function() {
            convertMMToInch(rowNum);
        });
    });
}

// Convert inch to mm for a row
function convertInchToMM(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    const widthIn = row.querySelector('.actual-in-w').value;
    const heightIn = row.querySelector('.actual-in-h').value;
    
    if(widthIn) {
        const widthMM = convertFractionToMM(widthIn);
        row.querySelector('.actual-mm-w').value = widthMM.toFixed(0);
    }
    
    if(heightIn) {
        const heightMM = convertFractionToMM(heightIn);
        row.querySelector('.actual-mm-h').value = heightMM.toFixed(0);
    }
    
    calculateRow(rowNum);
}

// Convert mm to inch for a row
function convertMMToInch(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    const widthMM = parseFloat(row.querySelector('.actual-mm-w').value) || 0;
    const heightMM = parseFloat(row.querySelector('.actual-mm-h').value) || 0;
    
    if(widthMM > 0) {
        const widthIn = (widthMM / 25.4).toFixed(2);
        row.querySelector('.actual-in-w').value = widthIn;
    }
    
    if(heightMM > 0) {
        const heightIn = (heightMM / 25.4).toFixed(2);
        row.querySelector('.actual-in-h').value = heightIn;
    }
    
    calculateRow(rowNum);
}

// Convert fraction string to decimal mm
function convertFractionToMM(fractionStr) {
    if(!fractionStr) return 0;
    
    let decimal = 0;
    
    // Handle mixed numbers like "45 3/4"
    if(fractionStr.includes(' ')) {
        const parts = fractionStr.split(' ');
        const whole = parseFloat(parts[0]) || 0;
        const fraction = parts[1];
        
        if(fraction.includes('/')) {
            const [num, den] = fraction.split('/').map(Number);
            decimal = whole + (num / den);
        } else {
            decimal = whole + parseFloat(fraction);
        }
    } 
    // Handle fraction only like "3/4"
    else if(fractionStr.includes('/')) {
        const [num, den] = fractionStr.split('/').map(Number);
        decimal = num / den;
    }
    // Handle decimal only
    else {
        decimal = parseFloat(fractionStr) || 0;
    }
    
    return decimal * 25.4;
}

// Calculate single row
function calculateRow(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    // Get values
    const actualWIn = row.querySelector('.actual-in-w').value.trim();
    const actualHIn = row.querySelector('.actual-in-h').value.trim();
    const actualWMm = row.querySelector('.actual-mm-w').value;
    const actualHMm = row.querySelector('.actual-mm-h').value;
    const qty = parseFloat(row.querySelector('.qty').value) || 1;
    const rate = parseFloat(row.querySelector('.rate').value) || 0;
    
    // If no size data, skip
    if(!actualWIn && !actualHIn && !actualWMm && !actualHMm) {
        row.querySelector('.area-cell').textContent = '0';
        row.querySelector('.amount-cell').textContent = '0.00';
        return;
    }
    
    // Calculate size in mm (use mm if available, else convert inches)
    let widthMm = 0, heightMm = 0;
    
    if(actualWMm && actualHMm) {
        widthMm = parseFloat(actualWMm) || 0;
        heightMm = parseFloat(actualHMm) || 0;
    } else if(actualWIn && actualHIn) {
        widthMm = convertFractionToMM(actualWIn);
        heightMm = convertFractionToMM(actualHIn);
    }
    
    // Apply wastage
    const wastageMode = document.getElementById('wastageMode').value;
    if(wastageMode === '+mm') {
        const addMM = parseFloat(document.getElementById('addMM').value) || 0;
        widthMm += addMM;
        heightMm += addMM;
    }
    
    // Update chargeable size
    row.querySelector('.charge-mm-w').value = widthMm.toFixed(0);
    row.querySelector('.charge-mm-h').value = heightMm.toFixed(0);
    
    // Convert back to inches
    const widthIn = (widthMm / 25.4).toFixed(2);
    const heightIn = (heightMm / 25.4).toFixed(2);
    row.querySelector('.charge-in-w').value = widthIn;
    row.querySelector('.charge-in-h').value = heightIn;
    
    // Calculate area
    const uom = document.getElementById('uom').value;
    let area = 0;
    
    if(uom === 'sqmt') {
        area = (widthMm * heightMm) / 1000000; // sq.mt
    } else {
        area = (widthMm * heightMm) / 92903.04; // sq.ft
    }
    
    area = area * qty;
    row.querySelector('.area-cell').textContent = area.toFixed(3);
    
    // Calculate amount
    const amount = area * rate;
    row.querySelector('.amount-cell').textContent = amount.toFixed(2);
}

// Calculate all rows
function calculateAllRows() {
    const rows = document.querySelectorAll('#productTableBody tr');
    rows.forEach((row, index) => {
        calculateRow(index + 1);
    });
    calculateTotal();
}

// Calculate total summary
function calculateTotal() {
    const rows = document.querySelectorAll('#productTableBody tr');
    let itemCount = 0;
    let totalArea = 0;
    let totalAmount = 0;
    
    rows.forEach(row => {
        const desc = row.querySelector('.desc').value.trim();
        const area = parseFloat(row.querySelector('.area-cell').textContent) || 0;
        const amount = parseFloat(row.querySelector('.amount-cell').textContent) || 0;
        
        if(desc || area > 0) {
            itemCount++;
            totalArea += area;
            totalAmount += amount;
        }
    });
    
    // Calculate additional charges
    const packing = parseFloat(document.getElementById('packingCharges').value) || 0;
    const freight = parseFloat(document.getElementById('freightCharges').value) || 0;
    const other = parseFloat(document.getElementById('otherCharges').value) || 0;
    const additionalCharges = packing + freight + other;
    
    // Update summary cards
    document.getElementById('summaryItems').textContent = itemCount;
    
    const uom = document.getElementById('uom').value === 'sqmt' ? 'Sq.Mt.' : 'Sq.Ft.';
    document.getElementById('summaryArea').textContent = totalArea.toFixed(3) + ' ' + uom;
    document.getElementById('summaryBasic').textContent = '₹ ' + totalAmount.toFixed(2);
    document.getElementById('summaryGrand').textContent = '₹ ' + (totalAmount + additionalCharges).toFixed(2);
    
    // Update main summary
    document.getElementById('totalArea').textContent = totalArea.toFixed(3) + ' ' + uom;
    document.getElementById('basicAmount').textContent = '₹ ' + totalAmount.toFixed(2);
    document.getElementById('additionalCharges').textContent = '₹ ' + additionalCharges.toFixed(2);
    
    // Calculate subtotal
    const subTotal = totalAmount + additionalCharges;
    document.getElementById('subTotal').textContent = '₹ ' + subTotal.toFixed(2);
    
    // Calculate GST
    const gstPercent = parseFloat(document.getElementById('gstPercent').value) || 0;
    document.getElementById('gstLabel').textContent = gstPercent;
    const gstAmount = (subTotal * gstPercent) / 100;
    document.getElementById('gstAmount').textContent = '₹ ' + gstAmount.toFixed(2);
    
    // Calculate round off
    const roundOff = parseFloat(document.getElementById('roundOff').value) || 0;
    document.getElementById('roundOffAmount').textContent = '₹ ' + roundOff.toFixed(2);
    
    // Calculate grand total
    const grandTotal = subTotal + gstAmount + roundOff;
    document.getElementById('grandTotal').textContent = '₹ ' + grandTotal.toFixed(2);
}

// Setup event listeners
function setupEventListeners() {
    // Same address checkbox
    document.getElementById('sameAddress').addEventListener('change', function() {
        if(this.checked) {
            document.getElementById('shipName').value = document.getElementById('billName').value;
            document.getElementById('shipAddress').value = document.getElementById('billAddress').value;
            document.getElementById('shipGST').value = document.getElementById('billGST').value;
            document.getElementById('shipPhone').value = document.getElementById('billPhone').value;
        }
    });
    
    // Auto copy when bill fields change
    const billFields = ['billName', 'billAddress', 'billGST', 'billPhone'];
    billFields.forEach(field => {
        document.getElementById(field).addEventListener('input', function() {
            if(document.getElementById('sameAddress').checked) {
                const shipField = field.replace('bill', 'ship');
                document.getElementById(shipField).value = this.value;
            }
        });
    });
    
    // Additional charges inputs
    ['packingCharges', 'freightCharges', 'otherCharges', 'gstPercent', 'roundOff'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotal);
    });
}

// Toggle wastage settings
function toggleWastage() {
    const mode = document.getElementById('wastageMode').value;
    const mmSettings = document.getElementById('mmSettings');
    mmSettings.style.display = mode === '+mm' ? 'block' : 'none';
}

// Apply wastage to all rows
function applyWastageToAll() {
    calculateAllRows();
}

// Select party
function selectParty(partyName) {
    if(partyName === 'Mohan Glass House') {
        document.getElementById('billName').value = 'Mohan Glass House';
        document.getElementById('billAddress').value = '123 Main Street, Delhi';
        document.getElementById('billGST').value = '07AABCM1234N1Z5';
        document.getElementById('billPhone').value = '9876543210';
    } else if(partyName === 'Shyam Glass Works') {
        document.getElementById('billName').value = 'Shyam Glass Works';
        document.getElementById('billAddress').value = '456 Market Road, Noida';
        document.getElementById('billGST').value = '09AAECS1234N1Z6';
        document.getElementById('billPhone').value = '9876543211';
    }
    
    // Copy to ship if same address is checked
    if(document.getElementById('sameAddress').checked) {
        copyAddress();
    }
}

// Copy address from bill to ship
function copyAddress() {
    document.getElementById('shipName').value = document.getElementById('billName').value;
    document.getElementById('shipAddress').value = document.getElementById('billAddress').value;
    document.getElementById('shipGST').value = document.getElementById('billGST').value;
    document.getElementById('shipPhone').value = document.getElementById('billPhone').value;
}

// Show print options
function showPrintOptions() {
    const modal = new bootstrap.Modal(document.getElementById('printOptionsModal'));
    modal.show();
}

// Export to Excel
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    // Prepare data array
    const data = [];
    
    // Add header row
    data.push(['Sr.', 'Description', 'Actual Size (IN)', 'Actual Size (MM)', 
               'Chargeable Size (IN)', 'Chargeable Size (MM)', 'Qty', 'Area', 'Rate', 'Amount']);
    
    // Add only filled rows
    let rowCount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const actualWMm = row.querySelector('.actual-mm-w').value;
        const actualHMm = row.querySelector('.actual-mm-h').value;
        const chargeWIn = row.querySelector('.charge-in-w').value;
        const chargeHIn = row.querySelector('.charge-in-h').value;
        const chargeWMm = row.querySelector('.charge-mm-w').value;
        const chargeHMm = row.querySelector('.charge-mm-h').value;
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        
        // Only add row if description or size is filled
        if(desc || actualWIn || actualHIn || actualWMm || actualHMm) {
            rowCount++;
            data.push([
                rowCount,
                desc,
                `${actualWIn} × ${actualHIn}`,
                `${actualWMm} × ${actualHMm}`,
                `${chargeWIn} × ${chargeHIn}`,
                `${chargeWMm} × ${chargeHMm}`,
                parseFloat(qty) || 0,
                parseFloat(area) || 0,
                parseFloat(rate) || 0,
                parseFloat(amount) || 0
            ]);
        }
    });
    
    // Add summary
    data.push([]);
    data.push(['SUMMARY']);
    data.push(['Total Items:', rowCount]);
    data.push(['Total Area:', document.getElementById('totalArea').textContent]);
    data.push(['Basic Amount:', document.getElementById('basicAmount').textContent]);
    data.push(['Additional Charges:', document.getElementById('additionalCharges').textContent]);
    data.push(['GST:', document.getElementById('gstAmount').textContent]);
    data.push(['GRAND TOTAL:', document.getElementById('grandTotal').textContent]);
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Proforma');
    
    // Save file
    const fileName = document.getElementById('proformaNo').value + '.xlsx';
    XLSX.writeFile(wb, fileName);
    
    alert('Excel file exported successfully!');
}

// Generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text('GLASS WORKS', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Address Line 1, Address Line 2, City, State - PIN', 105, 22, { align: 'center' });
    doc.text('Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5', 105, 28, { align: 'center' });
    
    // Proforma details
    doc.setFontSize(14);
    doc.text('PROFORMA INVOICE', 105, 38, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`Proforma No.: ${document.getElementById('proformaNo').value}`, 15, 45);
    doc.text(`Date: ${document.getElementById('proformaDate').value}`, 15, 50);
    doc.text(`GST Mode: ${document.getElementById('gstMode').value}`, 15, 55);
    
    // Party details
    doc.text('Bill To:', 15, 65);
    const billName = document.getElementById('billName').value || '';
    const billAddress = document.getElementById('billAddress').value || '';
    doc.text(billName, 15, 70);
    doc.text(billAddress, 15, 75, { maxWidth: 80 });
    
    // Table header
    let yPos = 90;
    doc.setFillColor(200, 200, 200);
    doc.rect(10, yPos, 190, 8, 'F');
    yPos += 5;
    
    // Check print options
    const showActual = document.getElementById('printShowActual').checked;
    const showChargeable = document.getElementById('printShowChargeable').checked;
    
    // Draw columns based on options
    let xPos = 12;
    doc.text('Sr.', xPos, yPos);
    xPos += 10;
    doc.text('Description', xPos, yPos);
    xPos += 40;
    
    if(showActual) {
        doc.text('Actual Size', xPos, yPos);
        xPos += 25;
    }
    
    if(showChargeable) {
        doc.text('Chargeable Size', xPos, yPos);
        xPos += 25;
    }
    
    doc.text('Qty', xPos, yPos);
    xPos += 15;
    doc.text('Area', xPos, yPos);
    xPos += 20;
    doc.text('Rate', xPos, yPos);
    xPos += 20;
    doc.text('Amount', xPos, yPos);
    
    // Table data
    yPos += 8;
    let rowCount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const chargeWIn = row.querySelector('.charge-in-w').value;
        const chargeHIn = row.querySelector('.charge-in-h').value;
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        
        if(desc || actualWIn || actualHIn) {
            rowCount++;
            
            // Check page break
            if(yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            xPos = 12;
            doc.text(rowCount.toString(), xPos, yPos);
            xPos += 10;
            
            doc.text(desc || '', xPos, yPos, { maxWidth: 35 });
            xPos += 40;
            
            if(showActual) {
                doc.text(`${actualWIn}×${actualHIn}`, xPos, yPos);
                xPos += 25;
            }
            
            if(showChargeable) {
                doc.text(`${chargeWIn}×${chargeHIn}`, xPos, yPos);
                xPos += 25;
            }
            
            doc.text(qty, xPos, yPos);
            xPos += 15;
            doc.text(area, xPos, yPos);
            xPos += 20;
            doc.text(rate, xPos, yPos);
            xPos += 20;
            doc.text(amount, xPos, yPos);
            
            yPos += 7;
        }
    });
    
    // Summary
    if(document.getElementById('printShowSummary').checked) {
        yPos += 10;
        doc.setFontSize(10);
        doc.text('Summary:', 15, yPos);
        yPos += 7;
        
        doc.text(`Total Area: ${document.getElementById('totalArea').textContent}`, 150, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Basic Amount: ${document.getElementById('basicAmount').textContent}`, 150, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Additional Charges: ${document.getElementById('additionalCharges').textContent}`, 150, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`GST: ${document.getElementById('gstAmount').textContent}`, 150, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`GRAND TOTAL: ${document.getElementById('grandTotal').textContent}`, 150, yPos, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`${document.getElementById('proformaNo').value}.pdf`);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('printOptionsModal')).hide();
}

// Utility functions
function scrollToFirstEmpty() {
    const rows = document.querySelectorAll('#productTableBody tr');
    for(let i = 0; i < rows.length; i++) {
        const desc = rows[i].querySelector('.desc').value.trim();
        const sizeW = rows[i].querySelector('.actual-in-w').value.trim();
        const sizeH = rows[i].querySelector('.actual-in-h').value.trim();
        
        if(!desc && !sizeW && !sizeH) {
            rows[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
            rows[i].querySelector('.desc').focus();
            break;
        }
    }
}

function addMoreRows(count) {
    const currentRows = document.querySelectorAll('#productTableBody tr').length;
    const tbody = document.getElementById('productTableBody');
    
    for(let i = 1; i <= count; i++) {
        const rowNum = currentRows + i;
        const row = document.createElement('tr');
        row.id = `row-${rowNum}`;
        row.innerHTML = `
            <td class="text-center">${rowNum}</td>
            <td><input type="text" class="form-control form-control-sm desc" placeholder="Description"></td>
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1"><input type="text" class="form-control form-control-sm actual-in-w" placeholder="W"></div>
                    <div class="col-6 ps-1"><input type="text" class="form-control form-control-sm actual-in-h" placeholder="H"></div>
                </div>
            </td>
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1"><input type="number" class="form-control form-control-sm actual-mm-w" placeholder="W mm"></div>
                    <div class="col-6 ps-1"><input type="number" class="form-control form-control-sm actual-mm-h" placeholder="H mm"></div>
                </div>
            </td>
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1"><input type="text" class="form-control form-control-sm charge-in-w" placeholder="W" readonly></div>
                    <div class="col-6 ps-1"><input type="text" class="form-control form-control-sm charge-in-h" placeholder="H" readonly></div>
                </div>
            </td>
            <td>
                <div class="row g-0">
                    <div class="col-6 pe-1"><input type="number" class="form-control form-control-sm charge-mm-w" placeholder="W mm" readonly></div>
                    <div class="col-6 ps-1"><input type="number" class="form-control form-control-sm charge-mm-h" placeholder="H mm" readonly></div>
                </div>
            </td>
            <td><input type="number" class="form-control form-control-sm qty" value="1" min="1"></td>
            <td class="text-center area-cell">0</td>
            <td><input type="number" class="form-control form-control-sm rate" value="0"></td>
            <td class="text-end amount-cell">0.00</td>
            <td class="text-center">
                <button class="btn btn-danger btn-xs" onclick="clearRow(${rowNum})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        addRowEventListeners(row, rowNum);
    }
    
    alert(`Added ${count} more rows! Total rows: ${currentRows + count}`);
}

function clearRow(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(row && confirm('Clear this row?')) {
        row.querySelector('.desc').value = '';
        row.querySelector('.actual-in-w').value = '';
        row.querySelector('.actual-in-h').value = '';
        row.querySelector('.actual-mm-w').value = '';
        row.querySelector('.actual-mm-h').value = '';
        row.querySelector('.qty').value = '1';
        row.querySelector('.rate').value = '0';
        row.querySelector('.area-cell').textContent = '0';
        row.querySelector('.amount-cell').textContent = '0.00';
        row.querySelector('.charge-in-w').value = '';
        row.querySelector('.charge-in-h').value = '';
        row.querySelector('.charge-mm-w').value = '';
        row.querySelector('.charge-mm-h').value = '';
        
        calculateTotal();
    }
}

function clearAllRows() {
    if(confirm('Clear ALL rows? This cannot be undone!')) {
        const rows = document.querySelectorAll('#productTableBody tr');
        rows.forEach(row => {
            row.querySelector('.desc').value = '';
            row.querySelector('.actual-in-w').value = '';
            row.querySelector('.actual-in-h').value = '';
            row.querySelector('.actual-mm-w').value = '';
            row.querySelector('.actual-mm-h').value = '';
            row.querySelector('.qty').value = '1';
            row.querySelector('.rate').value = '0';
            row.querySelector('.area-cell').textContent = '0';
            row.querySelector('.amount-cell').textContent = '0.00';
            row.querySelector('.charge-in-w').value = '';
            row.querySelector('.charge-in-h').value = '';
            row.querySelector('.charge-mm-w').value = '';
            row.querySelector('.charge-mm-h').value = '';
        });
        
        calculateTotal();
        alert('All rows cleared!');
    }
}

function resetAll() {
    if(confirm('Reset entire proforma? All data will be lost!')) {
        // Clear party details
        document.getElementById('billName').value = '';
        document.getElementById('billAddress').value = '';
        document.getElementById('billGST').value = '';
        document.getElementById('billPhone').value = '';
        document.getElementById('shipName').value = '';
        document.getElementById('shipAddress').value = '';
        document.getElementById('shipGST').value = '';
        document.getElementById('shipPhone').value = '';
        
        // Clear charges
        document.getElementById('packingCharges').value = '0';
        document.getElementById('freightCharges').value = '0';
        document.getElementById('otherCharges').value = '0';
        document.getElementById('gstPercent').value = '18';
        document.getElementById('roundOff').value = '0';
        document.getElementById('notes').value = '';
        
        // Clear all rows
        clearAllRows();
        
        // Generate new proforma number
        const currentNo = document.getElementById('proformaNo').value;
        const num = parseInt(currentNo.replace('PI-', '')) || 1;
        document.getElementById('proformaNo').value = `PI-${(num + 1).toString().padStart(3, '0')}`;
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proformaDate').value = today;
        
        alert('Proforma reset successfully!');
    }
}

function saveProforma() {
    alert('Proforma saved successfully! (In real system, this would save to database)');
}

function newProforma() {
    resetAll();
}
