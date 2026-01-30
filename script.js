// ... previous code ...

// Show print options modal
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

// Generate PDF with options
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Get print options
    const showChargeable = document.getElementById('printShowChargeable').checked;
    const showActual = document.getElementById('printShowActual').checked;
    const showMM = document.getElementById('printShowMM').checked;
    const showSummary = document.getElementById('printShowSummary').checked;
    const showParty = document.getElementById('printShowParty').checked;
    const showGST = document.getElementById('printShowGST').checked;
    const showNotes = document.getElementById('printShowNotes').checked;
    const landscape = document.getElementById('printLandscape').checked;
    const pageSize = document.getElementById('printPageSize').value;
    
    // Set PDF orientation
    const orientation = landscape ? 'landscape' : 'portrait';
    const doc = new jsPDF(orientation, 'mm', pageSize.split('-')[0]);
    
    // Calculate margins
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
    yPos += 8;
    
    // PARTY DETAILS (if enabled)
    if(showParty) {
        doc.setFontSize(11);
        doc.text('Bill To:', margin, yPos);
        yPos += 5;
        
        doc.setFontSize(9);
        const billName = document.getElementById('billName').value || '';
        const billAddress = document.getElementById('billAddress').value || '';
        const billGST = document.getElementById('billGST').value || '';
        
        if(billName) doc.text(billName, margin, yPos);
        yPos += 4;
        if(billAddress) doc.text(billAddress, margin, yPos, { maxWidth: contentWidth / 2 - 5 });
        yPos += 4;
        if(billGST) doc.text(`GSTIN: ${billGST}`, margin, yPos);
        yPos += 8;
    }
    
    // TABLE HEADER
    yPos += 5;
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, yPos, contentWidth, 8, 'F');
    yPos += 2;
    
    doc.setFontSize(9);
    let xPos = margin + 5;
    
    // Determine columns based on options
    const columns = [];
    const colWidths = [];
    
    // Always show Sr. and Description
    columns.push('Sr.');
    colWidths.push(10);
    
    columns.push('Description');
    colWidths.push(showChargeable && showActual ? 40 : 60);
    
    // Show sizes based on options
    if(showActual) {
        if(showMM) {
            columns.push('Actual (MM)');
            colWidths.push(25);
        } else {
            columns.push('Actual (IN)');
            colWidths.push(25);
        }
    }
    
    if(showChargeable) {
        if(showMM) {
            columns.push('Chargeable (MM)');
            colWidths.push(25);
        } else {
            columns.push('Chargeable (IN)');
            colWidths.push(25);
        }
    }
    
    // Always show Qty, Area, Rate, Amount
    columns.push('Qty', 'Area', 'Rate', 'Amount');
    colWidths.push(15, 20, 20, 25);
    
    // Draw column headers
    xPos = margin + 5;
    columns.forEach((col, index) => {
        doc.text(col, xPos, yPos);
        xPos += colWidths[index];
    });
    
    yPos += 8;
    
    // TABLE DATA - ONLY FILLED ROWS
    let rowCount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const actualWMm = row.querySelector('.actual-mm-w').value.trim();
        const actualHMm = row.querySelector('.actual-mm-h').value.trim();
        const chargeWIn = row.querySelector('.charge-in-w').value.trim();
        const chargeHIn = row.querySelector('.charge-in-h').value.trim();
        const chargeWMm = row.querySelector('.charge-mm-w').value.trim();
        const chargeHMm = row.querySelector('.charge-mm-h').value.trim();
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        
        // Only add row if description or size is filled
        if(desc || actualWIn || actualHIn || actualWMm || actualHMm) {
            rowCount++;
            
            // Check if we need new page
            if(yPos > pageHeight - 30) {
                doc.addPage(orientation, pageSize.split('-')[0]);
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
                    const actualSize = actualWMm && actualHMm ? 
                        `${actualWMm}×${actualHMm}` : '';
                    doc.text(actualSize, xPos, yPos);
                } else {
                    const actualSize = actualWIn && actualHIn ? 
                        `${actualWIn}×${actualHIn}` : '';
                    doc.text(actualSize, xPos, yPos);
                }
                xPos += colWidths[2];
            }
            
            // Chargeable Size
            if(showChargeable) {
                const chargeIndex = showActual ? 3 : 2;
                if(showMM) {
                    const chargeSize = chargeWMm && chargeHMm ? 
                        `${chargeWMm}×${chargeHMm}` : '';
                    doc.text(chargeSize, xPos, yPos);
                } else {
                    const chargeSize = chargeWIn && chargeHIn ? 
                        `${chargeWIn}×${chargeHIn}` : '';
                    doc.text(chargeSize, xPos, yPos);
                }
                xPos += colWidths[chargeIndex];
            }
            
            // Qty, Area, Rate, Amount
            const startIndex = 2 + (showActual ? 1 : 0) + (showChargeable ? 1 : 0);
            doc.text(qty, xPos, yPos);
            xPos += colWidths[startIndex];
            
            doc.text(area, xPos, yPos);
            xPos += colWidths[startIndex + 1];
            
            doc.text(rate, xPos, yPos);
            xPos += colWidths[startIndex + 2];
            
            doc.text(amount, xPos, yPos);
            
            yPos += 6;
        }
    });
    
    // SUMMARY (if enabled)
    if(showSummary && rowCount > 0) {
        yPos += 10;
        
        // Draw line
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
        
        // Summary table
        doc.setFontSize(10);
        doc.text('Summary:', margin, yPos);
        yPos += 6;
        
        doc.text(`Total Area: ${document.getElementById('totalArea').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        
        doc.text(`Basic Amount: ${document.getElementById('basicAmount').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        
        doc.text(`Fabrication: ${document.getElementById('fabAmount').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        
        doc.text(`Other Charges: ${document.getElementById('otherAmount').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        
        doc.text(`Sub Total: ${document.getElementById('subTotal').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        
        if(showGST) {
            doc.text(`GST: ${document.getElementById('gstAmount').textContent}`, 
                    pageWidth - margin, yPos, { align: 'right' });
            yPos += 5;
        }
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`GRAND TOTAL: ${document.getElementById('grandTotal').textContent}`, 
                pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
    }
    
    // NOTES (if enabled)
    if(showNotes) {
        const notes = document.getElementById('notes').value;
        if(notes) {
            doc.setFontSize(9);
            doc.text('Notes:', margin, yPos);
            yPos += 5;
            doc.text(notes, margin, yPos, { maxWidth: contentWidth });
        }
    }
    
    // FOOTER
    yPos = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('Terms & Conditions Apply | Subject to Jurisdiction', pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    const fileName = `${document.getElementById('proformaNo').value}.pdf`;
    doc.save(fileName);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('printOptionsModal')).hide();
}

// Print proforma
function printProforma() {
    // Get print options
    const showChargeable = document.getElementById('printShowChargeable').checked;
    const showActual = document.getElementById('printShowActual').checked;
    const showMM = document.getElementById('printShowMM').checked;
    const showSummary = document.getElementById('printShowSummary').checked;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Proforma - ${document.getElementById('proformaNo').value}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    margin: 0;
                    padding: 10mm;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .company-name {
                    font-size: 18pt;
                    font-weight: bold;
                    color: #000080;
                }
                .proforma-title {
                    font-size: 16pt;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .party-details {
                    margin: 15px 0;
                    padding: 10px;
                    border: 1px solid #000;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9pt;
                    margin: 10px 0;
                }
                table th {
                    background-color: #f0f0f0;
                    border: 1px solid #000;
                    padding: 5px;
                    text-align: left;
                }
                table td {
                    border: 1px solid #000;
                    padding: 5px;
                }
                .summary {
                    margin-top: 20px;
                    border-top: 2px solid #000;
                    padding-top: 10px;
                }
                .total-row {
                    font-weight: bold;
                    font-size: 11pt;
                }
                @page {
                    margin: 10mm;
                }
                @media print {
                    body {
                        font-size: 9pt;
                    }
                    table {
                        font-size: 8pt;
                    }
                }
            </style>
        </head>
        <body>
    `);
    
    // Header
    printWindow.document.write(`
        <div class="header">
            <div class="company-name">GLASS WORKS</div>
            <div>Address Line 1, Address Line 2, City, State - PIN</div>
            <div>Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5</div>
            <div class="proforma-title">PROFORMA INVOICE</div>
            <div>
                <strong>Proforma No.:</strong> ${document.getElementById('proformaNo').value} | 
                <strong>Date:</strong> ${document.getElementById('proformaDate').value} | 
                <strong>GST Mode:</strong> ${document.getElementById('gstMode').value}
            </div>
        </div>
    `);
    
    // Party details
    printWindow.document.write(`
        <div class="party-details">
            <div style="float: left; width: 48%;">
                <strong>Bill To:</strong><br>
                ${document.getElementById('billName').value || ''}<br>
                ${document.getElementById('billAddress').value || ''}<br>
                GSTIN: ${document.getElementById('billGST').value || ''}
            </div>
            <div style="float: right; width: 48%;">
                <strong>Ship To:</strong><br>
                ${document.getElementById('shipName').value || ''}<br>
                ${document.getElementById('shipAddress').value || ''}<br>
                GSTIN: ${document.getElementById('shipGST').value || ''}
            </div>
            <div style="clear: both;"></div>
        </div>
    `);
    
    // Table header
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th>Sr.</th>');
    printWindow.document.write('<th>Description</th>');
    
    if(showActual) {
        if(showMM) {
            printWindow.document.write('<th>Actual (MM)</th>');
        } else {
            printWindow.document.write('<th>Actual (IN)</th>');
        }
    }
    
    if(showChargeable) {
        if(showMM) {
            printWindow.document.write('<th>Chargeable (MM)</th>');
        } else {
            printWindow.document.write('<th>Chargeable (IN)</th>');
        }
    }
    
    printWindow.document.write('<th>Qty</th>');
    printWindow.document.write('<th>Area</th>');
    printWindow.document.write('<th>Rate</th>');
    printWindow.document.write('<th>Amount</th>');
    printWindow.document.write('</tr></thead>');
    printWindow.document.write('<tbody>');
    
    // Table data - ONLY FILLED ROWS
    let rowCount = 0;
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const desc = row.querySelector('.desc').value.trim();
        const actualWIn = row.querySelector('.actual-in-w').value.trim();
        const actualHIn = row.querySelector('.actual-in-h').value.trim();
        const actualWMm = row.querySelector('.actual-mm-w').value.trim();
        const actualHMm = row.querySelector('.actual-mm-h').value.trim();
        const chargeWIn = row.querySelector('.charge-in-w').value.trim();
        const chargeHIn = row.querySelector('.charge-in-h').value.trim();
        const chargeWMm = row.querySelector('.charge-mm-w').value.trim();
        const chargeHMm = row.querySelector('.charge-mm-h').value.trim();
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area-cell').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount-cell').textContent;
        
        // Only add row if description or size is filled
        if(desc || actualWIn || actualHIn || actualWMm || actualHMm) {
            rowCount++;
            printWindow.document.write('<tr>');
            
            printWindow.document.write(`<td>${rowCount}</td>`);
            printWindow.document.write(`<td>${desc || ''}</td>`);
            
            if(showActual) {
                if(showMM) {
                    printWindow.document.write(`<td>${actualWMm && actualHMm ? actualWMm + '×' + actualHMm : ''}</td>`);
                } else {
                    printWindow.document.write(`<td>${actualWIn && actualHIn ? actualWIn + '×' + actualHIn : ''}</td>`);
                }
            }
            
            if(showChargeable) {
                if(showMM) {
                    printWindow.document.write(`<td>${chargeWMm && chargeHMm ? chargeWMm + '×' + chargeHMm : ''}</td>`);
                } else {
                    printWindow.document.write(`<td>${chargeWIn && chargeHIn ? chargeWIn + '×' + chargeHIn : ''}</td>`);
                }
            }
            
            printWindow.document.write(`<td>${qty}</td>`);
            printWindow.document.write(`<td>${area}</td>`);
            printWindow.document.write(`<td>${rate}</td>`);
            printWindow.document.write(`<td>${amount}</td>`);
            
            printWindow.document.write('</tr>');
        }
    });
    
    printWindow.document.write('</tbody></table>');
    
    // Summary
    if(showSummary && rowCount > 0) {
        printWindow.document.write(`
            <div class="summary">
                <table>
                    <tr>
                        <td>Total Area:</td>
                        <td>${document.getElementById('totalArea').textContent}</td>
                    </tr>
                    <tr>
                        <td>Basic Amount:</td>
                        <td>${document.getElementById('basicAmount').textContent}</td>
                    </tr>
                    <tr>
                        <td>Fabrication Charges:</td>
                        <td>${document.getElementById('fabAmount').textContent}</td>
                    </tr>
                    <tr>
                        <td>Other Charges:</td>
                        <td>${document.getElementById('otherAmount').textContent}</td>
                    </tr>
                    <tr>
                        <td>Sub Total:</td>
                        <td>${document.getElementById('subTotal').textContent}</td>
                    </tr>
                    <tr>
                        <td>GST:</td>
                        <td>${document.getElementById('gstAmount').textContent}</td>
                    </tr>
                    <tr class="total-row">
                        <td>GRAND TOTAL:</td>
                        <td>${document.getElementById('grandTotal').textContent}</td>
                    </tr>
                </table>
            </div>
        `);
    }
    
    // Footer
    printWindow.document.write(`
        <div style="margin-top: 30px; text-align: center; font-size: 8pt; color: #666;">
            <p>Thank you for your business!</p>
            <p>Terms & Conditions Apply | Subject to Jurisdiction</p>
        </div>
    `);
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Print after content loads
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('printOptionsModal')).hide();
}

// ... rest of the code remains same ...
