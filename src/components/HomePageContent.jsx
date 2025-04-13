// src/components/HomePageContent.jsx
import React from 'react';
import { Box, Typography, Grid, Paper, IconButton, Tooltip as MuiTooltip, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- Import Icons (as before) ---
import StorefrontIcon from '@mui/icons-material/Storefront';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CampaignIcon from '@mui/icons-material/Campaign';
import RouteIcon from '@mui/icons-material/Route';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InventoryIcon from '@mui/icons-material/Inventory';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import InfoIcon from '@mui/icons-material/Info';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// --- Pastel Colors (as before) ---
const pastelColors = [
    '#FFDDC1', '#C1FFD7', '#DDC1FF', '#FFFAC1', '#C1E1FF', '#FFC1E1',
    '#D4F0F0', '#F0D4D4', '#E1F0D4', '#D4D4F0', '#F0E1D4', '#FFEBCC',
    '#CCFFEB', '#EBCCFF'
];

// --- Dashboard Data (as before) ---
const dashboardItems = [
    { name: 'Store Sales', icon: <StorefrontIcon />, path: '/store-sales', guidePath: '/guides/store-sales' },
    { name: 'Financial Overview', icon: <MonetizationOnIcon />, path: '/financial-overview', guidePath: '/guides/financial-overview' },
    { name: 'Dynamic Pricing', icon: <PriceChangeIcon />, path: '/dynamic-pricing', guidePath: '/guides/dynamic-pricing' },
    { name: 'Purchase Optimization', icon: <ShoppingCartCheckoutIcon />, path: '/purchase-optimization', guidePath: '/guides/purchase-optimization' },
    { name: 'Personalized Promotions', icon: <CampaignIcon />, path: '/personalized-promotions', guidePath: '/guides/personalized-promotions' },
    { name: 'Customer Behavior', icon: <RouteIcon />, path: '/customer-behavior', guidePath: '/guides/customer-behavior' },
    { name: 'Customer Experience', icon: <SupportAgentIcon />, path: '/customer-experience', guidePath: '/guides/customer-experience' },
    { name: 'Security Operations', icon: <SecurityIcon />, path: '/security-operations', guidePath: '/guides/security-operations' },
    { name: 'Inventory Expiration', icon: <ScheduleIcon />, path: '/inventory-expiration', guidePath: '/guides/inventory-expiration' },
    { name: 'Inventory Optimization', icon: <InventoryIcon />, path: '/inventory-optimization', guidePath: '/guides/inventory-optimization' },
    { name: 'Energy Management', icon: <OfflineBoltIcon />, path: '/energy-management', guidePath: '/guides/energy-management' },
    { name: 'Waste Management', icon: <DeleteSweepIcon />, path: '/waste-management', guidePath: '/guides/waste-management' },
    { name: 'Route Planning', icon: <AltRouteIcon />, path: '/route-planning', guidePath: '/guides/route-planning' },
    { name: 'Employee Productivity', icon: <GroupIcon />, path: '/employee-productivity', guidePath: '/guides/employee-productivity' },
];


// --- Icon Card Component ---
const DashboardIconCard = ({ name, icon, path, guidePath, color }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    // No need for isMobile check within this component anymore

    const handleNavigate = (targetPath) => (event) => {
        event.stopPropagation();
        navigate(targetPath);
    };

    const iconTextColor = theme.palette.getContrastText(color);
    // Keep icon size potentially responsive if needed, but card size will be controlled by parent Grid item
    const iconSize = { xs: 44, sm: 56 }; // Example responsive icon size

    return (
        // Outer Box remains for text alignment below the card
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', // Takes width from parent Grid item
                cursor: 'pointer',
            }}
            onClick={handleNavigate(path)}
        >
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 1.5, sm: 2 }, // Original responsive padding
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%', // **Critical:** Let the Grid item control the width
                    aspectRatio: '1 / 1', // Keep it square
                    borderRadius: '20px',
                    backgroundColor: color,
                    position: 'relative',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                    },
                     overflow: 'hidden',
                     mb: 1, // Margin below card
                }}
            >
                <MuiTooltip title={`Go to ${name} Guide`} placement="top">
                    <IconButton
                        size="small"
                        onClick={handleNavigate(guidePath)}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: iconTextColor,
                            opacity: 0.65,
                            zIndex: 1,
                            padding: '2px',
                            '&:hover': {
                                opacity: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            }
                        }}
                        aria-label={`guide for ${name}`}
                    >
                        <InfoIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                </MuiTooltip>
                <Box sx={{ color: iconTextColor }}>
                    {/* Apply responsive icon size */}
                    {React.cloneElement(icon, { sx: { fontSize: iconSize } })}
                </Box>
            </Paper>
            <Typography
                variant="body2" // Back to body2 for slightly larger text
                component="div"
                align="center"
                sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    lineHeight: 1.3,
                    width: '100%', // Allow text to use available space
                    wordWrap: 'break-word',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }, // Original responsive font size
                }}
            >
                {name}
            </Typography>
        </Box>
    );
};


const HomePageContent = () => {
    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center', // Center the grid container horizontally
            alignItems: 'center', // Center the grid container vertically (if parent allows)
            p: { xs: 2, sm: 3, md: 4 } // Padding around the grid
        }}>
            {/* Constrain the overall width of the Grid container on larger screens */}
            <Box sx={{ width: { xs: '100%', sm: '90%', md: '75%', lg: '60%' } }}> {/* Adjust percentages */}
                <Grid
                    container
                    spacing={{ xs: 2, sm: 2.5 }} // Slightly reduced spacing for desktop
                    justifyContent="center" // Center items within the constrained container
                >
                    {dashboardItems.map((item, index) => (
                        // xs=4 (3/row); sm=3 (4/row)
                        <Grid item xs={4} sm={3} key={item.path}>
                            <DashboardIconCard
                                name={item.name}
                                icon={item.icon}
                                path={item.path}
                                guidePath={item.guidePath}
                                color={pastelColors[index % pastelColors.length]}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default HomePageContent;