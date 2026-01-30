// Initialize system
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('proformaDate').value = today;
    
    // Generate initial 100 rows WITH REMARKS COLUMN
    generateProductRows(100);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial calculation
    calculateTotal();
});

// Generate product rows WITH REMARKS
function generateProductRows(count) {
    const tbody = document.getElementById('productTableBody');
    
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
            
            <!-- REMARKS COLUMN (NEW) -->
            <td>
                <input type="text" class="form-control form-control-sm remarks" 
                       placeholder="Enter remarks..." 
                       value="${i === 1 ? 'Process (+), CEP' : ''}">
            </td>
            
            <!-- ACTION -->
            <td class="text-center">
                <button class="btn btn-danger btn-xs" onclick="clearRow(${i})" title="Clear Row">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Add event listeners
        addRowEventListeners(row, i);
    }
    
    // Calculate first row if it has data
    setTimeout(() => {
        const firstRow = document.getElementById('row-1');
        if(firstRow) calculateRow(1);
    }, 100);
}

// Add event listeners to a row
function addRowEventListeners(row, rowNum) {
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // For remarks, no need to calculate, just update
            if(!this.classList.contains('remarks')) {
                calculateRow(rowNum);
                calculateTotal();
            }
        });
    });
    
    // Auto convert inches to mm
    row.querySelector('.actual-in-w').addEventListener('blur', function() {
        convertInchToMM(rowNum, 'w');
    });
    row.querySelector('.actual-in-h').addEventListener('blur', function() {
        convertInchToMM(rowNum, 'h');
    });
    
    // Auto convert mm to inches
    row.querySelector('.actual-mm-w').addEventListener('blur', function() {
        convertMMToInch(rowNum, 'w');
    });
    row.querySelector('.actual-mm-h').addEventListener('blur', function() {
        convertMMToInch(rowNum, 'h');
    });
}

// Toggle +MM option
function toggleAddMM() {
    const enableAddMM = document.getElementById('enableAddMM').checked;
    const mmSettings = document.getElementById('mmSettings');
    mmSettings.style.display = enableAddMM ? 'block' : 'none';
    
    // Recalculate all rows if toggled
    if(enableAddMM) {
        applyAddMMToAll();
    } else {
        // If disabled, recalculate without +MM
        calculateAllRows();
    }
}

// Apply +MM to all rows
function applyAddMMToAll() {
    calculateAllRows();
    calculateTotal();
}

// Calculate single row (Updated for separate Width/Height MM)
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
    
    // Calculate size in mm
    let widthMm = 0, heightMm = 0;
    
    if(actualWMm && actualHMm) {
        widthMm = parseFloat(actualWMm) || 0;
        heightMm = parseFloat(actualHMm) || 0;
    } else if(actualWIn && actualHIn) {
        widthMm = convertFractionToMM(actualWIn);
        heightMm = convertFractionToMM(actualHIn);
    }
    
    // Apply +MM (separate for width and height) if enabled
    const enableAddMM = document.getElementById('enableAddMM').checked;
    if(enableAddMM) {
        const addMMWidth = parseFloat(document.getElementById('addMMWidth').value) || 0;
        const addMMHeight = parseFloat(document.getElementById('addMMHeight').value) || 0;
        widthMm += addMMWidth;
        heightMm += addMMHeight;
    }
    
    // Apply other wastage modes
    const wastageMode = document.getElementById('wastageMode').value;
    if(wastageMode === 'round') {
        // Round off logic
        widthMm = Math.round(widthMm);
        heightMm = Math.round(heightMm);
    } else if(wastageMode === 'evenin') {
        // Even inches logic
        widthMm = Math.ceil(widthMm / 25.4) * 25.4;
        heightMm = Math.ceil(heightMm / 25.4) * 25.4;
    } else if(wastageMode === 'evencm') {
        // Even cm logic
        widthMm = Math.ceil(widthMm / 10) * 10;
        heightMm = Math.ceil(heightMm / 10) * 10;
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
    
    // Additional charges
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
    
    // Additional charges
    ['packingCharges', 'freightCharges', 'otherCharges', 'gstPercent', 'roundOff'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotal);
    });
}

// Convert inch to mm
function convertInchToMM(rowNum, type) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    const input = type === 'w' ? row.querySelector('.actual-in-w') : row.querySelector('.actual-in-h');
    const output = type === 'w' ? row.querySelector('.actual-mm-w') : row.querySelector('.actual-mm-h');
    
    const inchValue = input.value.trim();
    if(inchValue) {
        const mmValue = convertFractionToMM(inchValue);
        output.value = mmValue.toFixed(0);
        calculateRow(rowNum);
    }
}

// Convert mm to inch
function convertMMToInch(rowNum, type) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    const input = type === 'w' ? row.querySelector('.actual-mm-w') : row.querySelector('.actual-mm-h');
    const output = type === 'w' ? row.querySelector('.actual-in-w') : row.querySelector('.actual-in-h');
    
    const mmValue = parseFloat(input.value) || 0;
    if(mmValue > 0) {
        const inchValue = (mmValue / 25.4).toFixed(2);
        output.value = inchValue;
        calculateRow(rowNum);
    }
}

// Convert fraction string to mm
function convertFractionToMM(fractionStr) {
    if(!fractionStr) return 0;
    
    let decimal = 0;
    
    // Mixed number like "45 3/4"
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
    // Fraction only like "3/4"
    else if(fractionStr.includes('/')) {
        const [num, den] = fractionStr.split('/').map(Number);
        decimal = num / den;
    }
    // Decimal only
    else {
        decimal = parseFloat(fractionStr) || 0;
    }
    
    return decimal * 25.4;
}

// Toggle wastage
function toggleWastage() {
    // This function is kept for consistency
    calculateAllRows();
}

// Select party
function selectParty(name, address, gst, phone) {
    document.getElementById('billName').value = name;
    document.getElementById('billAddress').value = address;
    document.getElementById('billGST').value = gst || '';
    document.getElementById('billPhone').value = phone || '';
    
    // Copy to ship if same address is checked
    if(document.getElementById('sameAddress').checked) {
        copyAddress();
    }
}

// Copy address
function copyAddress() {
    document.getElementById('shipName').value = document.getElementById('billName').value;
    document.getElementById('shipAddress').value = document.getElementById('billAddress').value;
    document.getElementById('shipGST').value = document.getElementById('billGST').value;
    document.getElementById('shipPhone').value = document.getElementById('billPhone').value;
}

// Search parties
function searchParties() {
    const searchTerm = document.getElementById('searchParty').value.toLowerCase();
    const rows = document.querySelectorAll('#partyList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Show party modal
function showPartyModal() {
    // Clear form
    document.getElementById('partyName').value = '';
    document.getElementById('partyAddress').value = '';
    document.getElementById('partyCity').value = '';
    document.getElementById('partyPhone').value = '';
    document.getElementById('partyGST').value = '';
    document.getElementById('partyState').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('partyModal'));
    modal.show();
}

// Save party
function saveParty() {
    const name = document.getElementById('partyName').value.trim();
    const address = document.getElementById('partyAddress').value.trim();
    const city = document.getElementById('partyCity').value.trim();
    const phone = document.getElementById('partyPhone').value.trim();
    const gst = document.getElementById('partyGST').value.trim();
    const state = document.getElementById('partyState').value;
    
    if(!name) {
        alert('Please enter party name');
        return;
    }
    
    // Add to parties array
    const newParty = {
        id: parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 1,
        name: name,
        address: address,
        city: city,
        phone: phone,
        gst: gst,
        state: state
    };
    
    parties.push(newParty);
    
    // Save to localStorage
    localStorage.setItem('glassParties', JSON.stringify(parties));
    
    // Add to party list
    const partyList = document.getElementById('partyList');
    const row = document.createElement('tr');
    row.onclick = function() {
        selectParty(newParty.name, newParty.address, newParty.gst, newParty.phone);
    };
    row.innerHTML = `
        <td>
            <div class="fw-bold">${newParty.name}</div>
            <small class="text-muted">${newParty.city} | ${newParty.phone}</small>
        </td>
    `;
    partyList.appendChild(row);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('partyModal')).hide();
    
    // Select this party
    selectParty(newParty.name, newParty.address, newParty.gst, newParty.phone);
    
    alert('Party saved successfully!');
}

// Show print options
function showPrintOptions() {
    const modal = new bootstrap.Modal(document.getElementById('printOptionsModal'));
    modal.show();
}

// Export to Excel (WITH REMARKS)
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    // Prepare data
    const data = [];
    data.push(['Sr.', 'Description', 'Actual Size (IN)', 'Actual Size (MM)', 
               'Chargeable Size (IN)', 'Chargeable Size (MM)', 'Qty', 'Area', 'Rate', 'Amount', 'Remarks']);
    
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
        const remarks = row.querySelector('.remarks').value.trim();
        
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
                parseFloat(amount) || 0,
                remarks
            ]);
        }
    });
    
    // Add summary
    data.push([]);
    data.push(['SUMMARY']);
    data.push(['Proforma No:', document.getElementById('proformaNo').value]);
    data.push(['Date:', document.getElementById('proformaDate').value]);
    data.push(['Bill To:', document.getElementById('billName').value]);
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

// Generate PDF (WITH REMARKS OPTION)
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Get print options
    const showChargeable = document.getElementById('printShowChargeable').checked;
    const showActual = document.getElementById('printShowActual').checked;
    const showMM = document.getElementById('printShowMM').checked;
    const showRemarks = document.getElementById('printShowRemarks').checked;
    const showSummary = document.getElementById('printShowSummary').checked;
    const pageSize = document.getElementById('printPageSize').value;
    
    // Set PDF orientation
    const orientation = pageSize.includes('landscape') ? 'landscape' : 'portrait';
    const size = pageSize.includes('landscape') ? 'a4' : 'a4';
    const doc = new jsPDF(orientation, 'mm', size);
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = margin;
    
    // HEADER
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text('GLASS WORKS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Address Line 1, Address Line 2, City, State - PIN', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // PROFORMA DETAILS
    doc.setFontSize(16);
    doc.text('PROFORMA INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Proforma No.: ${document.getElementById('proformaNo').value}`, margin, yPos);
    doc.text(`Date: ${document.getElementById('proformaDate').value}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`GST Mode: ${document.getElementById('gstMode').value}`, margin, yPos);
    yPos += 10;
    
    // PARTY DETAILS
    doc.setFontSize(11);
    doc.text('Bill To:', margin, yPos);
    yPos += 5;
    
    doc.setFontSize(9);
    const billName = document.getElementById('billName').value || '';
    const billAddress = document.getElementById('billAddress').value || '';
    doc.text(billName, margin, yPos);
    yPos += 4;
    doc.text(billAddress, margin, yPos, { maxWidth: contentWidth / 2 });
    yPos += 10;
    
    // TABLE HEADER
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, yPos, contentWidth, 8, 'F');
    yPos += 2;
    
    doc.setFontSize(9);
    let xPos = margin + 5;
    
    // Determine columns
    const columns = [];
    const colWidths = [];
    
    columns.push('Sr.', 'Description');
    colWidths.push(10, showActual && showChargeable && showRemarks ? 30 : 40);
    
    if(showActual) {
        if(showMM) {
            columns.push('Actual (MM)');
            colWidths.push(20);
        } else {
            columns.push('Actual (IN)');
            colWidths.push(20);
        }
    }
    
    if(showChargeable) {
        if(showMM) {
            columns.push('Chrg (MM)');
            colWidths.push(20);
        } else {
            columns.push('Chrg (IN)');
            colWidths.push(20);
        }
    }
    
    columns.push('Qty', 'Area', 'Rate', 'Amount');
    colWidths.push(10, 15, 15, 20);
    
    if(showRemarks) {
        columns.push('Remarks');
        colWidths.push(25);
    }
    
    // Draw headers
    xPos = margin + 5;
    columns.forEach((col, index) => {
        doc.text(col, xPos, yPos);
        xPos += colWidths[index];
    });
    
    yPos += 8;
    
    // TABLE DATA
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
        const remarks = row.querySelector('.remarks').value.trim();
        
        if(desc || actualWIn || actualHIn || actualWMm || actualHMm) {
            rowCount++;
            
            if(yPos > pageHeight - 30) {
                doc.addPage(orientation, size);
                yPos = margin;
            }
            
            xPos = margin + 5;
            
            // Sr. No.
            doc.text(rowCount.toString(), xPos, yPos);
            xPos += colWidths[0];
            
            // Description
            doc.text(desc || '', xPos, yPos, { maxWidth: colWidths[1] - 5 });
            xPos += colWidths[1];
            
            // Actual Size
            if(showActual) {
                if(showMM) {
                    doc.text(`${actualWMm}×${actualHMm}`, xPos, yPos);
                } else {
                    doc.text(`${actualWIn}×${actualHIn}`, xPos, yPos);
                }
                xPos += colWidths[2];
            }
            
            // Chargeable Size
            if(showChargeable) {
                if(showMM) {
                    doc.text(`${chargeWMm}×${chargeHMm}`, xPos, yPos);
                } else {
                    doc.text(`${chargeWIn}×${chargeHIn}`, xPos, yPos);
                }
                xPos += colWidths[showActual ? 3 : 2];
            }
            
            // Qty, Area, Rate, Amount
            const baseIndex = 2 + (showActual ? 1 : 0) + (showChargeable ? 1 : 0);
            doc.text(qty, xPos, yPos);
            xPos += colWidths[baseIndex];
            
            doc.text(area, xPos, yPos);
            xPos += colWidths[baseIndex + 1];
            
            doc.text(rate, xPos, yPos);
            xPos += colWidths[baseIndex + 2];
            
            doc.text(amount, xPos, yPos);
            xPos += colWidths[baseIndex + 3];
            
            // Remarks
            if(showRemarks) {
                doc.text(remarks || '', xPos, yPos, { maxWidth: colWidths[colWidths.length - 1] - 5 });
            }
            
            yPos += 6;
        }
    });
    
    // SUMMARY
    if(showSummary && rowCount > 0) {
        yPos += 10;
        doc.setFontSize(10);
        doc.text('Summary:', margin, yPos);
        yPos += 6;
        
        doc.text(`Total Area: ${document.getElementById('totalArea').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Basic Amount: ${document.getElementById('basicAmount').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Additional Charges: ${document.getElementById('additionalCharges').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`Sub Total: ${document.getElementById('subTotal').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.text(`GST: ${document.getElementById('gstAmount').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`GRAND TOTAL: ${document.getElementById('grandTotal').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`${document.getElementById('proformaNo').value}.pdf`);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('printOptionsModal')).hide();
}

// Show quotation (WITH REMARKS)
function showQuotation() {
    calculateTotal();
    
    const quotationContent = document.getElementById('quotationContent');
    
    // Get party details
    const billName = document.getElementById('billName').value || '';
    const billAddress = document.getElementById('billAddress').value || '';
    const billGST = document.getElementById('billGST').value || '';
    const billPhone = document.getElementById('billPhone').value || '';
    
    // Generate quotation HTML
    let html = `
        <div class="quotation-container">
            <div class="text-center mb-4">
                <h2 class="text-primary">GLASS WORKS</h2>
                <p class="mb-1">Address Line 1, Address Line 2, City, State - PIN</p>
                <p class="mb-1">Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5</p>
                <h3 class="mt-3 border-top border-bottom py-2">QUOTATION</h3>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <table class="table table-sm">
                        <tr><td><strong>Quotation No:</strong></td><td>${document.getElementById('proformaNo').value}</td></tr>
                        <tr><td><strong>Date:</strong></td><td>${document.getElementById('proformaDate').value}</td></tr>
                        <tr><td><strong>GST Mode:</strong></td><td>${document.getElementById('gstMode').value}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <div class="border p-2">
                        <strong>Customer Details:</strong><br>
                        ${billName}<br>
                        ${billAddress}<br>
                        ${billPhone ? 'Phone: ' + billPhone : ''}<br>
                        ${billGST ? 'GSTIN: ' + billGST : ''}
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Sr.</th>
                            <th>Description</th>
                            <th>Size (IN)</th>
                            <th>Qty</th>
                            <th>Area</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Add items with remarks
    let rowCount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        const remarks = row.querySelector('.remarks').value.trim();
        
        if(desc || actualWIn || actualHIn) {
            rowCount++;
            
            html += `
                <tr>
                    <td>${rowCount}</td>
                    <td>${desc || ''}</td>
                    <td>${actualWIn && actualHIn ? actualWIn + '×' + actualHIn : ''}</td>
                    <td>${qty}</td>
                    <td>${area}</td>
                    <td>₹ ${parseFloat(rate).toFixed(2)}</td>
                    <td>₹ ${amount}</td>
                    <td>${remarks || ''}</td>
                </tr>
            `;
        }
    });
    
    // Summary
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6 offset-md-6">
                    <table class="table table-bordered">
                        <tr>
                            <td>Total Amount</td>
                            <td class="text-end">${document.getElementById('basicAmount').textContent}</td>
                        </tr>
                        <tr>
                            <td>GST @ ${document.getElementById('gstPercent').value}%</td>
                            <td class="text-end">${document.getElementById('gstAmount').textContent}</td>
                        </tr>
                        <tr class="table-active fw-bold">
                            <td>Grand Total</td>
                            <td class="text-end">${document.getElementById('grandTotal').textContent}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="mt-4 border-top pt-3">
                <h6>Terms & Conditions:</h6>
                <ol class="small">
                    <li>Prices are inclusive of GST</li>
                    <li>Delivery: 7-10 working days</li>
                    <li>Payment: 50% advance, 50% on delivery</li>
                    <li>Validity: 30 days from quotation date</li>
                    <li>Measurement at site to be final</li>
                </ol>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <p><strong>For GLASS WORKS</strong></p>
                        <p>Authorized Signatory</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <p>Customer Acceptance</p>
                        <p>_______________________</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    quotationContent.innerHTML = html;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('quotationModal'));
    modal.show();
}

// Print quotation
function printQuotation() {
    const printContent = document.getElementById('quotationContent').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Quotation - ${document.getElementById('proformaNo').value}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                @media print {
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <div class="no-print text-center mt-3">
                <button class="btn btn-primary" onclick="window.print()">Print</button>
                <button class="btn btn-secondary" onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Save quotation as PDF
function saveQuotationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const element = document.getElementById('quotationContent');
    
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = 290;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        doc.save(`Quotation_${document.getElementById('proformaNo').value}.pdf`);
    });
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
            <td><input type="text" class="form-control form-control-sm remarks" placeholder="Enter remarks..."></td>
            <td class="text-center">
                <button class="btn btn-danger btn-xs" onclick="clearRow(${rowNum})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        addRowEventListeners(row, rowNum);
    }
    
    alert(`Added ${count} more rows!`);
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
        row.querySelector('.remarks').value = '';
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
            row.querySelector('.remarks').value = '';
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
        document.getElementById('currentProforma').textContent = `PI-${(num + 1).toString().padStart(3, '0')}`;
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proformaDate').value = today;
        
        alert('Proforma reset successfully!');
    }
}

function saveProforma() {
    alert('Proforma saved successfully!');
}

function newProforma() {
    resetAll();
}

// Initialize parties array
let parties = JSON.parse(localStorage.getItem('glassParties')) || [
    {
        id: 1,
        name: 'Mohan Glass House',
        address: '123 Main Street, Delhi',
        city: 'Delhi',
        phone: '9876543210',
        gst: '07AABCM1234N1Z5',
        state: 'Delhi'
    },
    {
        id: 2,
        name: 'Shyam Glass Works',
        address: '456 Market Road, Noida',
        city: 'Noida',
        phone: '9876543211',
        gst: '09AAECS1234N1Z6',
        state: 'Uttar Pradesh'
    }
];
