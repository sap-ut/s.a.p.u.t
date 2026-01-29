import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PerformanceBilling from './pages/Billing/PerformanceBilling';
import BillingList from './pages/Billing/BillingList';
import BillingView from './pages/Billing/BillingView';

// Inventory Pages
import Inventory from './pages/Inventory/Inventory';
import RawMaterials from './pages/Inventory/RawMaterials';
import FinishedGoods from './pages/Inventory/FinishedGoods';

// Production Pages
import Production from './pages/Production/Production';
import ProductionOrders from './pages/Production/Orders';
import QualityControl from './pages/Production/QualityControl';

// Sales Pages
import Sales from './pages/Sales/Sales';
import Customers from './pages/Sales/Customers';
import Quotations from './pages/Sales/Quotations';

// Settings Pages
import Settings from './pages/Settings/Settings';
import Profile from './pages/Settings/Profile';
import Users from './pages/Settings/Users';
import CompanySettings from './pages/Settings/Company';

// Reports
import Reports from './pages/Reports/Reports';
import Analytics from './pages/Reports/Analytics';

// Protected Route
import PrivateRoute from './components/PrivateRoute';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a252f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#21618c',
      contrastText: '#ffffff',
    },
    success: {
      main: '#27ae60',
      light: '#2ecc71',
      dark: '#229954',
    },
    warning: {
      main: '#f39c12',
      light: '#f1c40f',
      dark: '#d68910',
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
    },
    info: {
      main: '#2980b9',
      light: '#3498db',
      dark: '#1f618d',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(44, 62, 80, 0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2980b9 0%, #1f618d 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(52, 152, 219, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16)',
        },
      },
    },
  },
});

// Custom styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .gradient-primary {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .gradient-secondary {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }
  
  .gradient-success {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  }
  
  .gradient-warning {
    background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
  }
  
  .gradient-danger {
    background: linear-gradient(135deg, #e74c3c 0%, #ec7063 100%);
  }
  
  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #3498db;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #2980b9;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .slide-in {
    animation: slideIn 0.3s ease-in-out;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  /* Utility Classes */
  .text-gradient {
    background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .shadow-lg {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }
  
  /* Performance Bill Specific */
  .performance-table th {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white !important;
  }
  
  .performance-table tr:hover {
    background-color: rgba(52, 152, 219, 0.05) !important;
  }
  
  .dimension-cell {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 8px 12px;
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }
  
  .amount-cell {
    font-weight: 700;
    color: #27ae60;
    font-size: 1.1em;
  }
  
  .qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 2px dashed #3498db;
  }
  
  /* Dashboard Cards */
  .stats-card {
    border-radius: 16px !important;
    color: white !important;
    padding: 24px !important;
    transition: all 0.3s ease !important;
  }
  
  .stats-card:hover {
    transform: translateY(-10px) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding-left: 16px;
      padding-right: 16px;
    }
    
    .performance-table {
      font-size: 12px;
    }
  }
  
  /* Powered By Footer */
  .powered-by-footer {
    background: #1a252f;
    color: white;
    padding: 15px 0;
    text-align: center;
    font-size: 0.9rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .powered-by-text {
    font-weight: 600;
    color: #3498db;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .powered-by-badge {
    background: rgba(52, 152, 219, 0.2);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    border: 1px solid #3498db;
    font-size: 0.8rem;
  }
`;

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add global styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(styleElement);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>GlassERP Pro</h2>
          <p>Loading your ERP system...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2c3e50',
            color: '#fff',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#27ae60',
            },
          },
          error: {
            style: {
              background: '#e74c3c',
            },
          },
        }}
      />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Billing Routes */}
                <Route path="/billing" element={<Navigate to="/billing/performance" replace />} />
                <Route path="/billing/performance" element={<PerformanceBilling />} />
                <Route path="/billing/list" element={<BillingList />} />
                <Route path="/billing/view/:id" element={<BillingView />} />
                
                {/* Inventory Routes */}
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/raw-materials" element={<RawMaterials />} />
                <Route path="/inventory/finished-goods" element={<FinishedGoods />} />
                
                {/* Production Routes */}
                <Route path="/production" element={<Production />} />
                <Route path="/production/orders" element={<ProductionOrders />} />
                <Route path="/production/quality" element={<QualityControl />} />
                
                {/* Sales Routes */}
                <Route path="/sales" element={<Sales />} />
                <Route path="/sales/customers" element={<Customers />} />
                <Route path="/sales/quotations" element={<Quotations />} />
                
                {/* Settings Routes */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route path="/settings/users" element={<Users />} />
                <Route path="/settings/company" element={<CompanySettings />} />
                
                {/* Reports Routes */}
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/analytics" element={<Analytics />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Powered By Footer */}
            <footer className="powered-by-footer">
              <div className="container">
                <p>
                  © 2024 GlassERP Pro. All rights reserved. 
                  <span className="powered-by-text ms-2">
                    Powered by <span className="powered-by-badge">S.A.P.U.T</span>
                  </span>
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
