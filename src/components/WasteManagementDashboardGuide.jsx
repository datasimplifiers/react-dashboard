// src/components/WasteManagementDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Waste
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Value
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import CategoryIcon from '@mui/icons-material/Category'; // Product Category
import LabelIcon from '@mui/icons-material/Label'; // Waste Type
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'; // Reason
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InventoryIcon from '@mui/icons-material/Inventory'; // Product
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import DataUsageIcon from '@mui/icons-material/DataUsage'; // Treemap Icon?
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Trend


const WasteManagementDashboardGuide = () => {
  const refreshIntervalSeconds = 150; // Match dashboard constant
  const TOP_N_PRODUCTS = 10;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Waste Management Analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides insights into product waste across Metro locations. It helps analyze the quantity and value of waste, identify the primary reasons and types of waste, pinpoint affected products and categories, and track trends over time.
          The main goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Quantify the financial impact of waste." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><DeleteSweepIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track the volume of waste generated (by Kg and Units)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><QuestionAnswerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify the root causes (Reasons) for waste generation." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><LabelIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Understand the types of waste occurring (Spoilage, Damage, Expiration, etc.)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Highlight product categories with high waste levels." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><InventoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Pinpoint specific products contributing significantly to waste." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor waste trends over selected periods." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Compare waste performance across different locations." /></ListItem>
        </List>
         <Typography variant="body2" sx={{mt: 1}}>
            Use these insights to implement targeted waste reduction strategies, improve inventory management, refine ordering processes, and enhance staff training.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Refine the data displayed using the filters at the top:
            </Typography>
            <List dense>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Location:</strong>} secondary="Select a specific store or 'All Locations'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><LabelIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Waste Type:</strong>} secondary="Filter by the category of waste (e.g., Spoilage, Damage) or 'All Waste Types'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><QuestionAnswerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Reason:</strong>} secondary="Filter by the specific cause of waste (e.g., Expired On Shelf, Handling Error) or 'All Reasons'." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Category:</strong>} secondary="Focus on a specific product category (e.g., Fresh Produce, Dairy) or 'All Categories'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for analysis." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Button:</strong>} secondary="Resets Location, Waste Type, Reason, and Category filters to 'ALL'." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, lists, and the details table will update dynamically based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards offer a high-level summary for the selected filters:
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary={<strong>Total Waste Value:</strong>} secondary="Total cost value (EGP) of all wasted products based on their unit cost." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Waste Qty (Kg):</strong>} secondary="Total weight (Kg) of waste for products measured in kilograms." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Waste Qty (Units):</strong>} secondary="Total count of waste for products measured in units, packs, etc." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Avg Value / Event:</strong>} secondary="Average cost value (EGP) per individual waste record entry." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Top Reason (Value):</strong>} secondary="The specific reason contributing the most to the total waste value." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Top Category (Value):</strong>} secondary="The product category contributing the most to the total waste value." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Top Waste Type (Value):</strong>} secondary="The general waste type (e.g., Spoilage, Damage) contributing the most to total waste value." /></ListItem>
                  <ListItem><ListItemText primary={<strong># Waste Events:</strong>} secondary="Total number of individual waste entries recorded within the filtered period." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    Hover over a KPI card for a brief explanation (tooltip).
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
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Waste Value & Events Trend</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart tracks the daily total waste value (EGP, red line, left axis) and the number of individual waste events recorded each day (yellow dashed line, right axis) over the selected period.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Identify Peaks:</strong>} secondary="Pinpoint days with unusually high waste value or number of waste incidents." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Track Progress:</strong>} secondary="Monitor the overall trend to see if waste reduction initiatives are having an effect over time." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Waste by Reason (Value)</Typography>
                    <Typography variant="body2" paragraph>
                        This vertical bar chart ranks the reasons for waste by their total associated cost value (EGP). Hover over bars to see the percentage contribution.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Root Cause Analysis:</strong>} secondary="Quickly identify the most costly reasons for waste (e.g., Expiration, Damage, Over-ordering)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Prioritize Actions:</strong>} secondary="Focus improvement efforts on addressing the highest contributing reasons." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Waste by Type (Value)</Typography>
                     <Typography variant="body2" paragraph>
                       This pie chart illustrates the proportion of total waste value attributed to each general waste type (e.g., Spoilage, Expiration, Damage, Unsold). Labels show types contributing >3%.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>High-Level View:</strong>} secondary="Understand the main categories of waste by value." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Compare with Reasons:</strong>} secondary="Use alongside the 'Waste by Reason' chart for a deeper understanding (e.g., high 'Expiration' type might be due to 'Over-ordering' or 'Slow Moving Item' reasons)." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Waste by Category (Value)</Typography>
                     <Typography variant="body2" paragraph>
                        This treemap visualizes the contribution of different product categories to the total waste value. The size of each rectangle represents the relative waste value for that category.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Category Impact:</strong>} secondary="Identify which product categories generate the most waste financially (e.g., Fresh Produce, Meat & Seafood, Dairy)." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Targeted Inventory Management:</strong>} secondary="Suggests categories needing closer monitoring, better forecasting, or adjusted stock levels." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Top {TOP_N_PRODUCTS} Wasted Products (by Value)</Typography>
                     <Typography variant="body2" paragraph>
                        This list ranks the specific products with the highest total waste value within the selected filters.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Problem Products:</strong>} secondary="Directly identify the individual items causing the most significant financial loss due to waste." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Actionable Insights:</strong>} secondary="Investigate why these specific products are being wasted (check expiration dates, handling procedures, sales velocity, order quantities)." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>6. Waste Log Details Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed, filterable, and sortable log of every recorded waste event.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Granular Investigation:</strong>} secondary="Examine individual waste entries for specific details." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting & Filtering:</strong>} secondary="Click column headers to sort. Use top filters to narrow down data." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Full Context:</strong>} secondary="See timestamp, location, product, category, type, reason, quantity, unit cost, waste value, and source area for each entry." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Navigate through large datasets using the controls at the bottom." /></ListItem>
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
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data is simulated and intended for demonstration purposes." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: Dashboard attempts to fetch new data every ${refreshIntervalSeconds} seconds. See refresh time top right.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Waste Value Calculation: Calculated as (Waste Quantity * Product Unit Cost) from the mock data." /></ListItem>
                      <ListItem><ListItemIcon sx={{minWidth: 30}}><DeleteSweepIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Units of Measure (UoM): Quantity is tracked based on product definition (Kg, Units, Packs, etc.). KPIs summarize Kg and non-Kg units separately." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><LabelIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Reason/Type Granularity: Accuracy depends on correct logging during waste recording (simulated here)." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default WasteManagementDashboardGuide;