// S.A.P.U.T. Glass Manufacturing System - Complete Application
class SAPUTGlassSystem {
    constructor() {
        this.appName = "S.A.P.U.T. Glass Manufacturing System";
        this.version = "3.0.0";
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
        
        // Set up based on current page
        this.detectPageType();
        
        // Common setup
        this.setCurrentDateTime();
        this.setupCommonListeners();
        this.loadCustomers();
        
        // Auto-generate PI number if on PI page
        if (document.getElementById('piNumber')) {
            this.generatePINumber();
        }
    }
    
    detectPageType() {
        const path = window.location.pathname;
        
        if (path.includes('pi_system.html') || document.getElementById('piNumber')) {
            this.setupPISystem();
        } else if (path.includes('glass_quotation_system.html') || document.getElementById('quotationNumber')) {
            this.setupQuotationSystem();
        } else if (document.getElementById('dashboardStats')) {
            this.setupDashboard();
        }
    }
    
    // ==================== COMMON FUNCTIONS ====================
    
    setCurrentDateTime() {
        const updateTime = () => {
            const now = new Date();
            const dateOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit'
            };
            
            const dateStr = now.toLocaleDateString('en-IN', dateOptions);
            const timeStr = now.toLocaleTimeString('en-IN', timeOptions);
            
            // Update any date/time elements
            document.querySelectorAll('.current-date').forEach(el => {
                el.textContent = dateStr;
            });
            
            document.querySelectorAll('.current-time').forEach(el => {
                el.textContent = timeStr;
            });
            
            // Set date inputs to today
            document.querySelectorAll('input[type="date"]').forEach(input => {
                if (!input.value) {
                    input.valueAsDate = now;
                }
            });
        };
        
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }
    
    setupCommonListeners() {
        // Print buttons
        document.querySelectorAll('.btn-print').forEach(btn => {
            btn.addEventListener('click', () => window.print());
        });
        
        // Calculate buttons
        document.querySelectorAll('.btn-calculate').forEach(btn => {
            btn.addEventListener('click', () => this.calculateTotals());
        });
        
        // Save buttons
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => this.saveDocument());
        });
        
        // New document buttons
        document.querySelectorAll('.btn-new').forEach(btn => {
            btn.addEventListener('click', () => this.newDocument());
        });
    }
    
    // ==================== PI SYSTEM FUNCTIONS ====================
    
    setupPISystem() {
        console.log('Setting up PI System');
        
        // Initialize items array
        window.piItems = [];
        window.itemCounter = 1;
        
        // Set up inch/mm converters
        this.setupUnitConverters();
        
        // Set up add row functionality
        this.setupAddRow();
        
        // Set up customer management
        this.setupCustomerManagement();
        
        // Set initial sample item
        setTimeout(() => this.addSampleItem(), 500);
    }
    
    setupUnitConverters() {
        // Inch to MM converter
        const inchInputs = document.querySelectorAll('.inch-input');
        const mmInputs = document.querySelectorAll('.mm-input');
        
        inchInputs.forEach(input => {
            input.addEventListener('input', function() {
                const inches = parseFloat(this.value) || 0;
                const mm = inches * 25.4;
                
                // Find corresponding mm input
                const row = this.closest('.size-row');
                if (row) {
                    const mmInput = row.querySelector('.mm-input');
                    if (mmInput) {
                        mmInput.value = mm.toFixed(2);
                    }
                }
            });
        });
        
        mmInputs.forEach(input => {
            input.addEventListener('input', function() {
                const mm = parseFloat(this.value) || 0;
                const inches = mm / 25.4;
                
                // Find corresponding inch input
                const row = this.closest('.size-row');
                if (row) {
                    const inchInput = row.querySelector('.inch-input');
                    if (inchInput) {
                        inchInput.value = inches.toFixed(3);
                    }
                }
            });
        });
    }
    
    setupAddRow() {
        const addRowBtn = document.getElementById('addRowBtn');
        const sizeRowsContainer = document.getElementById('sizeRowsContainer');
        
        if (addRowBtn && sizeRowsContainer) {
            addRowBtn.addEventListener('click', () => this.addSizeRow());
        }
    }
    
    addSizeRow() {
        const sizeRowsContainer = document.getElementById('sizeRowsContainer');
        if (!sizeRowsContainer) return;
        
        const rowCount = sizeRowsContainer.querySelectorAll('.size-row').length + 1;
        
        const rowHTML = `
            <div class="size-row row g-2 mb-3">
                <div class="col-md-2">
                    <label>Width (Inches)</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control width-feet" placeholder="Ft" value="4" min="0">
                        <span class="input-group-text">'</span>
                        <input type="number" class="form-control width-inch" placeholder="In" value="0" min="0" max="11">
                        <select class="form-select width-frac" style="max-width: 80px;">
                            <option value="0">0</option>
                            <option value="0.125">1/8</option>
                            <option value="0.25">1/4</option>
                            <option value="0.375">3/8</option>
                            <option value="0.5" selected>1/2</option>
                            <option value="0.625">5/8</option>
                            <option value="0.75">3/4</option>
                            <option value="0.875">7/8</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-2">
                    <label>Height (Inches)</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control height-feet" placeholder="Ft" value="3" min="0">
                        <span class="input-group-text">'</span>
                        <input type="number" class="form-control height-inch" placeholder="In" value="0" min="0" max="11">
                        <select class="form-select height-frac" style="max-width: 80px;">
                            <option value="0">0</option>
                            <option value="0.125">1/8</option>
                            <option value="0.25" selected>1/4</option>
                            <option value="0.375">3/8</option>
                            <option value="0.5">1/2</option>
                            <option value="0.625">5/8</option>
                            <option value="0.75">3/4</option>
                            <option value="0.875">7/8</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-2">
                    <label>Extra MM</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control extra-mm-width" placeholder="W" value="0" min="0">
                        <input type="number" class="form-control extra-mm-height" placeholder="H" value="0" min="0">
                        <span class="input-group-text">mm</span>
                    </div>
                </div>
                <div class="col-md-2">
                    <label>Size in MM</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control mm-width inch-input" placeholder="Width" readonly>
                        <input type="number" class="form-control mm-height inch-input" placeholder="Height" readonly>
                        <span class="input-group-text">mm</span>
                    </div>
                </div>
                <div class="col-md-2">
                    <label>Qty & Glass Type</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control item-qty" placeholder="Qty" value="1" min="1">
                        <select class="form-select glass-type">
                            <option value="450">Clear 6mm</option>
                            <option value="650">Toughened</option>
                            <option value="850">Laminated</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-sm btn-primary add-item-btn" onclick="saputApp.addItemFromRow(this)">
                        <i class="fas fa-plus"></i> Add
                    </button>
                    <button class="btn btn-sm btn-danger ms-2 remove-row-btn" onclick="this.closest('.size-row').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        sizeRowsContainer.insertAdjacentHTML('beforeend', rowHTML);
        
        // Set up converters for new row
        this.setupRowConverters(sizeRowsContainer.lastElementChild);
        
        // Calculate initial MM values
        this.updateRowMM(sizeRowsContainer.lastElementChild);
    }
    
    setupRowConverters(row) {
        const inputs = [
            row.querySelector('.width-feet'),
            row.querySelector('.width-inch'),
            row.querySelector('.width-frac'),
            row.querySelector('.height-feet'),
            row.querySelector('.height-inch'),
            row.querySelector('.height-frac'),
            row.querySelector('.extra-mm-width'),
            row.querySelector('.extra-mm-height')
        ];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateRowMM(row));
            input.addEventListener('change', () => this.updateRowMM(row));
        });
    }
    
    updateRowMM(row) {
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
        
        // Update MM display
        row.querySelector('.mm-width').value = widthMM;
        row.querySelector('.mm-height').value = heightMM;
    }
    
    addItemFromRow(button) {
        const row = button.closest('.size-row');
        
        const widthFeet = parseFloat(row.querySelector('.width-feet').value) || 0;
        const widthInch = parseFloat(row.querySelector('.width-inch').value) || 0;
        const widthFrac = parseFloat(row.querySelector('.width-frac').value) || 0;
        const extraMMWidth = parseFloat(row.querySelector('.extra-mm-width').value) || 0;
        
        const heightFeet = parseFloat(row.querySelector('.height-feet').value) || 0;
        const heightInch = parseFloat(row.querySelector('.height-inch').value) || 0;
        const heightFrac = parseFloat(row.querySelector('.height-frac').value) || 0;
        const extraMMHeight = parseFloat(row.querySelector('.extra-mm-height').value) || 0;
        
        const qty = parseFloat(row.querySelector('.item-qty').value) || 1;
        const rate = parseFloat(row.querySelector('.glass-type').value) || 450;
        
        // Calculate total inches
        const totalWidthInches = (widthFeet * 12) + widthInch + widthFrac;
        const totalHeightInches = (heightFeet * 12) + heightInch + heightFrac;
        
        // Calculate total MM
        const widthMM = Math.round((totalWidthInches * 25.4) + extraMMWidth);
        const heightMM = Math.round((totalHeightInches * 25.4) + extraMMHeight);
        
        // Calculate area
        const areaSqFt = (totalWidthInches * totalHeightInches) / 144;
        const amount = areaSqFt * rate * qty;
        
        // Format inch display
        const widthDisplay = this.formatInchDisplay(widthFeet, widthInch, widthFrac);
        const heightDisplay = this.formatInchDisplay(heightFeet, heightInch, heightFrac);
        
        // Create item
        const item = {
            id: window.itemCounter++,
            widthDisplay: widthDisplay,
            heightDisplay: heightDisplay,
            mmDisplay: `${widthMM} × ${heightMM} mm`,
            qty: qty,
            area: areaSqFt.toFixed(2),
            rate: rate,
            amount: amount.toFixed(2)
        };
        
        window.piItems.push(item);
        this.updatePITable();
        this.calculatePITotals();
        
        // Show success message
        this.showNotification('Item added to invoice', 'success');
    }
    
    formatInchDisplay(feet, inches, fraction) {
        let display = '';
        if (feet > 0) display += `${feet}' `;
        if (inches > 0) display += `${inches}`;
        
        if (fraction > 0) {
            const fracText = this.getFractionText(fraction);
            if (inches > 0) display += ' ';
            display += fracText;
        }
        
        if (!display) display = '0';
        display += '"';
        
        return display;
    }
    
    getFractionText(fraction) {
        const fractions = {
            0.125: '1/8',
            0.25: '1/4',
            0.375: '3/8',
            0.5: '1/2',
            0.625: '5/8',
            0.75: '3/4',
            0.875: '7/8'
        };
        return fractions[fraction] || '';
    }
    
    updatePITable() {
        const table = document.getElementById('itemsTable');
        if (!table) return;
        
        table.innerHTML = '';
        
        window.piItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.widthDisplay} × ${item.heightDisplay}</td>
                <td>${item.mmDisplay}</td>
                <td>${item.qty}</td>
                <td>${item.area}</td>
                <td>₹${item.rate}/sq.ft</td>
                <td>₹${parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="saputApp.removePIItem(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        });
    }
    
    removePIItem(index) {
        window.piItems.splice(index, 1);
        this.updatePITable();
        this.calculatePITotals();
    }
    
    calculatePITotals() {
        let subtotal = 0;
        
        window.piItems.forEach(item => {
            subtotal += parseFloat(item.amount);
        });
        
        const discountInput = document.getElementById('discount');
        const discountPercent = discountInput ? parseFloat(discountInput.value) || 0 : 0;
        const discountAmount = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountAmount;
        const gstAmount = afterDiscount * 0.18;
        const grandTotal = afterDiscount + gstAmount;
        
        // Update display
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
    }
    
    addSampleItem() {
        // Add initial size row
        this.addSizeRow();
    }
    
    setupCustomerManagement() {
        const customers = this.getCustomers();
        
        // Auto-fill customer dropdown if exists
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} - ${customer.phone}`;
                customerSelect.appendChild(option);
            });
            
            customerSelect.addEventListener('change', function() {
                const customerId = this.value;
                if (customerId) {
                    const customer = customers.find(c => c.id == customerId);
                    if (customer) {
                        document.getElementById('customerName').value = customer.name;
                        document.getElementById('customerAddress').value = customer.address;
                        document.getElementById('customerGST').value = customer.gst || '';
                        document.getElementById('customerPhone').value = customer.phone;
                    }
                }
            });
        }
    }
    
    getCustomers() {
        // Try to get from localStorage
        const stored = localStorage.getItem('saput_customers');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return sample customers
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
                name: 'Sharma Glass Works',
                address: '456, Industrial Area, Karnal',
                gst: '06ABCDE1234F1Z5',
                phone: '9876543211'
            },
            {
                id: 3,
                name: 'Modern Glass Solutions',
                address: '789, Sector 5, Panipat',
                gst: '',
                phone: '9876543212'
            }
        ];
    }
    
    loadCustomers() {
        // Load customers into localStorage if not exists
        if (!localStorage.getItem('saput_customers')) {
            const customers = this.getCustomers();
            localStorage.setItem('saput_customers', JSON.stringify(customers));
        }
    }
    
    addCustomer(customerData) {
        const customers = this.getCustomers();
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        
        const newCustomer = {
            id: newId,
            ...customerData,
            created: new Date().toISOString()
        };
        
        customers.push(newCustomer);
        localStorage.setItem('saput_customers', JSON.stringify(customers));
        
        return newCustomer;
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    generatePINumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const piNumber = `PI-${year}${month}-${random}`;
        
        const piNumberElement = document.getElementById('piNumber');
        if (piNumberElement) {
            piNumberElement.textContent = piNumber;
        }
        
        return piNumber;
    }
    
    calculateTotals() {
        // This is a generic calculate function
        // Specific systems should override
        console.log('Calculating totals...');
    }
    
    saveDocument() {
        // Get document data
        const documentData = {
            type: window.location.pathname.includes('pi_system') ? 'PI' : 'Quotation',
            number: document.getElementById('piNumber')?.textContent || 
                   document.getElementById('quotationNumber')?.textContent || 'Unknown',
            date: document.querySelector('input[type="date"]')?.value || new Date().toISOString().split('T')[0],
            customer: {
                name: document.getElementById('customerName')?.value || '',
                address: document.getElementById('customerAddress')?.value || ''
            },
            items: window.piItems || [],
            totals: this.calculatePITotals ? this.calculatePITotals() : {}
        };
        
        // Save to localStorage
        const documents = JSON.parse(localStorage.getItem('saput_documents') || '[]');
        documents.push({
            ...documentData,
            savedAt: new Date().toISOString()
        });
        
        localStorage.setItem('saput_documents', JSON.stringify(documents));
        
        this.showNotification('Document saved successfully!', 'success');
    }
    
    newDocument() {
        if (confirm('Create new document? Current unsaved data will be lost.')) {
            // Clear items
            window.piItems = [];
            
            // Clear table
            const table = document.getElementById('itemsTable');
            if (table) table.innerHTML = '';
            
            // Clear size rows
            const sizeRowsContainer = document.getElementById('sizeRowsContainer');
            if (sizeRowsContainer) sizeRowsContainer.innerHTML = '';
            
            // Generate new number
            this.generatePINumber();
            
            // Reset date
            const dateInput = document.querySelector('input[type="date"]');
            if (dateInput) dateInput.valueAsDate = new Date();
            
            // Clear customer
            document.getElementById('customerName').value = '';
            document.getElementById('customerAddress').value = '';
            document.getElementById('customerGST').value = '';
            document.getElementById('customerPhone').value = '';
            
            // Reset totals
            this.calculatePITotals();
            
            // Add initial row
            setTimeout(() => this.addSizeRow(), 100);
            
            this.showNotification('New document created', 'info');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Style it
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // ==================== DASHBOARD FUNCTIONS ====================
    
    setupDashboard() {
        console.log('Setting up Dashboard');
        this.loadDashboardStats();
    }
    
    loadDashboardStats() {
        // Load from localStorage
        const documents = JSON.parse(localStorage.getItem('saput_documents') || '[]');
        const customers = JSON.parse(localStorage.getItem('saput_customers') || '[]');
        
        // Calculate stats
        const totalOrders = documents.length;
        const totalRevenue = documents.reduce((sum, doc) => {
            const docTotal = doc.items?.reduce((itemSum, item) => 
                itemSum + (parseFloat(item.amount) || 0), 0) || 0;
            return sum + docTotal;
        }, 0);
        
        const pendingOrders = documents.filter(doc => 
            !doc.status || doc.status === 'pending').length;
        const completedOrders = documents.filter(doc => 
            doc.status === 'completed').length;
        
        // Update stats cards
        this.updateStatCard('.stat-orders', totalOrders);
        this.updateStatCard('.stat-revenue', totalRevenue);
        this.updateStatCard('.stat-pending', pendingOrders);
        this.updateStatCard('.stat-completed', completedOrders);
        
        // Update recent activity
        this.updateRecentActivity(documents.slice(-5).reverse());
    }
    
    updateStatCard(selector, value) {
        const card = document.querySelector(selector);
        if (!card) return;
        
        const valueElement = card.querySelector('h3');
        if (valueElement) {
            if (selector.includes('revenue')) {
                // Format as currency
                if (value >= 100000) {
                    valueElement.textContent = `₹${(value / 100000).toFixed(1)}L`;
                } else if (value >= 1000) {
                    valueElement.textContent = `₹${(value / 1000).toFixed(1)}K`;
                } else {
                    valueElement.textContent = `₹${value}`;
                }
            } else {
                valueElement.textContent = value;
            }
        }
    }
    
    updateRecentActivity(documents) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        documents.forEach(doc => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const timeAgo = this.getTimeAgo(doc.savedAt || doc.date);
            
            activityItem.innerHTML = `
                <div>
                    <i class="fas fa-file-invoice text-primary me-2"></i>
                    <strong>${doc.type} Created</strong> - ${doc.number}
                </div>
                <span class="text-muted">${timeAgo}</span>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
    
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-IN');
        }
    }
}

// Initialize the application
window.saputApp = new SAPUTGlassSystem();
