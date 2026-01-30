// S.A.P.U.T. Glass Manufacturing System - Complete Application
class SAPUTGlassSystem {
    constructor() {
        this.appName = "S.A.P.U.T. Glass Manufacturing System";
        this.version = "5.0.0";
        this.company = {
            name: "S.A.P.U.T.",
            address: "Karnal, Haryana PIN code 132001",
            mobile: "1111111111",
            email: "jperp1001@gmail.com",
            phone: ""
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log(`${this.appName} v${this.version} initialized`);
        
        // Initialize global variables
        window.piItems = [];
        window.itemCounter = 1;
        
        // Set up based on current page
        this.detectPageType();
        
        // Common setup
        this.setCurrentDateTime();
        this.setupCommonListeners();
        
        // Generate PI number immediately
        this.generatePINumber();
        
        // Add initial row
        setTimeout(() => this.addNewRow(), 300);
    }
    
    detectPageType() {
        if (document.getElementById('piNumber')) {
            this.setupPISystem();
        }
    }
    
    // ==================== COMMON FUNCTIONS ====================
    
    setCurrentDateTime() {
        // Set today's date in date input
        const dateInput = document.getElementById('piDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
    
    setupCommonListeners() {
        // Print button
        document.querySelectorAll('.btn-print').forEach(btn => {
            btn.addEventListener('click', () => window.print());
        });
        
        // Save button
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => this.savePI());
        });
        
        // New button
        document.querySelectorAll('.btn-new').forEach(btn => {
            btn.addEventListener('click', () => this.newPI());
        });
        
        // Copy to Ship button
        const copyBtn = document.getElementById('copyToShipBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToShip());
        }
        
        // Same as Bill checkbox
        const sameAsBill = document.getElementById('sameAsBill');
        if (sameAsBill) {
            sameAsBill.addEventListener('change', (e) => this.toggleShipAddress(e.target.checked));
        }
        
        // Discount input
        const discountInput = document.getElementById('discount');
        if (discountInput) {
            discountInput.addEventListener('input', () => this.calculateTotals());
        }
        
        // New Customer button
        const newCustomerBtn = document.getElementById('newCustomerBtn');
        if (newCustomerBtn) {
            newCustomerBtn.addEventListener('click', () => this.newCustomer());
        }
        
        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateTotals());
        }
    }
    
    // ==================== PI SYSTEM FUNCTIONS ====================
    
    setupPISystem() {
        console.log('Setting up PI System');
        
        // Set up customer dropdown
        this.setupCustomerDropdown();
        
        // Set up add row button
        const addRowBtn = document.getElementById('addRowBtn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.addNewRow());
        }
        
        // Calculate initial totals
        this.calculateTotals();
    }
    
    setupCustomerDropdown() {
        const customers = this.getCustomers();
        const customerSelect = document.getElementById('customerSelect');
        
        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} (${customer.phone})`;
                customerSelect.appendChild(option);
            });
            
            customerSelect.addEventListener('change', (e) => {
                const customerId = e.target.value;
                if (customerId) {
                    const customer = customers.find(c => c.id == customerId);
                    if (customer) {
                        this.fillCustomerDetails(customer);
                    }
                }
            });
        }
    }
    
    getCustomers() {
        try {
            const stored = localStorage.getItem('saput_customers');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading customers:', e);
        }
        
        // Default customers
        return [
            {
                id: 1,
                name: 'Raj Glass House',
                address: '123, Main Market, Delhi',
                gst: '07AABCU9603R1ZX',
                phone: '9876543210'
            },
            {
                id: 2,
                name: 'Modern Glass Works',
                address: '456, Industrial Area, Karnal',
                gst: '06ABCDE1234F1Z5',
                phone: '9876543211'
            },
            {
                id: 3,
                name: 'Sharma Glass Solutions',
                address: '789, Sector 5, Panipat',
                gst: '',
                phone: '9876543212'
            }
        ];
    }
    
    fillCustomerDetails(customer) {
        document.getElementById('customerName').value = customer.name || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerGST').value = customer.gst || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        
        // If "Same as Bill" is checked, also update ship to
        if (document.getElementById('sameAsBill').checked) {
            this.copyToShip();
        }
    }
    
    addNewRow() {
        const tableBody = document.querySelector('#itemsTable tbody');
        if (!tableBody) return;
        
        const rowId = window.itemCounter++;
        const rowHTML = this.getRowHTML(rowId);
        
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
        
        // Set up event listeners for the new row
        this.setupRowListeners(rowId);
        
        // Calculate MM for this row
        this.calculateRowMM(rowId);
    }
    
    getRowHTML(rowId) {
        return `
            <tr id="row-${rowId}" data-id="${rowId}">
                <td>${rowId}</td>
                <td>
                    <div class="row g-1">
                        <div class="col-6">
                            <input type="number" class="form-control form-control-sm width-feet" placeholder="Ft" value="4" min="0">
                        </div>
                        <div class="col-6">
                            <input type="number" class="form-control form-control-sm width-inch" placeholder="In" value="0" min="0" max="11">
                        </div>
                        <div class="col-6 mt-1">
                            <select class="form-select form-select-sm width-frac">
                                <option value="0">0"</option>
                                <option value="0.125">1/8"</option>
                                <option value="0.25">1/4"</option>
                                <option value="0.375">3/8"</option>
                                <option value="0.5" selected>1/2"</option>
                                <option value="0.625">5/8"</option>
                                <option value="0.75">3/4"</option>
                                <option value="0.875">7/8"</option>
                            </select>
                        </div>
                        <div class="col-12 mt-1">
                            <input type="number" class="form-control form-control-sm extra-mm-width" placeholder="+MM Width" value="0" min="0">
                        </div>
                    </div>
                </td>
                <td>
                    <div class="row g-1">
                        <div class="col-6">
                            <input type="number" class="form-control form-control-sm height-feet" placeholder="Ft" value="3" min="0">
                        </div>
                        <div class="col-6">
                            <input type="number" class="form-control form-control-sm height-inch" placeholder="In" value="0" min="0" max="11">
                        </div>
                        <div class="col-6 mt-1">
                            <select class="form-select form-select-sm height-frac">
                                <option value="0">0"</option>
                                <option value="0.125">1/8"</option>
                                <option value="0.25" selected>1/4"</option>
                                <option value="0.375">3/8"</option>
                                <option value="0.5">1/2"</option>
                                <option value="0.625">5/8"</option>
                                <option value="0.75">3/4"</option>
                                <option value="0.875">7/8"</option>
                            </select>
                        </div>
                        <div class="col-12 mt-1">
                            <input type="number" class="form-control form-control-sm extra-mm-height" placeholder="+MM Height" value="0" min="0">
                        </div>
                    </div>
                </td>
                <td>
                    <div class="row g-1">
                        <div class="col-12">
                            <input type="number" class="form-control form-control-sm mm-width" placeholder="Width mm" readonly>
                        </div>
                        <div class="col-12 mt-1">
                            <input type="number" class="form-control form-control-sm mm-height" placeholder="Height mm" readonly>
                        </div>
                    </div>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm qty" value="1" min="1">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm rate" value="450" min="0" step="0.01">
                </td>
                <td>
                    <div class="row g-1">
                        <div class="col-12">
                            <input type="number" class="form-control form-control-sm hole-qty" placeholder="Holes" value="0" min="0">
                        </div>
                        <div class="col-12 mt-1">
                            <input type="number" class="form-control form-control-sm cut-qty" placeholder="Cuts" value="0" min="0">
                        </div>
                    </div>
                </td>
                <td class="area-cell">0.00</td>
                <td class="amount-cell">0.00</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="saputApp.removeRow(${rowId})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    setupRowListeners(rowId) {
        const row = document.getElementById(`row-${rowId}`);
        if (!row) return;
        
        // Get all inputs that affect calculation
        const inputs = row.querySelectorAll('input[type="number"], select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateRowMM(rowId);
                this.calculateRowAmount(rowId);
            });
            input.addEventListener('change', () => {
                this.calculateRowMM(rowId);
                this.calculateRowAmount(rowId);
            });
        });
    }
    
    calculateRowMM(rowId) {
        const row = document.getElementById(`row-${rowId}`);
        if (!row) return;
        
        // Get inch values
        const widthFeet = parseFloat(row.querySelector('.width-feet').value) || 0;
        const widthInch = parseFloat(row.querySelector('.width-inch').value) || 0;
        const widthFrac = parseFloat(row.querySelector('.width-frac').value) || 0;
        const extraMMWidth = parseFloat(row.querySelector('.extra-mm-width').value) || 0;
        
        const heightFeet = parseFloat(row.querySelector('.height-feet').value) || 0;
        const heightInch = parseFloat(row.querySelector('.height-inch').value) || 0;
        const heightFrac = parseFloat(row.querySelector('.height-frac').value) || 0;
        const extraMMHeight = parseFloat(row.querySelector('.extra-mm-height').value) || 0;
        
        // Calculate total inches
        const totalWidthInches = (widthFeet * 12) + widthInch + widthFrac;
        const totalHeightInches = (heightFeet * 12) + heightInch + heightFrac;
        
        // Convert to mm
        const widthMM = Math.round((totalWidthInches * 25.4) + extraMMWidth);
        const heightMM = Math.round((totalHeightInches * 25.4) + extraMMHeight);
        
        // Update MM fields
        row.querySelector('.mm-width').value = widthMM;
        row.querySelector('.mm-height').value = heightMM;
        
        return { widthMM, heightMM, totalWidthInches, totalHeightInches };
    }
    
    calculateRowAmount(rowId) {
        const row = document.getElementById(`row-${rowId}`);
        if (!row) return;
        
        const dimensions = this.calculateRowMM(rowId);
        const qty = parseFloat(row.querySelector('.qty').value) || 1;
        const rate = parseFloat(row.querySelector('.rate').value) || 450;
        
        // Calculate area in sq.ft
        const areaSqFt = (dimensions.totalWidthInches * dimensions.totalHeightInches) / 144;
        const amount = areaSqFt * rate * qty;
        
        // Update display
        row.querySelector('.area-cell').textContent = areaSqFt.toFixed(2);
        row.querySelector('.amount-cell').textContent = amount.toFixed(2);
        
        // Store in data attribute
        row.dataset.amount = amount;
        
        // Recalculate totals
        this.calculateTotals();
        
        return amount;
    }
    
    removeRow(rowId) {
        const row = document.getElementById(`row-${rowId}`);
        if (row) {
            row.remove();
            this.calculateTotals();
        }
    }
    
    calculateTotals() {
        let subtotal = 0;
        
        // Calculate from all rows
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
            const amount = parseFloat(row.dataset.amount) || 0;
            subtotal += amount;
        });
        
        // Get discount
        const discountInput = document.getElementById('discount');
        const discountPercent = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        const discountAmount = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountAmount;
        const gstAmount = afterDiscount * 0.18;
        const grandTotal = afterDiscount + gstAmount;
        
        // Update totals display
        if (document.getElementById('subtotal')) {
            document.getElementById('subtotal').textContent = 
                `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
        }
        
        if (document.getElementById('discountAmount')) {
            document.getElementById('discountAmount').textContent = 
                `₹${discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
        }
        
        if (document.getElementById('gstAmount')) {
            document.getElementById('gstAmount').textContent = 
                `₹${gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
        }
        
        if (document.getElementById('grandTotal')) {
            document.getElementById('grandTotal').textContent = 
                `₹${grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
        }
        
        return { subtotal, discountAmount, gstAmount, grandTotal };
    }
    
    generatePINumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const day = new Date().getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const piNumber = `PI-${year}${month}${day}-${random}`;
        
        const piNumberElement = document.getElementById('piNumber');
        if (piNumberElement) {
            piNumberElement.textContent = piNumber;
        }
        
        return piNumber;
    }
    
    copyToShip() {
        document.getElementById('shipName').value = document.getElementById('customerName').value;
        document.getElementById('shipAddress').value = document.getElementById('customerAddress').value;
        document.getElementById('shipGST').value = document.getElementById('customerGST').value;
        document.getElementById('shipPhone').value = document.getElementById('customerPhone').value;
    }
    
    toggleShipAddress(checked) {
        const shipInputs = [
            document.getElementById('shipName'),
            document.getElementById('shipAddress'),
            document.getElementById('shipGST'),
            document.getElementById('shipPhone')
        ];
        
        shipInputs.forEach(input => {
            input.readOnly = checked;
            if (checked) {
                this.copyToShip();
            }
        });
    }
    
    newCustomer() {
        document.getElementById('customerName').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('customerGST').value = '';
        document.getElementById('customerPhone').value = '';
        
        // Reset customer dropdown
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.value = '';
        }
        
        // Uncheck "Same as Bill"
        document.getElementById('sameAsBill').checked = false;
        this.toggleShipAddress(false);
    }
    
    savePI() {
        // Get customer details
        const customer = {
            name: document.getElementById('customerName').value,
            address: document.getElementById('customerAddress').value,
            gst: document.getElementById('customerGST').value,
            phone: document.getElementById('customerPhone').value
        };
        
        // Get all items
        const items = [];
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
            const item = {
                widthFeet: row.querySelector('.width-feet').value,
                widthInch: row.querySelector('.width-inch').value,
                widthFrac: row.querySelector('.width-frac').value,
                heightFeet: row.querySelector('.height-feet').value,
                heightInch: row.querySelector('.height-inch').value,
                heightFrac: row.querySelector('.height-frac').value,
                extraMMWidth: row.querySelector('.extra-mm-width').value,
                extraMMHeight: row.querySelector('.extra-mm-height').value,
                mmWidth: row.querySelector('.mm-width').value,
                mmHeight: row.querySelector('.mm-height').value,
                qty: row.querySelector('.qty').value,
                rate: row.querySelector('.rate').value,
                holeQty: row.querySelector('.hole-qty').value,
                cutQty: row.querySelector('.cut-qty').value,
                area: row.querySelector('.area-cell').textContent,
                amount: row.querySelector('.amount-cell').textContent
            };
            items.push(item);
        });
        
        // Get totals
        const totals = this.calculateTotals();
        
        // Create PI object
        const pi = {
            id: document.getElementById('piNumber').textContent,
            date: document.getElementById('piDate').value,
            customer: customer,
            shipTo: {
                name: document.getElementById('shipName').value,
                address: document.getElementById('shipAddress').value,
                gst: document.getElementById('shipGST').value,
                phone: document.getElementById('shipPhone').value
            },
            items: items,
            totals: totals,
            created: new Date().toISOString()
        };
        
        // Save to localStorage
        try {
            let savedPIs = JSON.parse(localStorage.getItem('saput_pis') || '[]');
            savedPIs.push(pi);
            localStorage.setItem('saput_pis', JSON.stringify(savedPIs));
            
            // Save customer if not exists
            this.saveCustomerIfNew(customer);
            
            alert('PI saved successfully!');
        } catch (e) {
            console.error('Error saving PI:', e);
            alert('Error saving PI. Please try again.');
        }
    }
    
    saveCustomerIfNew(customer) {
        if (!customer.name) return;
        
        const customers = this.getCustomers();
        const exists = customers.some(c => 
            c.name === customer.name && c.phone === customer.phone
        );
        
        if (!exists) {
            const newCustomer = {
                id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
                name: customer.name,
                address: customer.address,
                gst: customer.gst,
                phone: customer.phone
            };
            
            customers.push(newCustomer);
            localStorage.setItem('saput_customers', JSON.stringify(customers));
        }
    }
    
    newPI() {
        if (confirm('Create new PI? Current data will be lost.')) {
            // Clear items table
            document.querySelector('#itemsTable tbody').innerHTML = '';
            
            // Reset counter
            window.itemCounter = 1;
            
            // Generate new PI number
            this.generatePINumber();
            
            // Reset date to today
            this.setCurrentDateTime();
            
            // Reset customer
            this.newCustomer();
            
            // Reset totals
            this.calculateTotals();
            
            // Add initial row
            this.addNewRow();
        }
    }
}

// Initialize the application
window.saputApp = new SAPUTGlassSystem();
