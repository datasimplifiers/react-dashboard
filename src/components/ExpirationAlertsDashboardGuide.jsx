import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link, Chip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsIcon from '@mui/icons-material/Insights';


const ExpirationAlertsDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Inventory Expiration Analysis Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard helps proactively identify and manage inventory nearing its expiration date across different locations and product categories.
          The primary goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><WarningAmberIcon fontSize="small" color="warning" /></ListItemIcon><ListItemText primary="Highlight products and batches approaching expiry." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Quantify the financial value of inventory at risk of expiring." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingDownIcon fontSize="small" color="error" /></ListItemIcon><ListItemText primary="Enable timely actions (discounts, redistribution, disposal) to minimize waste and loss." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><InsightsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify patterns in expiring stock by category or location." /></ListItem>
        </List>
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
              <ListItem><ListItemText primary={<strong>Locations:</strong>} secondary="Select one or more specific stores/warehouses, or view 'All Locations'." /></ListItem>
              <ListItem><ListItemText primary={<strong>Categories:</strong>} secondary="Select one or more product categories, or view 'All Categories'." /></ListItem>
              <ListItem><ListItemText primary={<strong>Show Items Expiring Within:</strong>} secondary="Set the maximum number of days until expiration to include items. Lower values focus on more urgent items. Options include specific day thresholds (7, 14, 30), 'Already Expired', or 'All'." /></ListItem>
            </List>
            <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, and the table update based on your selections. The default view shows items expiring within 14 days.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards summarize the inventory matching your current filter criteria:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Quantity at Risk:</strong>} secondary="Total number of units expiring within the selected threshold." /></ListItem>
                <ListItem><ListItemText primary={<strong>Value at Risk:</strong>} secondary="Total estimated cost value (Quantity * Unit Cost) of the units expiring within the threshold." /></ListItem>
                <ListItem><ListItemText primary={<strong>Unique SKUs at Risk:</strong>} secondary="Number of distinct products (SKUs) that have batches expiring within the threshold." /></ListItem>
                <ListItem><ListItemText primary={<strong>Locations Affected:</strong>} secondary="Number of distinct stores/warehouses holding inventory expiring within the threshold." /></ListItem>
                </List>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <TableChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Table and Chart
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Expiration Details Table Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Expiration Details Table</Typography>
                    <Typography variant="body2" paragraph>
                        This table lists individual inventory batches that meet the selected filter criteria (Location, Category, Expiration Threshold). It is sorted by 'Days Left' (ascending) by default to show the most urgent items first.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Columns:</strong>} secondary="Shows Product Name, Category, Location, Batch Number, Expiration Date, Days Left, On-Hand Quantity, and the estimated On-Hand Value." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting:</strong>} secondary="Click column headers (like Product, Category, Location, Expires On, Days Left, Qty, Value) to sort the data." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Visual Cues:</strong>} secondary="Rows are subtly color-coded based on the 'Days Left'. The 'Days Left' column also uses a Chip with an icon and color for quick visual identification:" />
                             <List dense sx={{pl: 4}}>
                                 <ListItem><Chip icon={<ErrorOutlineIcon fontSize="small"/>} label="Expired" size="small" variant="outlined" color="error" sx={{mr: 1}}/> (Negative days)</ListItem>
                                 <ListItem><Chip icon={<WarningAmberIcon fontSize="small"/>} label="<= 7 Days" size="small" variant="outlined" color="warning" sx={{mr: 1}}/> (Urgent)</ListItem>
                                 <ListItem><Chip icon={<ScheduleIcon fontSize="small"/>} label="<= 14 Days" size="small" variant="outlined" color="info" sx={{mr: 1}}/> (Approaching)</ListItem>
                                 <ListItem><Chip icon={<ScheduleIcon fontSize="small"/>} label="<= 30 Days" size="small" variant="outlined" color="default" sx={{mr: 1}}/> (Monitor)</ListItem>
                             </List>
                        </ListItem>
                        <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Use the controls at the bottom to navigate through multiple pages of results." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Value at Risk Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Value at Risk by Category Chart</Typography>
                    <Typography variant="body2" paragraph>
                       This bar chart visualizes the total estimated value of inventory at risk (matching the selected filters) broken down by product category. It shows the top 7 categories with the highest value at risk.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Identify High-Impact Areas:</strong>} secondary="Quickly see which categories represent the largest potential financial loss due to upcoming expirations." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Prioritize Actions:</strong>} secondary="Focus waste reduction efforts (e.g., targeted promotions, quicker redistribution) on the categories with the highest value at risk." /></ListItem>
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
                    <ListItem><ListItemText primary="Mock Data: All inventory levels, dates, and values are simulated." /></ListItem>
                    <ListItem><ListItemText primary="Data Accuracy: The reliability of these alerts depends heavily on accurate inventory counts, batch tracking, and expiration date recording in the source systems." /></ListItem>
                    <ListItem><ListItemText primary="Threshold Definition: The definition of 'at risk' (e.g., within 7, 14, 30 days) should align with business processes and product characteristics." /></ListItem>
                     <ListItem><ListItemText primary="Actionability: This dashboard identifies risk; separate processes are needed to execute actions like creating discounts, transferring stock, or initiating disposal." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ExpirationAlertsDashboardGuide; // ** RENAME this export **