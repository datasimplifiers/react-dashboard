// src/layouts/MainLayout.jsx
import React, { useState, useContext, useMemo } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; 
import useMediaQuery from '@mui/material/useMediaQuery'; // <--- IMPORT useMediaQuery
import { useAuth } from '../contexts/AuthContext.jsx'; // Ensure path is correct

// Theme toggle icons (keep if using theme toggle later)
// import Brightness4Icon from '@mui/icons-material/Brightness4';
// import Brightness7Icon from '@mui/icons-material/Brightness7';

// Navigation Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Keep for potential fallback
import HomeIcon from '@mui/icons-material/Home'; // Import HomeIcon explicitly

// Import Menu Item Icons (Keep all relevant icons)
import StorefrontIcon from '@mui/icons-material/Storefront';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CampaignIcon from '@mui/icons-material/Campaign';
import RouteIcon from '@mui/icons-material/Route'; // Customer Behavior
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InventoryIcon from '@mui/icons-material/Inventory';
import HelpIcon from '@mui/icons-material/Help'; // Keep for Guides if needed elsewhere
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AltRouteIcon from '@mui/icons-material/AltRoute'; // Route Planning
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { drawerWidth, collapsedDrawerWidth } from '../constants'; // Ensure path is correct
import MetroLogo from '../components/MetroLogo'; // Ensure path is correct
import ColorModeContext from '../contexts/ColorModeContext'; // Keep if using theme toggle later

// --- Styled Components ---
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: 0,
   [theme.breakpoints.up('sm')]: {
       width: `${collapsedDrawerWidth}px`,
   },
});
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open', })(({ theme, open }) => ({
   zIndex: theme.zIndex.drawer + 1,
   transition: theme.transitions.create(['width', 'margin'], {
     easing: theme.transitions.easing.sharp,
     duration: theme.transitions.duration.leavingScreen,
   }),
   ...(open && {
      [theme.breakpoints.up('sm')]: {
         marginLeft: drawerWidth,
         width: `calc(100% - ${drawerWidth}px)`,
         transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
         }),
     },
   }),
 }));
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

// --- Footer Component ---
const Footer = () => (
    <Box
        component="footer"
        sx={{
            py: 1,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
             borderTop: '1px solid',
             borderColor: (theme) => theme.palette.divider,
             textAlign: 'center',
        }}
        >
        <Typography variant="body2" color="text.secondary">
            {'© '}
            {new Date().getFullYear()}
            {' Metro Markets Egypt. All Rights Reserved.'}
        </Typography>
    </Box>
);


// --- Main Layout Component ---
export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <--- USE HOOK
  // const colorMode = useContext(ColorModeContext); // Keep if needed for future toggle
  const [open, setOpen] = useState(false); // Sidebar starts collapsed
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen(!open);
  const handleLogout = () => logout();

  const displayName = user?.name || user?.username || 'User';

  // Define Menu Items (needed for icon lookup)
  const menuItems = useMemo(() => [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Store Sales', icon: <StorefrontIcon />, path: '/store-sales' },
    { text: 'Financial Overview', icon: <MonetizationOnIcon />, path: '/financial-overview' },
    { text: 'Dynamic Pricing', icon: <PriceChangeIcon />, path: '/dynamic-pricing' },
    { text: 'Purchase Optimization', icon: <ShoppingCartCheckoutIcon />, path: '/purchase-optimization' },
    { text: 'Personalized Promotions', icon: <CampaignIcon />, path: '/personalized-promotions' },
    { text: 'Customer Behavior', icon: <RouteIcon />, path: '/customer-behavior' },
    { text: 'Customer Experience', icon: <SupportAgentIcon />, path: '/customer-experience' },
    { text: 'Security Operations', icon: <SecurityIcon />, path: '/security-operations' },
    { text: 'Inventory Expiration', icon: <ScheduleIcon />, path: '/inventory-expiration' },
    { text: 'Inventory Optimization', icon: <InventoryIcon />, path: '/inventory-optimization' },
    { text: 'Energy Management', icon: <OfflineBoltIcon />, path: '/energy-management' },
    { text: 'Waste Management', icon: <DeleteSweepIcon />, path: '/waste-management' },
    { text: 'Route Planning', icon: <AltRouteIcon />, path: '/route-planning' },
    { text: 'Employee Productivity', icon: <GroupIcon />, path: '/employee-productivity' },
  ], []); // Empty dependency array, runs once

  // Create a map for quick icon lookup based on dashboard path
  const dashboardIconMap = useMemo(() => {
    const map = new Map();
    menuItems.forEach(item => {
      if (item.path !== '/') { // Exclude home
        map.set(item.path, { icon: item.icon, text: item.text });
      }
    });
    return map;
  }, [menuItems]);


  // --- Dynamic Button Logic ---
  let dynamicButtonProps = null; // Store props for the button here

  const isHomePage = location.pathname === '/';
  const isGuidePage = location.pathname.startsWith('/guides/');
  const isDashboardPage = !isHomePage && !isGuidePage;

  if (isDashboardPage) {
    dynamicButtonProps = {
      icon: <HomeIcon />,
      tooltip: 'Back to Home',
      path: '/',
    };
  } else if (isGuidePage) {
    const pathParts = location.pathname.split('/');
    if (pathParts.length === 3 && pathParts[1] === 'guides') {
      const dashboardName = pathParts[2];
      const dashboardPath = `/${dashboardName}`;
      const dashboardInfo = dashboardIconMap.get(dashboardPath);

      if (dashboardInfo) {
        dynamicButtonProps = {
          icon: dashboardInfo.icon, // Use the specific dashboard icon
          tooltip: `Back to ${dashboardInfo.text} Dashboard`,
          path: dashboardPath,
        };
      }
    }
  }
  // --- End Dynamic Button Logic ---


  // --- Handle Menu Item Click --- <--- ADD THIS FUNCTION
  const handleMenuItemClick = () => {
    if (isMobile) { // Only close drawer if on mobile
      setOpen(false);
    }
    // Navigation will still happen via RouterLink component prop
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />

      <AppBar position="fixed" open={open}>
        {/* Toolbar naturally uses flex display */}
        <Toolbar>
          {/* Left Group: Buttons and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start" // Keep edge start for consistency
              sx={{ marginRight: 1 }} // Consistent margin
            >
              <MenuIcon />
            </IconButton>

            {dynamicButtonProps && (
               <Tooltip title={dynamicButtonProps.tooltip}>
                  <IconButton
                      color="inherit"
                      aria-label={dynamicButtonProps.tooltip}
                      onClick={() => navigate(dynamicButtonProps.path)}
                      // No edge needed here, spacing handled by marginRight
                      sx={{ marginRight: 1 }} // Margin between dynamic button and logo
                  >
                     {dynamicButtonProps.icon}
                  </IconButton>
                </Tooltip>
             )}

            <MetroLogo sx={{
                  height: '38px',
                  width: 'auto',
                  display: 'flex', // Keep if needed by MetroLogo component
                  alignItems: 'center',
                  // No flexGrow here
               }}
            />
          </Box>

          {/* Spacer Box: This takes up the available space */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right Group: Welcome Text and Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Display Username (Hidden on mobile) */}
              {user && (
                <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}> {/* Margin right to space from logout */}
                 <Typography variant="body2">
                    Welcome, {displayName}
                 </Typography>
                 </Box>
              )}
              {/* Logout Button */}
              <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ minWidth: { xs: 'auto', sm: 'auto' }, px: { xs: 1, sm: 1 } }}
              >
                 {/* Hide text on mobile */}
                 <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }}}>
                    Logout
                 </Box>
              </Button>
          </Box>

        </Toolbar>
      </AppBar>

      {/* --- Sidebar --- */}
       <Drawer variant="permanent" open={open}>
         <DrawerHeader>
            {open && (
                 <Typography variant="h6" sx={{ flexGrow: 1, pl: 2, fontWeight: 'bold' }}>
                    METRO MARKETS
                 </Typography>
            )}
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
           {menuItems.map((item, index) => (
             <ListItem key={item.path || `item-${index}`} disablePadding sx={{ display: 'block' }}>
                {/* Attach onClick handler here */}
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={handleMenuItemClick} // <--- ATTACH HANDLER
                   sx={{
                     minHeight: 48, // Or your adjusted height
                     py: 0.5,       // Or your adjusted padding
                     justifyContent: open ? 'initial' : 'center',
                     px: 2.5,
                     '&.Mui-selected': { // Style from theme overrides
                        backgroundColor: theme.palette.action.selected,
                        '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        }
                     },
                   }}
                >
                  <ListItemIcon
                     sx={{
                       minWidth: 0,
                       mr: open ? 3 : 'auto',
                       justifyContent: 'center',
                       color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary,
                     }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
           ))}
        </List>
       </Drawer>

      {/* --- Main Content Area --- */}
      <Box
          component="main"
          sx={{
              flexGrow: 1,
              p: 3,
              mt: theme.mixins.toolbar.minHeight ? `${theme.mixins.toolbar.minHeight}px` : '64px',
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              marginLeft: 0,
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                marginLeft: `${collapsedDrawerWidth}px`,
                width: `calc(100% - ${collapsedDrawerWidth}px)`,
                ...(open && {
                  marginLeft: `${drawerWidth}px`,
                  width: `calc(100% - ${drawerWidth}px)`,
                  transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                }),
              },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              // Ensure minHeight calculation handles potential undefined toolbar height
              minHeight: `calc(100vh - ${(theme.mixins.toolbar.minHeight || 64)}px - 38px)`, // Approx Footer height
          }}
      >
          <Box sx={{flexGrow: 1}}>
              <Outlet />
          </Box>
      </Box>

      {/* --- Footer --- */}
      <Footer />

    </Box>
  );
}