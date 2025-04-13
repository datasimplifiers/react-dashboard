import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import SellIcon from '@mui/icons-material/Sell';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import InfoIcon from '@mui/icons-material/Info';
import { Line, Bar } from 'recharts';

const DynamicPricingDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Dynamic Pricing Analysis Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard helps analyze the relationship between your store's pricing (Metro Price), competitor pricing, customer demand (Sales & Forecast), and profitability for specific products.
          It aims to support informed pricing decisions by visualizing:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><SellIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Your price positioning relative to competitors." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="How price changes potentially correlate with sales volume and profit." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CompareArrowsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="The gap between your price and the average competitor price." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><QueryStatsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="The relationship between price and actual sales vs. forecasted demand." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Select the context for your analysis:
            </Typography>
            <List dense>
               <ListItem><ListItemText primary={<strong>Select Product:</strong>} secondary="Choose the specific product you want to analyze pricing for." /></ListItem>
               <ListItem><ListItemText primary={<strong>Store:</strong>} secondary="Select the Metro store whose pricing and sales data you want to view." /></ListItem>
               <ListItem><ListItemText primary={<strong>Compare Competitors:</strong>} secondary="Select one or more competitors to compare prices against. KPIs and charts will adjust accordingly." /></ListItem>
              <ListItem><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the analysis period." /></ListItem>
            </List>
            <Typography variant="body2" sx={{mt: 2}}>
                The dashboard requires a Product and Store to be selected to display meaningful data.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <InsightsIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                Summary metrics for the selected product, store, competitors, and time period:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Avg. Metro Price:</strong>} secondary="Your average selling price for the product during the period." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Lowest Comp.:</strong>} secondary="Average of the *lowest* price found among selected competitors on each day." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Highest Comp.:</strong>} secondary="Average of the *highest* price found among selected competitors on each day." /></ListItem>
                <ListItem><ListItemText primary={<strong>Price Index:</strong>} secondary="Your average price as a percentage of the *overall average* price of selected competitors (Avg Metro / Avg Comp * 100). <100 means cheaper, >100 means more expensive." /></ListItem>
                <ListItem><ListItemText primary={<strong>Total Units Sold:</strong>} secondary="Total quantity of the selected product sold." /></ListItem>
                <ListItem><ListItemText primary={<strong>Total Gross Profit:</strong>} secondary="Total profit generated from the selected product (Net Sales - Cost)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Daily Forecast:</strong>} secondary="Average daily forecasted quantity for the product." /></ListItem>
                </List>
                 <Typography variant="caption" color="text.secondary">
                    Competitor KPIs only consider the competitors selected in the filter. Conditional coloring highlights your price position relative to the lowest/highest averages and the index target (100).
                </Typography>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Price Trend Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Price Trend vs Competitors</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart tracks the daily price of the selected product at your store (solid blue line) against the daily prices of the selected competitors (dashed colored lines) over the chosen date range.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Price Positioning:</strong>} secondary="Visually assess if your price is consistently above, below, or fluctuating around competitor prices." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Competitor Actions:</strong>} secondary="Observe when competitors change their prices and how your price responds (or leads)." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Correlation Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Price, Sales, Profit & Forecast</Typography>
                    <Typography variant="body2" paragraph>
                       This combined chart visualizes relationships between different metrics over time:
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Left Y-Axis (Price/Profit):</strong>} secondary={<>Shows your daily price (<Line color="primary.dark" />) and daily gross profit (<Line color="success.main" />) in EGP.</>} /></ListItem>
                        <ListItem><ListItemText primary={<strong>Right Y-Axis (Quantity):</strong>} secondary={<>Shows actual daily units sold (<Bar color="secondary.light" />) and forecasted daily units (<Line color="grey.500" />).</>} /></ListItem>
                        <ListItem><ListItemText primary={<strong>Analysis:</strong>} secondary="Look for inverse relationships (e.g., does quantity sold increase when price decreases?), how profit tracks with price/quantity, and how closely actual sales follow the forecast." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} />

                 {/* Price Gap Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Metro Price Gap vs Avg. Competitor (%)</Typography>
                     <Typography variant="body2" paragraph>
                        This line chart shows the percentage difference between your daily price and the average daily price of the *selected* competitors.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Interpretation:</strong>} secondary="Positive values mean your price is higher than the competitor average; negative values mean your price is lower. A value near 0% means price parity." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Strategy Check:</strong>} secondary="Does the gap align with your intended pricing strategy (e.g., consistently slightly below, premium pricing)? Identify significant deviations." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                 {/* Scatter Plot Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Daily Price vs Quantity Sold</Typography>
                     <Typography variant="body2" paragraph>
                        This scatter plot visualizes the relationship between the price set on a given day and the quantity sold on that same day. Each dot represents one day's data point.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>X-Axis (Price):</strong>} secondary="Your selling price (EGP) for the product on a specific day." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Y-Axis (Units Sold):</strong>} secondary="The total quantity sold on that day." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Demand Curve (Elasticity):</strong>} secondary="Look for a general downward trend - typically, as price increases, quantity sold decreases. The steepness indicates price sensitivity (elasticity)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Outliers:</strong>} secondary="Points that don't fit the general trend might indicate stockouts, promotional effects, or other factors influencing sales besides price." /></ListItem>
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
                    <ListItem><ListItemText primary="Mock Data: All pricing, sales, and forecast data are simulated." /></ListItem>
                    <ListItem><ListItemText primary="Correlation vs. Causation: Charts show correlations, but external factors (promotions, seasonality, stock levels, competitor actions not captured) also affect sales." /></ListItem>
                    <ListItem><ListItemText primary="Data Granularity: Analysis assumes daily price points and sales aggregation. Real-world pricing might change intra-day." /></ListItem>
                    <ListItem><ListItemText primary="Competitor Data Source: Assumes competitor pricing data is available and accurate for comparison." /></ListItem>
                 </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DynamicPricingDashboardGuide;