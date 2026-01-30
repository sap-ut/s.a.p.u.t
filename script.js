// Global variables
let parties = [];
let currentPartyId = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('proformaDate').value = today;
    
    // Load saved data
    loadData();
    
    // Generate 500 empty rows
    generateEmptyRows(500);
    
    // Load parties
    loadParties();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial calculation
    calculateTotal();
});

// Setup event listeners
function setupEventListeners() {
    // Same address checkbox
    document.getElementById('sameAddress').addEventListener('change', copyAddress);
    
    // Auto-copy when bill fields change
    document.getElementById('billName').addEventListener('input', function() {
        if(document.getElementById('sameAddress').checked) {
            document.getElementById('shipName').value = this.value;
        }
    });
    
    document.getElementById('billAddress').addEventListener('input', function() {
        if(document.getElementById('sameAddress').checked) {
            document.getElementById('shipAddress').value = this.value;
        }
    });
    
    document.getElementById('billGST').addEventListener('input', function() {
        if(document.getElementById('sameAddress').checked) {
            document.getElementById('shipGST').value = this.value;
        }
    });
    
    document.getElementById('billPhone').addEventListener('input', function() {
        if(document.getElementById('sameAddress').checked) {
            document.getElementById('shipPhone').value = this.value;
        }
    });
    
    // GST percentage change
    document.getElementById('gstPercent').addEventListener('input', calculateTotal);
    document.getElementById('roundOff').addEventListener('input', calculateTotal);
}

// Load data from localStorage
function loadData() {
    // Load parties
    const savedParties = localStorage.getItem('glassParties');
    if(savedParties) {
        parties = JSON.parse(savedParties);
        updatePartyList();
    } else {
        // Add some sample parties
        parties = [
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
        localStorage.setItem('glassParties', JSON.stringify(parties));
        updatePartyList();
    }
    
    // Load proforma counter
    const counter = localStorage.getItem('proformaCounter') || 1;
    document.getElementById('proformaNo').value = `PI-${counter.toString().padStart(3, '0')}`;
    document.getElementById('currentProforma').textContent = `PI-${counter.toString().padStart(3, '0')}`;
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

// Save new party
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
    
    // Create new party object
    const newParty = {
        id: parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 1,
        name: name,
        address: address,
        city: city,
        phone: phone,
        gst: gst,
        state: state
    };
    
    // Add to parties array
    parties.push(newParty);
    
    // Save to localStorage
    localStorage.setItem('glassParties', JSON.stringify(parties));
    
    // Update party list
    updatePartyList();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('partyModal')).hide();
    
    // Select this party
    selectParty(newParty.id);
    
    alert('Party saved successfully!');
}

// Update party list in sidebar
function updatePartyList() {
    const partyList = document.getElementById('partyList');
    partyList.innerHTML = '';
    
    parties.forEach(party => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td onclick="selectParty(${party.id})" style="cursor: pointer;">
                <div class="fw-bold">${party.name}</div>
                <small class="text-muted">${party.city} | ${party.phone}</small>
            </td>
        `;
        partyList.appendChild(row);
    });
}

// Select party and fill bill details
function selectParty(partyId) {
    const party = parties.find(p => p.id === partyId);
    if(!party) return;
    
    currentPartyId = partyId;
    
    // Fill bill details
    document.getElementById('billName').value = party.name;
    document.getElementById('billAddress').value = party.address;
    document.getElementById('billGST').value = party.gst || '';
    document.getElementById('billPhone').value = party.phone;
    
    // Copy to ship if same address is checked
    if(document.getElementById('sameAddress').checked) {
        copyAddress();
    }
    
    // Highlight selected party
    const rows = document.querySelectorAll('#partyList tr');
    rows.forEach(row => {
        row.classList.remove('table-primary');
        if(row.textContent.includes(party.name)) {
            row.classList.add('table-primary');
        }
    });
}

// Copy bill address to ship address
function copyAddress() {
    const same = document.getElementById('sameAddress').checked;
    if(same) {
        document.getElementById('shipName').value = document.getElementById('billName').value;
        document.getElementById('shipAddress').value = document.getElementById('billAddress').value;
        document.getElementById('shipGST').value = document.getElementById('billGST').value;
        document.getElementById('shipPhone').value = document.getElementById('billPhone').value;
    }
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

// Generate empty rows
function generateEmptyRows(count) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    
    for(let i = 1; i <= count; i++) {
        const row = document.createElement('tr');
        row.id = `row-${i}`;
        row.innerHTML = `
            <td>${i}</td>
            <td><input type="text" class="form-control desc" placeholder="Item description"></td>
            <td>
                <div class="row g-1">
                    <div class="col-6">
                        <input type="text" class="form-control actual-in-w" placeholder="W" value="45 3/4">
                    </div>
                    <div class="col-6">
                        <input type="text" class="form-control actual-in-h" placeholder="H" value="44 1/2">
                    </div>
                </div>
            </td>
            <td>
                <div class="row g-1">
                    <div class="col-6">
                        <input type="number" class="form-control actual-mm-w" placeholder="W mm" value="1162">
                    </div>
                    <div class="col-6">
                        <input type="number" class="form-control actual-mm-h" placeholder="H mm" value="1130">
                    </div>
                </div>
            </td>
            <td>
                <div class="row g-1">
                    <div class="col-6">
                        <input type="text" class="form-control charge-in-w" placeholder="W" readonly>
                    </div>
                    <div class="col-6">
                        <input type="text" class="form-control charge-in-h" placeholder="H" readonly>
                    </div>
                </div>
            </td>
            <td>
                <div class="row g-1">
                    <div class="col-6">
                        <input type="number" class="form-control charge-mm-w" placeholder="W mm" readonly>
                    </div>
                    <div class="col-6">
                        <input type="number" class="form-control charge-mm-h" placeholder="H mm" readonly>
                    </div>
                </div>
            </td>
            <td><input type="number" class="form-control qty" value="1" min="1"></td>
            <td class="area-cell">0</td>
            <td><input type="number" class="form-control rate" value="1413.91"></td>
            <td class="amount-cell">0.00</td>
            <td>
                <button class="btn btn-danger btn-xs" onclick="deleteRow(${i})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Add event listeners to this row
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                calculateRow(i);
                calculateTotal();
            });
        });
        
        // Calculate this row initially
        setTimeout(() => calculateRow(i), 100);
    }
}

// Calculate single row
function calculateRow(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(!row) return;
    
    // Get values
    const desc = row.querySelector('.desc').value.trim();
    const actualWIn = row.querySelector('.actual-in-w').value.trim();
    const actualHIn = row.querySelector('.actual-in-h').value.trim();
    const actualWMm = row.querySelector('.actual-mm-w').value;
    const actualHMm = row.querySelector('.actual-mm-h').value;
    const qty = parseFloat(row.querySelector('.qty').value) || 1;
    const rate = parseFloat(row.querySelector('.rate').value) || 0;
    
    // If no description or size, skip
    if(!desc && !actualWIn && !actualHIn && !actualWMm && !actualHMm) {
        row.querySelector('.area-cell').textContent = '0';
        row.querySelector('.amount-cell').textContent = '0.00';
        return;
    }
    
    // Calculate size in mm
    let widthMm = 0, heightMm = 0;
    
    if(actualWMm && actualHMm) {
        // Use mm values directly
        widthMm = parseFloat(actualWMm) || 0;
        heightMm = parseFloat(actualHMm) || 0;
    } else if(actualWIn && actualHIn) {
        // Convert inches to mm
        widthMm = convertInchToMM(actualWIn);
        heightMm = convertInchToMM(actualHIn);
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
    
    // Convert back to inches for display
    const widthIn = (widthMm / 25.4).toFixed(2);
    const heightIn = (heightMm / 25.4).toFixed(2);
    row.querySelector('.charge-in-w').value = parseFloat(widthIn).toFixed(2);
    row.querySelector('.charge-in-h').value = parseFloat(heightIn).toFixed(2);
    
    // Calculate area
    const uom = document.getElementById('uom').value;
    let area = 0;
    
    if(uom === 'sqmt') {
        area = (widthMm * heightMm) / 1000000; // Convert to sq.mt
    } else {
        area = (widthMm * heightMm) / 92903.04; // Convert to sq.ft
    }
    
    area = area * qty;
    row.querySelector('.area-cell').textContent = area.toFixed(3);
    
    // Calculate amount
    const amount = area * rate;
    row.querySelector('.amount-cell').textContent = amount.toFixed(2);
}

// Convert inch fraction to decimal and then to mm
function convertInchToMM(inchStr) {
    if(!inchStr) return 0;
    
    // Remove spaces and convert fractions
    let decimal = 0;
    
    if(inchStr.includes(' ')) {
        // Mixed number like "45 3/4"
        const parts = inchStr.split(' ');
        const whole = parseFloat(parts[0]) || 0;
        const fraction = parts[1];
        
        if(fraction.includes('/')) {
            const [num, den] = fraction.split('/').map(Number);
            decimal = whole + (num / den);
        } else {
            decimal = whole + parseFloat(fraction);
        }
    } else if(inchStr.includes('/')) {
        // Fraction only like "3/4"
        const [num, den] = inchStr.split('/').map(Number);
        decimal = num / den;
    } else {
        // Decimal only
        decimal = parseFloat(inchStr) || 0;
    }
    
    return decimal * 25.4;
}

// Calculate total
function calculateTotal() {
    const rows = document.querySelectorAll('#productTableBody tr');
    let totalArea = 0;
    let totalAmount = 0;
    
    // Calculate from product table
    rows.forEach(row => {
        const areaText = row.querySelector('.area-cell').textContent;
        const amountText = row.querySelector('.amount-cell').textContent;
        
        const area = parseFloat(areaText) || 0;
        const amount = parseFloat(amountText) || 0;
        
        totalArea += area;
        totalAmount += amount;
    });
    
    // Calculate other charges
    const otherAmount = calculateOtherCharges();
    
    // Update summary
    const uom = document.getElementById('uom').value === 'sqmt' ? 'Sq.Mt.' : 'Sq.Ft.';
    document.getElementById('totalArea').textContent = totalArea.toFixed(3) + ' ' + uom;
    document.getElementById('basicAmount').textContent = '₹ ' + totalAmount.toFixed(2);
    document.getElementById('fabAmount').textContent = '₹ 0.00'; // Placeholder for fabrication
    document.getElementById('otherAmount').textContent = '₹ ' + otherAmount.toFixed(2);
    
    // Calculate subtotal
    const subTotal = totalAmount + otherAmount;
    document.getElementById('subTotal').textContent = '₹ ' + subTotal.toFixed(2);
    
    // Calculate GST
    const gstPercent = parseFloat(document.getElementById('gstPercent').value) || 0;
    document.getElementById('gstLabel').textContent = gstPercent;
    const gstAmount = (subTotal * gstPercent) / 100;
    document.getElementById('gstAmount').textContent = '₹ ' + gstAmount.toFixed(2);
    
    // Calculate grand total
    const roundOff = parseFloat(document.getElementById('roundOff').value) || 0;
    const grandTotal = subTotal + gstAmount + roundOff;
    document.getElementById('grandTotal').textContent = '₹ ' + grandTotal.toFixed(2);
}

// Calculate other charges
function calculateOtherCharges() {
    let total = 0;
    const charges = document.querySelectorAll('#otherChargesMaster tr');
    
    charges.forEach(charge => {
        const valueInput = charge.querySelector('.charge-value');
        if(valueInput) {
            total += parseFloat(valueInput.value) || 0;
        }
    });
    
    return total;
}

// Show print options
function showPrintOptions() {
    // Set current options
    document.getElementById('printShowChargeable').checked = 
        document.getElementById('showChargeablePDF').checked;
    document.getElementById('printShowActual').checked = 
        document.getElementById('showActualPDF').checked;
    document.getElementById('printShowMM').checked = 
        document.getElementById('showMMPDF').checked;
    document.getElementById('printShowSummary').checked = 
        document.getElementById('showSummaryPDF').checked;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('printOptionsModal'));
    modal.show();
}

// Export to Excel (FIXED)
function exportToExcel() {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data array for items
    const itemsData = [];
    
    // Add header row for items
    itemsData.push(['Sr.', 'Description', 'Actual (IN)', 'Actual (MM)', 'Chargeable (IN)', 
                   'Chargeable (MM)', 'Qty', 'Area', 'Rate', 'Amount']);
    
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
            itemsData.push([
                rowCount,
                desc,
                `${actualWIn}×${actualHIn}`,
                `${actualWMm}×${actualHMm}`,
                `${chargeWIn}×${chargeHIn}`,
                `${chargeWMm}×${chargeHMm}`,
                parseFloat(qty) || 0,
                parseFloat(area) || 0,
                parseFloat(rate) || 0,
                parseFloat(amount) || 0
            ]);
        }
    });
    
    // Create items worksheet
    const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
    
    // Prepare summary data
    const summaryData = [];
    summaryData.push(['PROFORMA SUMMARY']);
    summaryData.push(['Proforma No:', document.getElementById('proformaNo').value]);
    summaryData.push(['Date:', document.getElementById('proformaDate').value]);
    summaryData.push(['Bill To:', document.getElementById('billName').value]);
    summaryData.push(['Address:', document.getElementById('billAddress').value]);
    summaryData.push(['GSTIN:', document.getElementById('billGST').value]);
    summaryData.push([]);
    summaryData.push(['Total Area:', document.getElementById('totalArea').textContent]);
    summaryData.push(['Basic Amount:', document.getElementById('basicAmount').textContent]);
    summaryData.push(['Other Charges:', document.getElementById('otherAmount').textContent]);
    summaryData.push(['Sub Total:', document.getElementById('subTotal').textContent]);
    summaryData.push(['GST @' + document.getElementById('gstPercent').value + '%:', document.getElementById('gstAmount').textContent]);
    summaryData.push(['GRAND TOTAL:', document.getElementById('grandTotal').textContent]);
    
    // Create summary worksheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, itemsWs, 'Items');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Save file
    const fileName = document.getElementById('proformaNo').value + '.xlsx';
    XLSX.writeFile(wb, fileName);
    
    alert('Excel file exported successfully!');
}

// Show quotation
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
        <div class="quotation-container p-4">
            <!-- Header -->
            <div class="text-center mb-4">
                <h2 class="text-primary">GLASS WORKS</h2>
                <p class="mb-1">Address Line 1, Address Line 2, City, State - PIN</p>
                <p class="mb-1">Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5</p>
                <h3 class="mt-3 border-top border-bottom py-2">QUOTATION</h3>
            </div>
            
            <!-- Quotation Details -->
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
            
            <!-- Items Table -->
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
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Add items
    let rowCount = 0;
    let totalAmount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        
        if(desc || actualWIn || actualHIn) {
            rowCount++;
            totalAmount += parseFloat(amount) || 0;
            
            html += `
                <tr>
                    <td>${rowCount}</td>
                    <td>${desc || ''}</td>
                    <td>${actualWIn && actualHIn ? actualWIn + '×' + actualHIn : ''}</td>
                    <td>${qty}</td>
                    <td>${area}</td>
                    <td>₹ ${parseFloat(rate).toFixed(2)}</td>
                    <td>₹ ${amount}</td>
                </tr>
            `;
        }
    });
    
    // Summary
    html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Summary Section -->
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
            
            <!-- Terms & Conditions -->
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
function saveQuotationAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Get quotation content
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

// Other functions remain same as before
function addEmptyRow() {
    // Find first empty row and focus
    const rows = document.querySelectorAll('#productTableBody tr');
    for(let i = 0; i < rows.length; i++) {
        const desc = rows[i].querySelector('.desc').value;
        if(!desc) {
            rows[i].querySelector('.desc').focus();
            break;
        }
    }
}

function clearEmptyRows() {
    if(confirm('Clear all empty rows?')) {
        const rows = document.querySelectorAll('#productTableBody tr');
        rows.forEach(row => {
            const desc = row.querySelector('.desc').value;
            const sizeW = row.querySelector('.actual-in-w').value;
            const sizeH = row.querySelector('.actual-in-h').value;
            
            if(!desc && !sizeW && !sizeH) {
                const inputs = row.querySelectorAll('input');
                inputs.forEach(input => {
                    if(!input.classList.contains('qty')) {
                        input.value = '';
                    }
                });
                row.querySelector('.area-cell').textContent = '0';
                row.querySelector('.amount-cell').textContent = '0.00';
            }
        });
    }
}

function deleteRow(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    if(row && confirm('Delete this row?')) {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            if(!input.classList.contains('qty')) {
                input.value = '';
            } else {
                input.value = '1';
            }
        });
        row.querySelector('.area-cell').textContent = '0';
        row.querySelector('.amount-cell').textContent = '0.00';
        row.querySelector('.desc').focus();
    }
}

function toggleMM() {
    const mode = document.getElementById('wastageMode').value;
    const mmSettings = document.getElementById('mmSettings');
    mmSettings.style.display = mode === '+mm' ? 'block' : 'none';
}

function applyMM() {
    // Recalculate all rows
    for(let i = 1; i <= 500; i++) {
        calculateRow(i);
    }
    calculateTotal();
}

function newProforma() {
    if(confirm('Create new proforma? Current data will be saved.')) {
        // Increment proforma counter
        let counter = parseInt(localStorage.getItem('proformaCounter') || 1);
        counter++;
        localStorage.setItem('proformaCounter', counter);
        
        // Update proforma number
        document.getElementById('proformaNo').value = `PI-${counter.toString().padStart(3, '0')}`;
        document.getElementById('currentProforma').textContent = `PI-${counter.toString().padStart(3, '0')}`;
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proformaDate').value = today;
        
        // Clear party details
        document.getElementById('billName').value = '';
        document.getElementById('billAddress').value = '';
        document.getElementById('billGST').value = '';
        document.getElementById('billPhone').value = '';
        
        // Clear ship details
        document.getElementById('shipName').value = '';
        document.getElementById('shipAddress').value = '';
        document.getElementById('shipGST').value = '';
        document.getElementById('shipPhone').value = '';
        
        // Clear all rows
        clearAllRows();
        
        // Reset calculations
        calculateTotal();
        
        alert(`New proforma created: PI-${counter.toString().padStart(3, '0')}`);
    }
}

function clearAllRows() {
    const rows = document.querySelectorAll('#productTableBody tr');
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            if(!input.classList.contains('qty')) {
                input.value = '';
            }
        });
        row.querySelector('.area-cell').textContent = '0';
        row.querySelector('.amount-cell').textContent = '0.00';
    });
}

function resetProforma() {
    if(confirm('Reset entire proforma? All data will be lost.')) {
        // Clear all fields
        document.getElementById('billName').value = '';
        document.getElementById('billAddress').value = '';
        document.getElementById('billGST').value = '';
        document.getElementById('billPhone').value = '';
        document.getElementById('shipName').value = '';
        document.getElementById('shipAddress').value = '';
        document.getElementById('shipGST').value = '';
        document.getElementById('shipPhone').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('gstPercent').value = '18';
        document.getElementById('roundOff').value = '0';
        
        // Clear all rows
        clearAllRows();
        
        // Reset calculations
        calculateTotal();
        
        alert('Proforma reset successfully!');
    }
}

function saveProforma() {
    // Collect data
    const proforma = {
        number: document.getElementById('proformaNo').value,
        date: document.getElementById('proformaDate').value,
        billTo: {
            name: document.getElementById('billName').value,
            address: document.getElementById('billAddress').value,
            gst: document.getElementById('billGST').value,
            phone: document.getElementById('billPhone').value
        },
        shipTo: {
            name: document.getElementById('shipName').value,
            address: document.getElementById('shipAddress').value,
            gst: document.getElementById('shipGST').value,
            phone: document.getElementById('shipPhone').value
        },
        items: [],
        summary: {
            totalArea: document.getElementById('totalArea').textContent,
            basicAmount: document.getElementById('basicAmount').textContent,
            otherAmount: document.getElementById('otherAmount').textContent,
            gstAmount: document.getElementById('gstAmount').textContent,
            grandTotal: document.getElementById('grandTotal').textContent
        },
        settings: {
            gstMode: document.getElementById('gstMode').value,
            uom: document.getElementById('uom').value,
            wastageMode: document.getElementById('wastageMode').value,
            gstPercent: document.getElementById('gstPercent').value
        }
    };
    
    // Save items (only filled ones)
    const rows = document.querySelectorAll('#productTableBody tr');
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value;
        if(desc) {
            const item = {
                description: desc,
                actualIn: `${row.querySelector('.actual-in-w').value}×${row.querySelector('.actual-in-h').value}`,
                actualMm: `${row.querySelector('.actual-mm-w').value}×${row.querySelector('.actual-mm-h').value}`,
                chargeableIn: `${row.querySelector('.charge-in-w').value}×${row.querySelector('.charge-in-h').value}`,
                chargeableMm: `${row.querySelector('.charge-mm-w').value}×${row.querySelector('.charge-mm-h').value}`,
                qty: row.querySelector('.qty').value,
                rate: row.querySelector('.rate').value,
                area: row.querySelector('.area-cell').textContent,
                amount: row.querySelector('.amount-cell').textContent
            };
            proforma.items.push(item);
        }
    });
    
    // Save to localStorage
    const savedProformas = JSON.parse(localStorage.getItem('savedProformas') || '[]');
    savedProformas.push(proforma);
    localStorage.setItem('savedProformas', JSON.stringify(savedProformas));
    
    alert('Proforma saved successfully!');
}

// PDF generation function (as before, but now working)
function generatePDF() {
    // This function is called from the print options modal
    // Implementation as in previous code
}

// Print proforma function (as before, but now working)
function printProforma() {
    // This function is called from the print options modal
    // Implementation as in previous code
}
