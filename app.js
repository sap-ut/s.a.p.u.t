// S.A.P.U.T. Glass Manufacturing System - Main Application
// app.js

class SAPUTGlassSystem {
    constructor() {
        this.appName = "S.A.P.U.T. Glass Manufacturing System";
        this.version = "2.0.0";
        this.company = {
            name: "S.A.P.U.T.",
            address: "Karnal, Haryana PIN code 132001",
            mobile: "1111111111",
            email: "jperp1001@gmail.com",
            phone: ""
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log(`${this.appName} v${this.version} initialized`);
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateDateTime();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Quick action buttons
        document.querySelectorAll('.btn-custom, .btn-outline-primary, .btn-outline-success, .btn-outline-warning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.href) {
                    this.showToast('Feature coming soon!', 'info');
                }
            });
        });
    }
    
    loadDashboardData() {
        // Simulate loading data
        setTimeout(() => {
            this.updateStats();
            this.showToast('Dashboard loaded successfully', 'success');
        }, 1000);
    }
    
    updateStats() {
        // In real app, this would fetch from API
        const stats = {
            orders: Math.floor(Math.random() * 50) + 150,
            revenue: Math.floor(Math.random() * 500000) + 1200000,
            pending: Math.floor(Math.random() * 10) + 20,
            completed: Math.floor(Math.random() * 30) + 130
        };
        
        // Update UI
        document.querySelectorAll('.stats-card h3')[0].textContent = stats.orders;
        document.querySelectorAll('.stats-card h3')[1].textContent = `₹${(stats.revenue / 100000).toFixed(1)}L`;
        document.querySelectorAll('.stats-card h3')[2].textContent = stats.pending;
        document.querySelectorAll('.stats-card h3')[3].textContent = stats.completed;
    }
    
    updateDateTime() {
        const updateTime = () => {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            
            const dateTimeStr = now.toLocaleDateString('en-IN', options);
            const dateTimeElement = document.getElementById('currentDateTime');
            
            if (dateTimeElement) {
                dateTimeElement.textContent = dateTimeStr;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to container or create one
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Initialize and show
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    // Quotation methods
    createQuotation(data) {
        console.log('Creating quotation:', data);
        return {
            id: 'QT-' + Date.now(),
            ...data,
            created: new Date().toISOString(),
            status: 'draft'
        };
    }
    
    // Customer methods
    addCustomer(customerData) {
        console.log('Adding customer:', customerData);
        // In real app, would save to database
        return {
            id: 'CUST-' + Date.now(),
            ...customerData,
            created: new Date().toISOString()
        };
    }
    
    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.saputApp = new SAPUTGlassSystem();
    
    // Add current date time element if not exists
    const header = document.querySelector('.dashboard-header');
    if (header && !document.getElementById('currentDateTime')) {
        const dateTimeDiv = document.createElement('div');
        dateTimeDiv.className = 'text-muted small mt-2';
        dateTimeDiv.id = 'currentDateTime';
        header.appendChild(dateTimeDiv);
        window.saputApp.updateDateTime();
    }
});
