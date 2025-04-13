import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import InventoryIcon from '@mui/icons-material/Inventory';
import TabIcon from '@mui/icons-material/Tab';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RuleIcon from '@mui/icons-material/Rule';

const InventoryOptimizationDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Inventory Management & Optimization Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides crucial insights into inventory levels, demand patterns, forecast accuracy, and potential stock issues across different locations and product categories.
          The goal is to help you make data-driven decisions to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon><ListItemText primary="Optimize stock levels to meet customer demand." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingDownIcon fontSize="small" color="error" /></ListItemIcon><ListItemText primary="Minimize stockouts and lost sales opportunities." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><WarningAmberIcon fontSize="small" color="warning" /></ListItemIcon><ListItemText primary="Reduce waste from overstocking and expired products." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><InsightsIcon fontSize="small" color="secondary" /></ListItemIcon><ListItemText primary="Improve purchasing efficiency with data-driven recommendations." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              The filters at the top control the data displayed across the entire dashboard:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary={<strong>Date Range:</strong>} secondary="Select the time period you want to analyze inventory status, sales, and forecasts for." /></ListItem>
              <ListItem><ListItemText primary={<strong>Location:</strong>} secondary="Choose a specific store or view data aggregated across 'All Locations'." /></ListItem>
              <ListItem><ListItemText primary={<strong>Category:</strong>} secondary="Filter the view to a specific product category or see 'All Categories'." /></ListItem>
            </List>
            <Typography variant="body2" sx={{mt: 2}}>
                Changing any filter will update all KPIs, charts, and tables below.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards provide a high-level summary based on your current filter selections:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Total Inventory Value:</strong>} secondary="Estimated cost value of the current on-hand stock for the filtered items (based on the latest snapshot)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Out of Stock Rate:</strong>} secondary="Percentage of items (that had sales in the period) currently having zero stock. High rates indicate potential lost sales." /></ListItem>
                <ListItem><ListItemText primary={<strong>Stock Turn (Period):</strong>} secondary="Measures inventory efficiency (Cost of Goods Sold / Average Inventory Value for the period). Higher generally means better efficiency." /></ListItem>
                <ListItem><ListItemText primary={<strong>Forecast Accuracy:</strong>} secondary="Estimated accuracy of sales forecasts compared to actual sales (calculated as 100% - Mean Absolute Percentage Error). Higher is better." /></ListItem>
                <ListItem><ListItemText primary={<strong>Recommended PO Value:</strong>} secondary="Total estimated cost value of all currently recommended purchase orders based on reorder points and forecasts." /></ListItem>
                </List>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <TabIcon sx={{ mr: 1, color: 'primary.main' }} /> Detailed Views (Tabs)
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Current Status Tab Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Current Status Tab</Typography>
                    <Typography variant="body2" paragraph>
                        Provides a snapshot of the current inventory situation based on the latest data within your selected date range and filters.
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: 30}}><BarChartIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<strong>Inventory Value by Category:</strong>} secondary="Shows the distribution of inventory value across product categories. Helps identify where most capital is tied up." />
                        </ListItem>
                         <ListItem>
                            <ListItemIcon sx={{minWidth: 30}}><WarningAmberIcon fontSize="small" color="warning" /></ListItemIcon>
                            <ListItemText primary={<strong>Stock Status Summary:</strong>} secondary="Highlights products potentially overstocked (e.g., >90 days of supply) or understocked (e.g., below safety stock levels). Days of Supply is estimated based on historical average sales." />
                        </ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Demand & Forecast Tab Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Demand & Forecast Tab</Typography>
                    <Typography variant="body2" paragraph>
                        Focuses on comparing actual sales demand against forecasted quantities for the selected period and filters.
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: 30}}><QueryStatsIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<strong>Sales vs. Forecast Quantity Chart:</strong>} secondary="Visually compares daily actual units sold (bars) against the forecasted units (line). Helps identify consistent over-forecasting or under-forecasting trends." />
                        </ListItem>
                         <ListItem>
                             <ListItemIcon sx={{minWidth: 30}}><RuleIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<strong>Forecast Accuracy KPI (Top Section):</strong>} secondary="Provides an overall accuracy percentage for the filtered data. Aim for higher accuracy." />
                        </ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} />

                 {/* Purchase Recommendations Tab Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Purchase Recommendations Tab</Typography>
                    <Typography variant="body2" paragraph>
                        This tab provides actionable suggestions for placing purchase orders based on calculated needs. **These are recommendations and should be reviewed.**
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon sx={{minWidth: 30}}><AddShoppingCartIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={<strong>Recommendations Table:</strong>} secondary="Lists products/locations where the effective stock (On Hand + On Order) has fallen below the Reorder Point." />
                        </ListItem>
                         <ListItem>
                            <ListItemText primary={<strong>Reorder Pt. (Reorder Point):</strong>} secondary="Calculated trigger level based on expected sales during supplier lead time plus safety stock days." />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={<strong>Rec. Order Qty (Recommended Order Quantity):</strong>} secondary="The suggested quantity to order to cover demand during lead time, review period, and safety stock period, considering current stock and quantities already on order. Uses forecast if available, otherwise historical average." />
                        </ListItem>
                         <ListItem>
                            <ListItemText primary={<strong>Est. Cost:</strong>} secondary="Approximate cost of the recommended order quantity based on the product's unit cost." />
                        </ListItem>
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
                    <ListItem><ListItemText primary="Mock Data: All data shown is simulated and may not reflect real-world complexities perfectly." /></ListItem>
                    <ListItem><ListItemText primary="Calculation Simplifications: Metrics like Stock Turn, Reorder Point, and Recommended Quantity use simplified formulas for this demonstration." /></ListItem>
                    <ListItem><ListItemText primary="Data Accuracy: In a real implementation, the accuracy of inventory counts, sales records, lead times, and forecasts is critical for meaningful insights and reliable recommendations." /></ListItem>
                     <ListItem><ListItemText primary="Review Recommendations: Always review purchase recommendations before placing orders, considering current promotions, shelf life, storage capacity, and supplier minimums." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default InventoryOptimizationDashboardGuide;