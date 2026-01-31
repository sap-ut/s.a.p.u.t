// DATABASE STRUCTURE FOR S.A.P.U.T. GLASS WORKS

// This file contains the database schema and initial data

const databaseSchema = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    tables: {
        customers: {
            fields: ['id', 'name', 'address', 'city', 'state', 'gst', 'phone', 'email', 'createdAt']
        },
        items: {
            fields: ['id', 'code', 'name', 'type', 'rate', 'unit', 'category', 'createdAt']
        },
        orders: {
            fields: ['id', 'orderNo', 'date', 'customerId', 'type', 'status', 'total', 'items', 'createdAt']
        },
        proformas: {
            fields: ['id', 'piNumber', 'date', 'customerId', 'items', 'totalArea', 'subtotal', 'gst', 'grandTotal', 'status']
        },
        users: {
            fields: ['id', 'username', 'password', 'name', 'role', 'permissions', 'lastLogin']
        },
        settings: {
            fields: ['companyName', 'address', 'gstin', 'phone', 'email', 'taxRate', 'currency', 'logo']
        }
    }
};

// Default Settings
const defaultSettings = {
    companyName: 'S.A.P.U.T. Glass Works',
    address: 'Industrial Area, City, State - PIN Code',
    gstin: '22AAAAA0000A1Z5',
    phone: '9876543210',
    email: 'info@saputglass.com',
    taxRate: 18,
    currency: '₹',
    logo: 'S.A.P.U.T.'
};

// Initialize database if not exists
function initializeDatabase() {
    if (!localStorage.getItem('saput_database_initialized')) {
        console.log('Initializing S.A.P.U.T. Database...');
        
        // Save schema
        localStorage.setItem('saput_schema', JSON.stringify(databaseSchema));
        
        // Save default settings
        localStorage.setItem('saput_settings', JSON.stringify(defaultSettings));
        
        // Mark as initialized
        localStorage.setItem('saput_database_initialized', 'true');
        
        console.log('Database initialized successfully');
    }
}

// Database helper functions
const db = {
    // Save data to localStorage
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            return false;
        }
    },
    
    // Load data from localStorage
    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from database:', error);
            return null;
        }
    },
    
    // Clear database
    clear: function() {
        const keys = [
            'saput_customers',
            'saput_items',
            'saput_orders',
            'saput_proformas',
            'saput_users',
            'saput_settings'
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        localStorage.removeItem('saput_database_initialized');
        
        alert('Database cleared successfully!');
        location.reload();
    },
    
    // Export database as JSON
    exportData: function() {
        const data = {
            customers: db.load('saput_customers') || [],
            items: db.load('saput_items') || [],
            orders: db.load('saput_orders') || [],
            proformas: db.load('saput_proformas') || [],
            settings: db.load('saput_settings') || defaultSettings,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `saput_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Import database from JSON
    importData: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.customers) db.save('saput_customers', data.customers);
                if (data.items) db.save('saput_items', data.items);
                if (data.orders) db.save('saput_orders', data.orders);
                if (data.proformas) db.save('saput_proformas', data.proformas);
                if (data.settings) db.save('saput_settings', data.settings);
                
                alert('Data imported successfully! Page will reload.');
                location.reload();
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    },
    
    // Get dashboard statistics
    getStats: function() {
        const orders = db.load('saput_orders') || [];
        const customers = db.load('saput_customers') || [];
        const today = new Date().toISOString().split('T')[0];
        
        return {
            totalOrders: orders.length,
            totalCustomers: customers.length,
            todayOrders: orders.filter(o => o.date === today).length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            pendingOrders: orders.filter(o => o.status === 'draft' || o.status === 'approved').length
        };
    }
};

// Initialize on load
initializeDatabase();

// Make db object available globally
window.db = db;