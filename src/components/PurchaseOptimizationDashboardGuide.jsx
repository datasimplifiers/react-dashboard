// src/components/PurchaseOptimizationDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const PurchaseOptimizationDashboardGuide = () => {
  const refreshIntervalSeconds = 300; // Match dashboard constant

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Purchase Order Optimization
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard helps analyze the purchasing process, focusing on supplier performance, cost-effectiveness, and delivery timeliness. It uses Purchase Order (PO) data to identify opportunities for optimizing procurement strategies, negotiating better terms, and ensuring reliable stock inflow.
          The main goals are to:
        </Typography>
        <List dense>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><BusinessIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Evaluate supplier reliability based on On-Time Delivery (OTD) rates and lead time consistency." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleOutlineIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track the overall percentage of POs received on time." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze actual lead times compared to planned lead times." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><AccessAlarmIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify suppliers or products with significant lead time variances (delays or early arrivals)." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><PriceCheckIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor purchase price variance against base costs or market prices (simulated)." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze total purchasing spend and average PO value." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify product categories with high price variance." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><ShoppingCartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Provide detailed visibility into individual PO status and details." /></ListItem>
        </List>
         <Typography variant="body2" sx={{mt: 1}}>
            Use these insights for supplier negotiations, inventory planning adjustments, identifying cost-saving opportunities, and improving the overall efficiency of the procurement cycle.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Refine the purchase order data shown using these filters:
            </Typography>
            <List dense>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><BusinessIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Supplier:</strong>} secondary="Select a specific supplier or 'All Suppliers'." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Category:</strong>} secondary="Filter by product category." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Receiving Store:</strong>} secondary="Filter by the store location where the order was received." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Receipt Status:</strong>} secondary="Filter by the delivery status (On-Time, Late, Early, Partially Received)." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Select the PO order date range." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Button:</strong>} secondary="Resets all filters (Supplier, Category, Location, Status) to 'ALL'." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                KPIs, charts, and the details table update based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                A high-level overview of purchasing performance:
                </Typography>
                <List dense>
                   <ListItem><ListItemText primary={<strong>Total PO Value:</strong>} secondary="Total monetary value (EGP) of all placed purchase orders in the filtered period." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Total POs:</strong>} secondary="Total count of purchase orders placed." /></ListItem>
                   <ListItem><ListItemText primary={<strong>OTD Rate:</strong>} secondary="Percentage of POs received 'On-Time' (within +/- tolerance of expected date) and fully." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Lead Time:</strong>} secondary="Average actual time (days) between placing an order and receiving it." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg LT Variance:</strong>} secondary="Average difference (days) between actual and planned lead times. Positive (+) means longer than planned." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Price Var %:</strong>} secondary="Average absolute percentage difference between PO unit price and the product's base unit cost (weighted by order value)." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg PO Value:</strong>} secondary="Average monetary value (EGP) per purchase order." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Top Supplier:</strong>} secondary="The supplier with the highest total PO value." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    Hover over cards for tooltips. Variance KPI colors indicate performance (Red=Worse, Green=Better).
                </Typography>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                    <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. On-Time Delivery Rate by Supplier</Typography>
                    <Typography variant="body2" paragraph>
                        This vertical bar chart ranks suppliers based on their On-Time Delivery (OTD) percentage (worst to best). Green indicates high OTD ({">"}95%), Red low ({"<"}80%).
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Supplier Reliability:</strong>} secondary="Quickly identify suppliers who consistently deliver on time versus those who are frequently late." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Negotiation Points:</strong>} secondary="Use this data during supplier reviews and contract negotiations." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Avg. Lead Time Variance by Supplier (Days)</Typography>
                    <Typography variant="body2" paragraph>
                        Ranks suppliers by their average lead time variance (Actual - Planned days, highest/worst first). Red indicates significantly longer than planned ({">"}1 day), Green significantly shorter ({"<"}-1 day).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Lead Time Predictability:</strong>} secondary="Identify suppliers whose delivery times are consistently longer or shorter than their stated lead times." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Inventory Planning:</strong>} secondary="Adjust safety stock or order points based on reliable actual lead times, not just planned ones." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. PO Value by Supplier (Top 15)</Typography>
                     <Typography variant="body2" paragraph>
                       Shows the total purchase order value attributed to the top 15 suppliers by spend.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Key Suppliers:</strong>} secondary="Identify the suppliers representing the largest portion of purchasing spend." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Strategic Focus:</strong>} secondary="Helps prioritize relationship management and negotiation efforts." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Avg Price Variance % vs Cost by Category</Typography>
                     <Typography variant="body2" paragraph>
                        Compares the average absolute percentage difference between the PO unit price and the product's base unit cost, across different product categories. Higher bars indicate greater price volatility or deviation from base cost within that category.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Cost Control Focus:</strong>} secondary="Highlight categories where purchase prices deviate most significantly from base costs." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Negotiation/Sourcing Opportunities:</strong>} secondary="Suggests categories where price negotiation or exploring alternative suppliers might yield savings." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Lead Time Variance vs. PO Value</Typography>
                     <Typography variant="body2" paragraph>
                         This scatter plot shows the relationship between the value of a purchase order (X-axis) and its lead time variance in days (Y-axis). Each dot is a PO (sampled).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Identify Problem POs:</strong>} secondary="Points high on the Y-axis represent significantly delayed orders. Hover for details (PO#, Supplier)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Value Impact:</strong>} secondary="See if higher value POs tend to experience more or less lead time variance." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>


                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>6. Purchase Order Details Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed, filterable, and sortable log of individual purchase orders and their line items (simplified to one product per PO in mock data).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Granular View:</strong>} secondary="Examine specific PO details." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting & Filtering:</strong>} secondary="Click headers to sort (e.g., by Variance, Status, Value). Use top filters." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Complete Record:</strong>} secondary="Shows PO number, dates, supplier, product, quantities, costs, lead times, variance, and status." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Navigate through all recorded POs." /></ListItem>
                    </List>
                </Box>

            </Paper>
        </Grid>

         <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                 <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> Important Considerations
                </Typography>
                 <List dense>
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data is simulated, including pricing, lead times, reliability, and market prices." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: Dashboard attempts to fetch new data every ${refreshIntervalSeconds} seconds.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><PriceCheckIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Price Variance KPI: Calculated as the average absolute difference between PO price and base product cost, weighted by order value." /></ListItem>
                      <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Lead Time Variance: Positive value means the delivery took longer than the planned lead time." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleOutlineIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="OTD Rate: Considers both timeliness (within +/- 1 day of expected) and completeness (not partially received)." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><Inventory2Icon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="PO Structure: Mock data assumes one product per PO for simplicity. Real-world POs may contain multiple lines." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default PurchaseOptimizationDashboardGuide;