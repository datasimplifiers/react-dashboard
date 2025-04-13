import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PercentIcon from '@mui/icons-material/Percent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart'


const StoreSalesDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Store Sales Analysis Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a comprehensive overview of sales performance at the store level. It allows analysis by store, category, product, and time period.
          The main goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><PointOfSaleIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track overall sales revenue, profit, and units sold." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify sales trends over time." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze performance across different product categories." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><InventoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Pinpoint top-performing and slow-moving products." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Understand profitability and discount impact." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze sales patterns by day of the week." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Use these filters to refine the data shown across the dashboard:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary={<strong>Store:</strong>} secondary="Select a specific store or view aggregated data for 'All Stores'." /></ListItem>
              <ListItem><ListItemText primary={<strong>Category:</strong>} secondary="Focus the analysis on a specific product category or view 'All Categories'." /></ListItem>
              <ListItem><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the sales period you want to analyze." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, and the product table will update based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards show high-level metrics for the selected filters, compared to the Previous Period (PP) of the same duration:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Total Sales:</strong>} secondary="Total net revenue (after discounts) generated." /></ListItem>
                <ListItem><ListItemText primary={<strong>Total Profit:</strong>} secondary="Total gross profit (Net Sales - Cost of Goods Sold)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Units Sold:</strong>} secondary="Total number of individual items sold." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Transaction:</strong>} secondary="Average net sales value per unique transaction." /></ListItem>
                <ListItem><ListItemText primary={<strong>Units Per Trans (UPT):</strong>} secondary="Average number of items purchased per unique transaction." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Discount %:</strong>} secondary="Average discount percentage applied across all sales lines (Discount Amount / Gross Sales Amount)." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    The percentage change compares the current period's value to the immediately preceding period of the same length.
                </Typography>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Sales Trend Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Sales Trend Over Time</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart displays the daily net sales trend within the selected date range.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Trend Analysis:</strong>} secondary="Look for upward or downward trends, seasonality, and the impact of specific events or promotions (if known)." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Peaks & Troughs:</strong>} secondary="Identify consistent high-sales and low-sales days or periods." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Sales by Category Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Sales by Category</Typography>
                    <Typography variant="body2" paragraph>
                       This vertical bar chart shows the breakdown of total net sales by product category, displaying the top 6-7 categories by default.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Contribution:</strong>} secondary="Quickly identify which categories contribute most to overall sales revenue." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Interactivity:</strong>} secondary="Clicking on a category bar filters the 'Product Performance Analysis' table below to show only products within that category." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} />

                 {/* Sales by Day of Week Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Sales by Day of Week</Typography>
                     <Typography variant="body2" paragraph>
                        This bar chart aggregates total net sales for each day of the week within the selected period.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Weekly Pattern:</strong>} secondary="Identify the strongest and weakest sales days of the week to inform staffing, promotions, and inventory planning." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Product Performance Table Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Product Performance Analysis Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides detailed sales and profit metrics for individual products, based on the current filters (Store, Category, Date Range). It can be further filtered by clicking on the 'Sales by Category' chart.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Sorting:</strong>} secondary="Click on any column header (Product, Category, Units Sold, Net Sales, Margin %, Avg Disc %) to sort the table. Click again to reverse the order." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Top/Bottom N:</strong>} secondary="Use the radio buttons ('All', 'Top 10', 'Bottom 10') to quickly view the best or worst performing products based on the currently sorted column." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Identify Slow Movers:</strong>} secondary="Sort by 'Units Sold' ascending and select 'Bottom 10' to easily find products selling in very low quantities. A warning icon may also appear based on simulated low sales logic." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Profitability:</strong>} secondary="Analyze 'Margin %' to understand which products contribute most significantly to profit relative to their sales." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Discount Impact:</strong>} secondary="Check 'Avg Disc %' to see which products are frequently discounted." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Export:</strong>} secondary="Use the 'Export CSV' button to download the data currently displayed in the table." /></ListItem>
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
                    <ListItem><ListItemText primary="Mock Data: All data shown is simulated." /></ListItem>
                    <ListItem><ListItemText primary="Previous Period: KPI comparisons (%) are against the immediately preceding period of the same duration." /></ListItem>
                     <ListItem><ListItemText primary="Slow Mover Logic: The 'Slow Mover' icon is based on a simple simulation (e.g., low units & low sales) and should be defined based on specific business rules in a real implementation." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default StoreSalesDashboardGuide;