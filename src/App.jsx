// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react'; // Added useState, useMemo, useEffect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Import CssBaseline
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context and Components
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import LoginPage from './components/LoginPage'; // Import LoginPage

// Layout and Pages
import MainLayout from './layouts/MainLayout';
import HomePageContent from './components/HomePageContent';
import StoreSalesAnalytics from './components/StoreSalesAnalytics';
import ExpirationAlertsDashboard from './components/ExpirationAlertsDashboard';
import DynamicPricingDashboard from './components/DynamicPricingDashboard';
import PersonalizedPromotionsDashboard from './components/PersonalizedPromotionsDashboard';
import CustomerBehaviorDashboard from './components/CustomerBehaviorDashboard';
import CustomerExperienceDashboard from './components/CustomerExperienceDashboard';
import InventoryOptimizationDashboard from './components/InventoryOptimizationDashboard';
import SecurityOperationsDashboard from './components/SecurityOperationsDashboard';
import EnergyManagementDashboard from './components/EnergyManagementDashboard';
import WasteManagementDashboard from './components/WasteManagementDashboard';
import RoutePlanningDashboard from './components/RoutePlanningDashboard';
import EmployeeProductivityDashboard from './components/EmployeeProductivityDashboard';
import PurchaseOptimizationDashboard from './components/PurchaseOptimizationDashboard';
import FinancialOverviewDashboard from './components/FinancialOverviewDashboard';


// Guides
import StoreSalesDashboardGuide from './components/StoreSalesDashboardGuide';
import ExpirationAlertsDashboardGuide from './components/ExpirationAlertsDashboardGuide';
import DynamicPricingDashboardGuide from './components/DynamicPricingDashboardGuide';
import PersonalizedPromotionsDashboardGuide from './components/PersonalizedPromotionsDashboardGuide';
import CustomerBehaviorDashboardGuide from './components/CustomerBehaviorDashboardGuide';
import CustomerExperienceDashboardGuide from './components/CustomerExperienceDashboardGuide';
import InventoryOptimizationDashboardGuide from './components/InventoryOptimizationDashboardGuide';
import SecurityOperationsDashboardGuide from './components/SecurityOperationsDashboardGuide';
import EnergyManagementDashboardGuide from './components/EnergyManagementDashboardGuide';
import WasteManagementDashboardGuide from './components/WasteManagementDashboardGuide';
import RoutePlanningDashboardGuide from './components/RoutePlanningDashboardGuide';
import EmployeeProductivityDashboardGuide from './components/EmployeeProductivityDashboardGuide';
import PurchaseOptimizationDashboardGuide from './components/PurchaseOptimizationDashboardGuide';
import FinancialOverviewDashboardGuide from './components/FinancialOverviewDashboardGuide';

// Import the context
import ColorModeContext from './contexts/ColorModeContext';

// Define base theme options
const baseThemeOptions = {
    typography: {
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        h6: {
            fontSize: '1.15rem', // AppBar title size
        },
    },
    components: {
        MuiAppBar: {
             styleOverrides: {
                 // Default AppBar styles (will be slightly adjusted based on mode)
                 root: ({ theme }) => ({
                     // Use paper background which changes with mode
                     backgroundColor: theme.palette.background.paper,
                     // Text/Icon color needs to contrast with paper
                     color: theme.palette.text.primary,
                     boxShadow: theme.shadows[2],
                 }),
             },
         },
        MuiDrawer: {
             styleOverrides: {
                 paper: ({ theme }) => ({
                     // Optional: Slightly different background for drawer in light mode
                     backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
                     borderRight: `1px solid ${theme.palette.divider}`,
                 }),
             },
         },
         // Ensure IconButton color inherits correctly in the AppBar
         MuiIconButton: {
             styleOverrides: {
                 root: ({ ownerState, theme }) => ({
                     // For icons in AppBar (like Menu, Theme toggle) that use color="inherit"
                     ...(ownerState.color === 'inherit' && {
                        color: theme.palette.text.primary // Ensure contrast against paper background
                     }),
                  }),
             }
         },
         // Adjust TableCell head for better contrast in both modes
         MuiTableCell: {
             styleOverrides: {
                head: ({ theme }) => ({
                     backgroundColor: theme.palette.mode === 'dark'
                         ? theme.palette.grey[800] // Darker grey for dark mode header
                         : theme.palette.grey[100], // Lighter grey for light mode header
                     color: theme.palette.text.primary, // Ensure text contrasts
                     fontWeight: 'bold',
                 }),
             }
         },
         // Adjust selected item background for better visibility in dark mode
         MuiListItemButton: {
             styleOverrides: {
                 root: ({ theme }) => ({
                    '&.Mui-selected': {
                       backgroundColor: theme.palette.action.selected,
                       '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                       },
                    },
                 }),
             },
         }
    }
};

// Function to get the theme configuration based on mode
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        primary: {
            main: '#002575', // Metro Dark Blue
        },
        secondary: {
            main: '#d60812', // Metro Red
        },
        ...(mode === 'light'
            ? {
                // Light Mode Palette
                background: {
                    default: '#f4f6f8',
                    paper: '#ffffff',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                    disabled: 'rgba(0, 0, 0, 0.38)',
                },
                divider: 'rgba(0, 0, 0, 0.12)',
                action: { // Define action colors explicitly for light mode
                    active: 'rgba(0, 0, 0, 0.54)',
                    hover: 'rgba(0, 0, 0, 0.04)',
                    selected: 'rgba(0, 0, 0, 0.08)', // Selection background
                    disabled: 'rgba(0, 0, 0, 0.26)',
                    disabledBackground: 'rgba(0, 0, 0, 0.12)',
                },
                // Define grey palette for light mode consistency
                grey: { 50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', /*...*/ }
              }
            : {
                // Dark Mode Palette
                background: {
                    default: '#121212',
                    paper: '#1e1e1e', // Common dark paper color
                },
                text: {
                    primary: '#ffffff',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                    disabled: 'rgba(255, 255, 255, 0.5)',
                },
                divider: 'rgba(255, 255, 255, 0.12)',
                action: { // Define action colors explicitly for dark mode
                    active: '#ffffff',
                    hover: 'rgba(255, 255, 255, 0.08)',
                    selected: 'rgba(255, 255, 255, 0.16)', // Selection background
                    disabled: 'rgba(255, 255, 255, 0.3)',
                    disabledBackground: 'rgba(255, 255, 255, 0.12)',
                },
                 // Define grey palette for dark mode consistency
                 grey: { 800: '#424242', /* ... */ } // Example, add others if needed
              }),
         // Common colors
         error: { main: '#f44336' }, // Adjusted error for potentially better dark mode contrast
         warning: { main: '#ffa726' }, // Adjusted warning
         info: { main: '#29b6f6' }, // Adjusted info
         success: { main: '#66bb6a' }, // Adjusted success
    },
    // Spread the base options & specific component overrides for this mode
    ...baseThemeOptions,
});


function App() {
    const [mode, setMode] = useState(() => {
        try {
            // const savedMode = localStorage.getItem('themeMode');
            const savedMode = 'light';
            return savedMode ? savedMode : 'light';
        } catch (error) {
            return 'light';
        }
    });


    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    try {
                        localStorage.setItem('themeMode', newMode);
                    } catch (error) {
                         console.error("Could not save theme mode to localStorage", error);
                    }
                    return newMode;
                });
            },
        }),
        [],
    );

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme /> {/* enableColorScheme helps with browser defaults */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            {/* Public Login Route */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected Routes - All routes within MainLayout require login */}
                            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                                <Route index element={<HomePageContent />} />
                                {/* Dashboard Routes */}
                                <Route path="store-sales" element={<StoreSalesAnalytics />} />
                                <Route path="dynamic-pricing" element={<DynamicPricingDashboard />} />
                                <Route path="purchase-optimization" element={<PurchaseOptimizationDashboard />} />
                                <Route path="personalized-promotions" element={<PersonalizedPromotionsDashboard />} />
                                <Route path="customer-behavior" element={<CustomerBehaviorDashboard />} />
                                <Route path="customer-experience" element={<CustomerExperienceDashboard />} />
                                <Route path="security-operations" element={<SecurityOperationsDashboard />} />
                                <Route path="inventory-expiration" element={<ExpirationAlertsDashboard />} />
                                <Route path="inventory-optimization" element={<InventoryOptimizationDashboard />} />
                                <Route path="energy-management" element={<EnergyManagementDashboard />} />
                                <Route path="waste-management" element={<WasteManagementDashboard />} />
                                <Route path="route-planning" element={<RoutePlanningDashboard />} />
                                <Route path="employee-productivity" element={<EmployeeProductivityDashboard />} />
                                <Route path="financial-overview" element={<FinancialOverviewDashboard />} /> 

                                {/* Guide Routes */}
                                <Route path="/guides/store-sales" element={<StoreSalesDashboardGuide />} />
                                <Route path="/guides/dynamic-pricing" element={<DynamicPricingDashboardGuide />} />
                                <Route path="/guides/purchase-optimization" element={<PurchaseOptimizationDashboardGuide />} />
                                <Route path="/guides/personalized-promotions" element={<PersonalizedPromotionsDashboardGuide />} />
                                <Route path="/guides/customer-behavior" element={<CustomerBehaviorDashboardGuide />} />
                                <Route path="/guides/customer-experience" element={<CustomerExperienceDashboardGuide />} />
                                <Route path="/guides/security-operations" element={<SecurityOperationsDashboardGuide />} />
                                <Route path="/guides/inventory-expiration" element={<ExpirationAlertsDashboardGuide />} />
                                <Route path="/guides/inventory-optimization" element={<InventoryOptimizationDashboardGuide />} />
                                <Route path="/guides/energy-management" element={<EnergyManagementDashboardGuide />} />
                                <Route path="/guides/waste-management" element={<WasteManagementDashboardGuide />} />
                                <Route path="/guides/route-planning" element={<RoutePlanningDashboardGuide />} />
                                <Route path="/guides/employee-productivity" element={<EmployeeProductivityDashboardGuide />} />
                                <Route path="/guides/financial-overview" element={<FinancialOverviewDashboardGuide />} />

                                {/* Catch-all */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Route>
                        </Routes>
                        </AuthProvider>
                    </BrowserRouter>
                </LocalizationProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;