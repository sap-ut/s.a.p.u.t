// S.A.P.U.T. GLASS WORKS - MAIN SCRIPT FILE

// GLOBAL VARIABLES
let currentProforma = [];
let currentCustomer = null;
let currentGlassType = 'C';
let customers = [];
let orders = [];
let items = [];

// GLASS TYPE DATA
const glassTypes = {
    'C': {
        name: 'Clear Float Glass',
        items: [
            { code: 'C-3MM', name: 'Clear Float 3mm', rate: 1200 },
            { code: 'C-4MM', name: 'Clear Float 4mm', rate: 1450 },
            { code: 'C-5MM', name: 'Clear Float 5mm', rate: 1650 },
            { code: 'C-6MM', name: 'Clear Float 6mm', rate: 1850 },
            { code: 'C-8MM', name: 'Clear Float 8mm', rate: 2250 },
            { code: 'C-10MM', name: 'Clear Float 10mm', rate: 2850 },
            { code: 'C-12MM', name: 'Clear Float 12mm', rate: 3400 }
        ]
    },
    'T': {
        name: 'Toughened Glass',
        items: [
            { code: 'T-5MM', name: 'Toughened 5mm', rate: 2100 },
            { code: 'T-6MM', name: 'Toughened 6mm', rate: 2350 },
            { code: 'T-8MM', name: 'Toughened 8mm', rate: 2850 },
            { code: 'T-10MM', name: 'Toughened 10mm', rate: 3450 },
            { code: 'T-12MM', name: 'Toughened 12mm', rate: 4100 }
        ]
    },
    'L': {
        name: 'Laminated Glass',
        items: [
            { code: 'L-6.38', name: 'Laminated 6.38mm', rate: 3200 },
            { code: 'L-8.38', name: 'Laminated 8.38mm', rate: 3850 },
            { code: 'L-10.38', name: 'Laminated 10.38mm', rate: 4550 }
        ]
    },
    'P': {
        name: 'Patterned Glass',
        items: [
            { code: 'P-4MM', name: 'Patterned 4mm', rate: 1850 },
            { code: 'P-5MM', name: 'Patterned 5mm', rate: 2050 },
            { code: 'P-6MM', name: 'Patterned 6mm', rate: 2250 }
        ]
    },
    'F': {
        name: 'Frosted Glass',
        items: [
            { code: 'F-4MM', name: 'Frosted 4mm', rate: 2450 },
            { code: 'F-5MM', name: 'Frosted 5mm', rate: 2650 },
            { code: 'F-6MM', name: 'Frosted 6mm', rate: 2850 }
        ]
    },
    'DG': {
        name: 'Double Glazed Unit',
        items: [
            { code: 'DG-24MM', name: 'DGU 24mm', rate: 4850 },
            { code: 'DG-28MM', name: 'DGU 28mm', rate: 5350 }
        ]
    }
};

// INITIALIZE APPLICATION
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupKeyboardShortcuts();
    generateProductTable(50);
    loadCustomers();
    loadItems();
    updateDashboardStats();
});

// INITIALIZE DATA FROM LOCALSTORAGE
function initializeData() {
    // Load customers
    const savedCustomers = localStorage.getItem('saput_customers');
    if (savedCustomers) {
        customers = JSON.parse(savedCustomers);
    } else {
        // Default customers
        customers = [
            {
                id: 1,
                name: 'Raj Glass House',
                address: '123 Main Street, Delhi',
                gst: '07AABCM1234N1Z5',
                phone: '9876543210',
                email: 'raj@glasshouse.com',
                city: 'Delhi',
                state: 'Delhi'
            },
            {
                id: 2,
                name: 'Shyam Glass Works',
                address: '456 Market Road, Noida',
                gst: '09AAECS1234N1Z6',
                phone: '9876543211',
                email: 'shyam@glassworks.com',
                city: 'Noida',
                state: 'Uttar Pradesh'
            },
            {
                id: 3,
                name: 'Mohan Glass Traders',
                address: '789 Industrial Area, Ghaziabad',
                gst: '09AABCM1234N1Z7',
                phone: '9876543212',
                email: 'mohan@glasstraders.com',
                city: 'Ghaziabad',
                state: 'Uttar Pradesh'
            }
        ];
        localStorage.setItem('saput_customers', JSON.stringify(customers));
    }
    
    // Load items
    const savedItems = localStorage.getItem('saput_items');
    if (savedItems) {
        items = JSON.parse(savedItems);
    } else {
        // Default items will be from glassTypes
        items = [];
        Object.keys(glassTypes).forEach(type => {
            glassTypes[type].items.forEach(item => {
                items.push({
                    code: item.code,
                    name: item.name,
                    type: glassTypes[type].name,
                    rate: item.rate
                });
            });
        });
        localStorage.setItem('saput_items', JSON.stringify(items));
    }
    
    // Load orders
    const savedOrders = localStorage.getItem('saput_orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// SETUP KEYBOARD SHORTCUTS
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // F9 - Calculate All
        if (e.key === 'F9') {
            e.preventDefault();
            calculateAll();
        }
        
        // Insert - Add New Row
        if (e.key === 'Insert' || (e.ctrlKey && e.key === 'n')) {
            e.preventDefault();
            addNewRow();
        }
        
        // Delete - Delete Row
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            deleteCurrentRow();
        }
        
        // Ctrl+P - Print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printProforma();
        }
        
        // Ctrl+S - Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveProforma();
        }
        
        // Ctrl+E - Export Excel
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportToExcel();
        }
        
        // Ctrl+D - Dashboard
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            showDashboard();
        }
    });
}

// NAVIGATION FUNCTIONS
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Dashboard';
    updateDashboardStats();
}

function showProforma() {
    hideAllSections();
    document.getElementById('proformaSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Proforma Invoice';
    updateCustomerSelect();
}

function showOrderManagement() {
    hideAllSections();
    document.getElementById('orderManagementSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Order Management';
    loadOrdersTable();
}

function showCustomerManagement() {
    hideAllSections();
    document.getElementById('customerManagementSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Customer Management';
    loadCustomersTable();
}

function showItemMaster() {
    hideAllSections();
    document.getElementById('itemMasterSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Item Master';
    loadItemsTable();
}

function showReports() {
    hideAllSections();
    document.getElementById('reportsSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Reports';
    generateReports();
}

function showGSTInvoice() {
    hideAllSections();
    document.getElementById('gstInvoiceSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'GST Invoice';
}

function showSettings() {
    hideAllSections();
    document.getElementById('settingsSection').style.display = 'block';
    document.getElementById('currentModule').textContent = 'Settings';
}

function hideAllSections() {
    const sections = [
        'dashboardSection',
        'proformaSection',
        'orderManagementSection',
        'customerManagementSection',
        'itemMasterSection',
        'reportsSection',
        'gstInvoiceSection',
        'settingsSection'
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) element.style.display = 'none';
    });
}

// UPDATE DASHBOARD STATISTICS
function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's Proforma Count
    const todayProformas = orders.filter(order => 
        order.date === today && order.type === 'proforma'
    ).length;
    document.getElementById('todayProformaCount').textContent = todayProformas;
    
    // Active Orders
    const activeOrders = orders.filter(order => 
        order.status === 'approved' || order.status === 'production'
    ).length;
    document.getElementById('activeOrdersCount').textContent = activeOrders;
    
    // Today's Revenue
    const todayRevenue = orders
        .filter(order => order.date === today)
        .reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('todayRevenue').textContent = '₹' + todayRevenue.toLocaleString();
    
    // Total Customers
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Recent Activities
    updateRecentActivities();
}

function updateRecentActivities() {
    const container = document.getElementById('recentActivities');
    container.innerHTML = '';
    
    const recent = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recent.forEach(order => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action';
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${order.orderNo}</h6>
                <small>${order.date}</small>
            </div>
            <p class="mb-1">${order.customerName} - ₹${order.total?.toLocaleString() || '0'}</p>
            <small class="text-muted">Status: ${order.status}</small>
        `;
        item.onclick = () => viewOrder(order.id);
        container.appendChild(item);
    });
}

// CUSTOMER MANAGEMENT
function loadCustomers() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = '<option value="">Select Customer</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} - ${customer.city}`;
        select.appendChild(option);
    });
}

function loadCustomerDetails() {
    const customerId = document.getElementById('customerSelect').value;
    if (!customerId) {
        document.getElementById('customerDetails').style.display = 'none';
        currentCustomer = null;
        return;
    }
    
    currentCustomer = customers.find(c => c.id == customerId);
    if (currentCustomer) {
        document.getElementById('customerDetails').style.display = 'block';
        document.getElementById('billToDetails').innerHTML = `
            <strong>${currentCustomer.name}</strong><br>
            ${currentCustomer.address}<br>
            ${currentCustomer.city}, ${currentCustomer.state}<br>
            GST: ${currentCustomer.gst}<br>
            Phone: ${currentCustomer.phone}<br>
            Email: ${currentCustomer.email}
        `;
        
        if (document.getElementById('sameAsBill').checked) {
            copyBillToShip();
        }
    }
}

function copyBillToShip() {
    if (document.getElementById('sameAsBill').checked && currentCustomer) {
        document.getElementById('shipToDetails').innerHTML = `
            <strong>${currentCustomer.name}</strong><br>
            ${currentCustomer.address}<br>
            ${currentCustomer.city}, ${currentCustomer.state}<br>
            GST: ${currentCustomer.gst}<br>
            Phone: ${currentCustomer.phone}
        `;
    } else {
        document.getElementById('shipToDetails').innerHTML = 'Different from billing address';
    }
}

function showAddCustomerModal() {
    // Clear form
    document.getElementById('custName').value = '';
    document.getElementById('custGST').value = '';
    document.getElementById('custAddress').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custEmail').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
}

function saveCustomer() {
    const name = document.getElementById('custName').value.trim();
    const gst = document.getElementById('custGST').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    
    if (!name) {
        alert('Please enter company name');
        return;
    }
    
    const newCustomer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        name: name,
        gst: gst,
        address: address,
        phone: phone,
        email: email,
        city: address.split(',').pop().trim() || '',
        state: ''
    };
    
    customers.push(newCustomer);
    localStorage.setItem('saput_customers', JSON.stringify(customers));
    
    // Update customer select
    loadCustomers();
    
    // Select this customer
    document.getElementById('customerSelect').value = newCustomer.id;
    loadCustomerDetails();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
    
    alert('Customer saved successfully!');
}

// PRODUCT TABLE FUNCTIONS
function generateProductTable(rows) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    
    for (let i = 1; i <= rows; i++) {
        const row = document.createElement('tr');
        row.id = `row-${i}`;
        row.innerHTML = `
            <td class="text-center">${i}</td>
            <td>
                <select class="form-select form-select-sm glass-type" 
                        onchange="updateGlassType(this, ${i})">
                    <option value="C">C</option>
                    <option value="T">T</option>
                    <option value="L">L</option>
                    <option value="P">P</option>
                    <option value="F">F</option>
                    <option value="DG">DG</option>
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm item-select" 
                        onchange="updateItemRate(this, ${i})"
                        data-row="${i}">
                    <option value="">Select Item</option>
                </select>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm actual-in-w" 
                       placeholder="W" step="0.01" onchange="calculateRow(${i})">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm actual-in-h" 
                       placeholder="H" step="0.01" onchange="calculateRow(${i})">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm actual-mm-w" 
                       placeholder="W" onchange="convertMMtoInch(${i}, 'w')">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm actual-mm-h" 
                       placeholder="H" onchange="convertMMtoInch(${i}, 'h')">
            </td>
            <td class="text-center charge-mm-w">0</td>
            <td class="text-center charge-mm-h">0</td>
            <td>
                <input type="number" class="form-control form-control-sm qty" 
                       value="1" min="1" onchange="calculateRow(${i})">
            </td>
            <td class="text-center area">0.00</td>
            <td>
                <input type="number" class="form-control form-control-sm rate" 
                       value="0" step="0.01" onchange="calculateRow(${i})">
            </td>
            <td class="text-center amount">0.00</td>
            <td>
                <input type="text" class="form-control form-control-sm remark" 
                       placeholder="Remark">
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger" onclick="deleteRow(${i})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Initialize item dropdown for this row
        updateItemDropdown(i);
    }
}

function updateGlassType(select, rowId) {
    currentGlassType = select.value;
    updateItemDropdown(rowId);
}

function updateItemDropdown(rowId) {
    const row = document.getElementById(`row-${rowId}`);
    const select = row.querySelector('.item-select');
    select.innerHTML = '<option value="">Select Item</option>';
    
    glassTypes[currentGlassType].items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.code;
        option.textContent = item.name;
        option.dataset.rate = item.rate;
        select.appendChild(option);
    });
}

function updateItemRate(select, rowId) {
    const selectedOption = select.options[select.selectedIndex];
    const rate = selectedOption.dataset.rate || 0;
    
    const row = document.getElementById(`row-${rowId}`);
    row.querySelector('.rate').value = rate;
    calculateRow(rowId);
}

function calculateRow(rowId) {
    const row = document.getElementById(`row-${rowId}`);
    if (!row) return;
    
    // Get inputs
    const widthIn = parseFloat(row.querySelector('.actual-in-w').value) || 0;
    const heightIn = parseFloat(row.querySelector('.actual-in-h').value) || 0;
    const widthMM = parseFloat(row.querySelector('.actual-mm-w').value) || 0;
    const heightMM = parseFloat(row.querySelector('.actual-mm-h').value) || 0;
    const qty = parseFloat(row.querySelector('.qty').value) || 1;
    const rate = parseFloat(row.querySelector('.rate').value) || 0;
    
    // Use MM if available, otherwise convert inches to MM
    let finalWidthMM = widthMM || (widthIn * 25.4);
    let finalHeightMM = heightMM || (heightIn * 25.4);
    
    // Add cutting allowance (3mm each side = 6mm total)
    finalWidthMM += 6;
    finalHeightMM += 6;
    
    // Calculate area in Sq.Mt.
    const areaSqMt = (finalWidthMM * finalHeightMM) / 1000000;
    const totalArea = areaSqMt * qty;
    
    // Calculate amount
    const amount = totalArea * rate;
    
    // Update display
    row.querySelector('.charge-mm-w').textContent = Math.round(finalWidthMM);
    row.querySelector('.charge-mm-h').textContent = Math.round(finalHeightMM);
    row.querySelector('.area').textContent = totalArea.toFixed(3);
    row.querySelector('.amount').textContent = amount.toFixed(2);
    
    // Store calculated values
    row.dataset.area = totalArea;
    row.dataset.amount = amount;
    
    // Update totals
    updateTotals();
    
    return amount;
}

function convertMMtoInch(rowId, dimension) {
    const row = document.getElementById(`row-${rowId}`);
    const mmInput = dimension === 'w' ? row.querySelector('.actual-mm-w') : row.querySelector('.actual-mm-h');
    const inchInput = dimension === 'w' ? row.querySelector('.actual-in-w') : row.querySelector('.actual-in-h');
    
    const mmValue = parseFloat(mmInput.value) || 0;
    if (mmValue > 0) {
        inchInput.value = (mmValue / 25.4).toFixed(2);
        calculateRow(rowId);
    }
}

function convertInchtoMM(rowId, dimension) {
    const row = document.getElementById(`row-${rowId}`);
    const inchInput = dimension === 'w' ? row.querySelector('.actual-in-w') : row.querySelector('.actual-in-h');
    const mmInput = dimension === 'w' ? row.querySelector('.actual-mm-w') : row.querySelector('.actual-mm-h');
    
    const inchValue = parseFloat(inchInput.value) || 0;
    if (inchValue > 0) {
        mmInput.value = (inchValue * 25.4).toFixed(0);
        calculateRow(rowId);
    }
}

function updateTotals() {
    const rows = document.querySelectorAll('#productTableBody tr');
    let totalArea = 0;
    let totalQty = 0;
    let totalAmount = 0;
    
    rows.forEach(row => {
        const area = parseFloat(row.dataset.area) || 0;
        const amount = parseFloat(row.dataset.amount) || 0;
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        
        totalArea += area;
        totalQty += qty;
        totalAmount += amount;
    });
    
    // Update display
    document.getElementById('totalArea').textContent = totalArea.toFixed(3) + ' Sq.Mt.';
    document.getElementById('totalQty').textContent = totalQty;
    document.getElementById('basicAmount').textContent = '₹' + totalAmount.toFixed(2);
    
    // Calculate GST and total
    const gst = totalAmount * 0.18;
    const roundOff = 0;
    const grandTotal = totalAmount + gst + roundOff;
    
    document.getElementById('subtotal').textContent = '₹' + totalAmount.toFixed(2);
    document.getElementById('gstAmount').textContent = '₹' + gst.toFixed(2);
    document.getElementById('roundOff').textContent = '₹' + roundOff.toFixed(2);
    document.getElementById('grandTotal').textContent = '₹' + grandTotal.toFixed(2);
}

function calculateAll() {
    const rows = document.querySelectorAll('#productTableBody tr');
    rows.forEach((row, index) => {
        calculateRow(index + 1);
    });
}

function addNewRow() {
    const rows = document.querySelectorAll('#productTableBody tr');
    const lastRow = rows[rows.length - 1];
    const lastRowId = parseInt(lastRow.id.replace('row-', ''));
    
    // Check if last row is empty
    const lastDesc = lastRow.querySelector('.item-select').value;
    const lastWidth = lastRow.querySelector('.actual-in-w').value;
    const lastHeight = lastRow.querySelector('.actual-in-h').value;
    
    if (!lastDesc && !lastWidth && !lastHeight) {
        // Focus on last row
        lastRow.querySelector('.item-select').focus();
        return;
    }
    
    // Add new row
    const newRowId = lastRowId + 1;
    const tbody = document.getElementById('productTableBody');
    
    const row = document.createElement('tr');
    row.id = `row-${newRowId}`;
    row.innerHTML = `
        <td class="text-center">${newRowId}</td>
        <td>
            <select class="form-select form-select-sm glass-type" 
                    onchange="updateGlassType(this, ${newRowId})">
                <option value="C">C</option>
                <option value="T">T</option>
                <option value="L">L</option>
                <option value="P">P</option>
                <option value="F">F</option>
                <option value="DG">DG</option>
            </select>
        </td>
        <td>
            <select class="form-select form-select-sm item-select" 
                    onchange="updateItemRate(this, ${newRowId})"
                    data-row="${newRowId}">
                <option value="">Select Item</option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm actual-in-w" 
                   placeholder="W" step="0.01" onchange="calculateRow(${newRowId})">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm actual-in-h" 
                   placeholder="H" step="0.01" onchange="calculateRow(${newRowId})">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm actual-mm-w" 
                   placeholder="W" onchange="convertMMtoInch(${newRowId}, 'w')">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm actual-mm-h" 
                   placeholder="H" onchange="convertMMtoInch(${newRowId}, 'h')">
        </td>
        <td class="text-center charge-mm-w">0</td>
        <td class="text-center charge-mm-h">0</td>
        <td>
            <input type="number" class="form-control form-control-sm qty" 
                   value="1" min="1" onchange="calculateRow(${newRowId})">
        </td>
        <td class="text-center area">0.00</td>
        <td>
            <input type="number" class="form-control form-control-sm rate" 
                   value="0" step="0.01" onchange="calculateRow(${newRowId})">
        </td>
        <td class="text-center amount">0.00</td>
        <td>
            <input type="text" class="form-control form-control-sm remark" 
                   placeholder="Remark">
        </td>
        <td class="text-center">
            <button class="btn btn-sm btn-danger" onclick="deleteRow(${newRowId})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    
    // Initialize dropdown
    updateItemDropdown(newRowId);
    
    // Focus on new row
    setTimeout(() => {
        row.querySelector('.item-select').focus();
    }, 100);
}

function deleteRow(rowId) {
    const row = document.getElementById(`row-${rowId}`);
    if (row && confirm('Delete this row?')) {
        // Clear all inputs
        row.querySelectorAll('input').forEach(input => {
            if (input.type !== 'button') {
                input.value = '';
            }
        });
        row.querySelector('.item-select').value = '';
        row.querySelector('.glass-type').value = 'C';
        row.querySelector('.area').textContent = '0.00';
        row.querySelector('.amount').textContent = '0.00';
        row.querySelector('.charge-mm-w').textContent = '0';
        row.querySelector('.charge-mm-h').textContent = '0';
        
        delete row.dataset.area;
        delete row.dataset.amount;
        
        updateTotals();
    }
}

function deleteCurrentRow() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.closest('tr')) {
        const row = activeElement.closest('tr');
        const rowId = parseInt(row.id.replace('row-', ''));
        deleteRow(rowId);
    }
}

// ORDER MANAGEMENT
function loadOrdersTable() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNo}</td>
            <td>${order.date}</td>
            <td>${order.customerName}</td>
            <td>${order.items?.length || 0} items</td>
            <td>₹${order.total?.toLocaleString() || '0'}</td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editOrder(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'draft': return 'secondary';
        case 'approved': return 'success';
        case 'production': return 'warning';
        case 'dispatched': return 'info';
        case 'completed': return 'primary';
        default: return 'secondary';
    }
}

// SAVE PROFORMA
function saveProforma() {
    if (!currentCustomer) {
        alert('Please select a customer first');
        return;
    }
    
    // Collect all items
    const items = [];
    const rows = document.querySelectorAll('#productTableBody tr');
    
    rows.forEach((row, index) => {
        const itemSelect = row.querySelector('.item-select');
        const desc = itemSelect.options[itemSelect.selectedIndex]?.text || '';
        const width = row.querySelector('.actual-in-w').value || row.querySelector('.actual-mm-w').value;
        const height = row.querySelector('.actual-in-h').value || row.querySelector('.actual-mm-h').value;
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount').textContent;
        const remark = row.querySelector('.remark').value;
        
        if (desc || width || height) {
            items.push({
                srNo: index + 1,
                description: desc,
                width: width,
                height: height,
                qty: qty,
                area: area,
                rate: rate,
                amount: amount,
                remark: remark
            });
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const proformaData = {
        id: orders.length + 1,
        piNumber: document.getElementById('piNumber').value,
        date: document.getElementById('piDate').value,
        customer: currentCustomer,
        items: items,
        totalArea: document.getElementById('totalArea').textContent,
        subtotal: parseFloat(document.getElementById('basicAmount').textContent.replace('₹', '')),
        gst: parseFloat(document.getElementById('gstAmount').textContent.replace('₹', '')),
        grandTotal: parseFloat(document.getElementById('grandTotal').textContent.replace('₹', '')),
        status: 'draft',
        createdAt: new Date().toISOString()
    };
    
    // Save to orders
    orders.push({
        id: proformaData.id,
        orderNo: proformaData.piNumber,
        date: proformaData.date,
        customerName: currentCustomer.name,
        type: 'proforma',
        total: proformaData.grandTotal,
        status: 'draft'
    });
    
    localStorage.setItem('saput_orders', JSON.stringify(orders));
    
    alert('Proforma saved successfully! PI Number: ' + proformaData.piNumber);
    
    // Update dashboard
    updateDashboardStats();
}

// PRINT PROFORMA
function printProforma() {
    calculateAll();
    
    const printContent = document.getElementById('proformaSection').innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Proforma Invoice - ${document.getElementById('piNumber').value}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    @page {
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                    }
                    .table th {
                        background-color: #f8f9fa !important;
                        color: #000 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .pdf-footer {
                        position: fixed;
                        bottom: 10px;
                        width: 100%;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 5px;
                    }
                }
                .company-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .company-tagline {
                    font-size: 14px;
                    color: #7f8c8d;
                }
                .invoice-title {
                    text-align: center;
                    margin: 20px 0;
                    font-size: 20px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="company-header">
                <div class="company-name">S.A.P.U.T. GLASS WORKS</div>
                <div class="company-tagline">Manufacturer & Supplier of All Types of Glass</div>
                <div>Address: Industrial Area, City, State - PIN Code</div>
                <div>Phone: 9876543210 | GSTIN: 22AAAAA0000A1Z5</div>
            </div>
            
            <div class="invoice-title">PROFORMA INVOICE</div>
            
            <div class="row mb-3">
                <div class="col-6">
                    <strong>PI No:</strong> ${document.getElementById('piNumber').value}<br>
                    <strong>Date:</strong> ${document.getElementById('piDate').value}
                </div>
                <div class="col-6 text-end">
                    ${currentCustomer ? `
                        <strong>Bill To:</strong><br>
                        ${currentCustomer.name}<br>
                        ${currentCustomer.address}<br>
                        ${currentCustomer.city}, ${currentCustomer.state}<br>
                        GST: ${currentCustomer.gst}
                    ` : 'No Customer Selected'}
                </div>
            </div>
            
            <div class="table-responsive">
                ${document.querySelector('#productTableBody').closest('.table-responsive').innerHTML}
            </div>
            
            <div class="row mt-3">
                <div class="col-6">
                    <strong>Terms & Conditions:</strong>
                    <ol style="font-size: 10px; padding-left: 15px;">
                        <li>Prices are ex-factory</li>
                        <li>Delivery: 7-10 working days</li>
                        <li>Payment: 50% advance with order</li>
                        <li>Goods once sold will not be taken back</li>
                        <li>Subject to S.A.S. Nagar jurisdiction</li>
                    </ol>
                </div>
                <div class="col-6">
                    <div class="border p-2">
                        <div class="d-flex justify-content-between">
                            <span>Total Area:</span>
                            <span>${document.getElementById('totalArea').textContent}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span>Subtotal:</span>
                            <span>${document.getElementById('subtotal').textContent}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span>GST (18%):</span>
                            <span>${document.getElementById('gstAmount').textContent}</span>
                        </div>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>GRAND TOTAL:</span>
                            <span>${document.getElementById('grandTotal').textContent}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-6">
                    <p>________________________<br>
                    Authorized Signatory<br>
                    S.A.P.U.T. Glass Works</p>
                </div>
                <div class="col-6 text-end">
                    <p>________________________<br>
                    Customer Acceptance</p>
                </div>
            </div>
            
            <div class="pdf-footer print-only">
                Powered by S.A.P.U.T. Glass Works Enterprise | ${new Date().toLocaleDateString()}
            </div>
            
            <div class="no-print text-center mt-3">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
                <button class="btn btn-secondary" onclick="window.close()">Close</button>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// GENERATE PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('S.A.P.U.T. GLASS WORKS', pageWidth / 2, margin, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(127, 140, 141);
    doc.text('Manufacturer & Supplier of All Types of Glass', pageWidth / 2, margin + 6, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Industrial Area, City, State - PIN Code | Phone: 9876543210', pageWidth / 2, margin + 12, { align: 'center' });
    doc.text('GSTIN: 22AAAAA0000A1Z5 | Email: info@saputglass.com', pageWidth / 2, margin + 17, { align: 'center' });
    
    // Invoice Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('PROFORMA INVOICE', pageWidth / 2, margin + 30, { align: 'center' });
    
    // Invoice Details
    doc.setFontSize(10);
    doc.text(`PI No: ${document.getElementById('piNumber').value}`, margin, margin + 40);
    doc.text(`Date: ${document.getElementById('piDate').value}`, margin, margin + 46);
    
    // Customer Details
    if (currentCustomer) {
        doc.text('Bill To:', pageWidth - margin, margin + 40, { align: 'right' });
        doc.text(currentCustomer.name, pageWidth - margin, margin + 46, { align: 'right' });
        doc.text(currentCustomer.address, pageWidth - margin, margin + 51, { align: 'right' });
        doc.text(`${currentCustomer.city}, ${currentCustomer.state}`, pageWidth - margin, margin + 56, { align: 'right' });
        doc.text(`GST: ${currentCustomer.gst}`, pageWidth - margin, margin + 61, { align: 'right' });
    }
    
    // Table Header
    const tableTop = margin + 70;
    const colWidths = [10, 25, 20, 20, 15, 20, 20, 30];
    const headers = ['Sr', 'Description', 'Size', 'Qty', 'Area', 'Rate', 'Amount', 'Remark'];
    
    doc.setFillColor(44, 62, 80);
    doc.rect(margin, tableTop - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    
    let xPos = margin;
    headers.forEach((header, i) => {
        doc.text(header, xPos + colWidths[i] / 2, tableTop - 1, { align: 'center' });
        xPos += colWidths[i];
    });
    
    // Table Data
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const rows = document.querySelectorAll('#productTableBody tr');
    let yPos = tableTop + 8;
    
    rows.forEach((row, index) => {
        const itemSelect = row.querySelector('.item-select');
        const desc = itemSelect.options[itemSelect.selectedIndex]?.text || '';
        const width = row.querySelector('.actual-in-w').value || row.querySelector('.actual-mm-w').value;
        const height = row.querySelector('.actual-in-h').value || row.querySelector('.actual-mm-h').value;
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount').textContent;
        const remark = row.querySelector('.remark').value;
        
        if (desc || width || height) {
            if (yPos > 270) {
                doc.addPage();
                yPos = margin + 20;
            }
            
            xPos = margin;
            doc.text((index + 1).toString(), xPos + 3, yPos);
            xPos += colWidths[0];
            
            doc.text(desc.substring(0, 20), xPos, yPos);
            xPos += colWidths[1];
            
            doc.text(`${width} × ${height}`, xPos, yPos);
            xPos += colWidths[2];
            
            doc.text(qty, xPos + 3, yPos, { align: 'center' });
            xPos += colWidths[3];
            
            doc.text(area, xPos + 3, yPos, { align: 'center' });
            xPos += colWidths[4];
            
            doc.text(rate, xPos + 3, yPos, { align: 'center' });
            xPos += colWidths[5];
            
            doc.text(amount, xPos + 3, yPos, { align: 'center' });
            xPos += colWidths[6];
            
            doc.text(remark.substring(0, 15), xPos, yPos);
            
            yPos += 6;
        }
    });
    
    // Totals
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Total Area:', margin, yPos);
    doc.text(document.getElementById('totalArea').textContent, margin + 40, yPos);
    
    doc.text('Subtotal:', pageWidth - margin - 60, yPos);
    doc.text(document.getElementById('subtotal').textContent, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 6;
    doc.text('GST (18%):', pageWidth - margin - 60, yPos);
    doc.text(document.getElementById('gstAmount').textContent, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('GRAND TOTAL:', pageWidth - margin - 60, yPos);
    doc.text(document.getElementById('grandTotal').textContent, pageWidth - margin, yPos, { align: 'right' });
    
    // Terms & Conditions
    yPos += 15;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', margin, yPos);
    yPos += 6;
    doc.text('1. Prices are ex-factory', margin + 5, yPos);
    yPos += 4;
    doc.text('2. Delivery: 7-10 working days', margin + 5, yPos);
    yPos += 4;
    doc.text('3. Payment: 50% advance with order', margin + 5, yPos);
    yPos += 4;
    doc.text('4. Goods once sold will not be taken back', margin + 5, yPos);
    yPos += 4;
    doc.text('5. Subject to S.A.S. Nagar jurisdiction', margin + 5, yPos);
    
    // Signatures
    yPos = 250;
    doc.text('________________________', margin, yPos);
    doc.text('Authorized Signatory', margin + 15, yPos + 6);
    doc.text('S.A.P.U.T. Glass Works', margin + 10, yPos + 12);
    
    doc.text('________________________', pageWidth - margin - 50, yPos);
    doc.text('Customer Acceptance', pageWidth - margin - 35, yPos + 6);
    
    // Powered by Footer
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text('Powered by S.A.P.U.T. Glass Works Enterprise', pageWidth / 2, 290, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, 293, { align: 'center' });
    
    // Save PDF
    doc.save(`Proforma_${document.getElementById('piNumber').value}.pdf`);
}

// EXPORT TO EXCEL
function exportToExcel() {
    calculateAll();
    
    const wb = XLSX.utils.book_new();
    const ws_data = [];
    
    // Header
    ws_data.push(['S.A.P.U.T. GLASS WORKS']);
    ws_data.push(['Proforma Invoice']);
    ws_data.push([]);
    ws_data.push(['PI No:', document.getElementById('piNumber').value]);
    ws_data.push(['Date:', document.getElementById('piDate').value]);
    ws_data.push(['Customer:', currentCustomer ? currentCustomer.name : '']);
    ws_data.push([]);
    
    // Table Headers
    ws_data.push(['Sr', 'Description', 'Size (Inches)', 'Size (MM)', 'Qty', 'Area (Sq.Mt.)', 'Rate (₹/Sq.Mt.)', 'Amount (₹)', 'Remark']);
    
    // Table Data
    const rows = document.querySelectorAll('#productTableBody tr');
    rows.forEach((row, index) => {
        const itemSelect = row.querySelector('.item-select');
        const desc = itemSelect.options[itemSelect.selectedIndex]?.text || '';
        const widthIn = row.querySelector('.actual-in-w').value;
        const heightIn = row.querySelector('.actual-in-h').value;
        const widthMM = row.querySelector('.actual-mm-w').value;
        const heightMM = row.querySelector('.actual-mm-h').value;
        const qty = row.querySelector('.qty').value;
        const area = row.querySelector('.area').textContent;
        const rate = row.querySelector('.rate').value;
        const amount = row.querySelector('.amount').textContent;
        const remark = row.querySelector('.remark').value;
        
        if (desc || widthIn || heightIn || widthMM || heightMM) {
            ws_data.push([
                index + 1,
                desc,
                `${widthIn} × ${heightIn}`,
                `${widthMM} × ${heightMM}`,
                qty,
                area,
                rate,
                amount,
                remark
            ]);
        }
    });
    
    ws_data.push([]);
    ws_data.push(['Summary']);
    ws_data.push(['Total Area:', document.getElementById('totalArea').textContent]);
    ws_data.push(['Subtotal:', document.getElementById('subtotal').textContent]);
    ws_data.push(['GST (18%):', document.getElementById('gstAmount').textContent]);
    ws_data.push(['GRAND TOTAL:', document.getElementById('grandTotal').textContent]);
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Proforma Invoice');
    
    XLSX.writeFile(wb, `Proforma_${document.getElementById('piNumber').value}.xlsx`);
}

// LOGOUT
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.reload();
    }
}

// UTILITY FUNCTIONS
function viewOrder(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (order) {
        alert(`Order Details:\n\nOrder No: ${order.orderNo}\nCustomer: ${order.customerName}\nAmount: ₹${order.total}\nStatus: ${order.status}`);
    }
}

function editOrder(orderId) {
    // Implementation for editing orders
    alert('Edit order functionality coming soon');
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        orders = orders.filter(o => o.id != orderId);
        localStorage.setItem('saput_orders', JSON.stringify(orders));
        loadOrdersTable();
        updateDashboardStats();
        alert('Order deleted successfully!');
    }
}

// Load customers table for customer management
function loadCustomersTable() {
    // Implementation for customer management table
    const container = document.getElementById('customerManagementSection');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-users me-2"></i>Customer Management</h5>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary mb-3" onclick="showAddCustomerModal()">
                        <i class="fas fa-plus"></i> Add Customer
                    </button>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>City</th>
                                    <th>GST</th>
                                    <th>Phone</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.map(customer => `
                                    <tr>
                                        <td>${customer.id}</td>
                                        <td>${customer.name}</td>
                                        <td>${customer.city}</td>
                                        <td>${customer.gst}</td>
                                        <td>${customer.phone}</td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

function editCustomer(customerId) {
    const customer = customers.find(c => c.id == customerId);
    if (customer) {
        document.getElementById('custName').value = customer.name;
        document.getElementById('custGST').value = customer.gst;
        document.getElementById('custAddress').value = customer.address;
        document.getElementById('custPhone').value = customer.phone;
        document.getElementById('custEmail').value = customer.email;
        
        const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
        modal.show();
        
        // Change button text
        const saveBtn = document.querySelector('#addCustomerModal .btn-primary');
        saveBtn.textContent = 'Update Customer';
        saveBtn.onclick = function() { updateCustomer(customerId); };
    }
}

function updateCustomer(customerId) {
    const name = document.getElementById('custName').value.trim();
    const gst = document.getElementById('custGST').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    
    if (!name) {
        alert('Please enter company name');
        return;
    }
    
    const customerIndex = customers.findIndex(c => c.id == customerId);
    if (customerIndex !== -1) {
        customers[customerIndex] = {
            ...customers[customerIndex],
            name: name,
            gst: gst,
            address: address,
            phone: phone,
            email: email,
            city: address.split(',').pop().trim() || ''
        };
        
        localStorage.setItem('saput_customers', JSON.stringify(customers));
        loadCustomers();
        loadCustomersTable();
        
        bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
        alert('Customer updated successfully!');
    }
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        customers = customers.filter(c => c.id != customerId);
        localStorage.setItem('saput_customers', JSON.stringify(customers));
        loadCustomers();
        loadCustomersTable();
        alert('Customer deleted successfully!');
    }
}

// Load items table for item master
function loadItemsTable() {
    // Implementation for item master
    const container = document.getElementById('itemMasterSection');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-box me-2"></i>Item Master</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Rate (₹/Sq.Mt.)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td>${item.code}</td>
                                        <td>${item.name}</td>
                                        <td>${item.type}</td>
                                        <td>₹${item.rate}</td>
                                        <td>
                                            <button class="btn btn-sm btn-warning">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

// Generate reports
function generateReports() {
    const container = document.getElementById('reportsSection');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-chart-bar me-2"></i>Reports</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>${orders.length}</h3>
                                    <p>Total Orders</p>
                                    <button class="btn btn-sm btn-primary">View Report</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>₹${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</h3>
                                    <p>Total Revenue</p>
                                    <button class="btn btn-sm btn-primary">View Report</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>${customers.length}</h3>
                                    <p>Total Customers</p>
                                    <button class="btn btn-sm btn-primary">View Report</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}