// src/components/EnergyManagementDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import BoltIcon from '@mui/icons-material/Bolt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Area
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';


const EnergyManagementDashboardGuide = () => {
  // Value for display in text, matching the dashboard component's constant
  const refreshIntervalSeconds = 120;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Energy Management Hub
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a detailed view of energy consumption (kWh) and associated costs across different locations, device types, and areas over time. It aims to help identify savings opportunities, track efficiency, and understand energy usage patterns.
          The main goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><BoltIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor overall energy consumption and costs." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze energy usage trends over selected periods." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><DevicesIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify high-consuming device types and specific areas." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><AccessTimeIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Understand typical hourly energy usage patterns." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ThermostatIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Correlate energy consumption with external factors like temperature." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track cost efficiency (Cost per kWh)." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Use these filters at the top to refine the data shown across the dashboard:
            </Typography>
            <List dense>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Location:</strong>} secondary="Select a specific store/location or 'All Locations'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><DevicesIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Device Type:</strong>} secondary="Filter by major categories like HVAC, Lighting, Refrigeration, etc., or 'All Device Types'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><LocationOnIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Area:</strong>} secondary="Focus on specific areas within locations (e.g., Sales Floor, Stock Room) or 'All Areas'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the analysis period." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Button:</strong>} secondary="Resets Location, Device Type, and Area filters to 'ALL'." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, and the details table will update based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards provide a quick summary of key energy metrics for the selected filters:
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary={<strong>Total Consumption:</strong>} secondary="Total energy used in kilowatt-hours (kWh)." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Total Cost:</strong>} secondary="Estimated total cost of energy consumed (EGP)." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Avg Daily Use:</strong>} secondary="Average kWh consumed per day within the selected period." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Avg Cost / kWh:</strong>} secondary="Average cost paid per kWh of energy." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Peak Hourly Use:</strong>} secondary="Highest recorded energy consumption (kW) within a single hour interval. Tooltip shows the date/time." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Top Device Type:</strong>} secondary="The device category with the highest total kWh consumption." /></ListItem>
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
                <Divider sx={{ my: 2 }} key="guide-divider-1"/>

                {/* Trend Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Consumption & Temperature Trend</Typography>
                    <Typography variant="body2" paragraph>
                        This combined chart displays daily total energy consumption (kWh, blue bars, left axis) and the average daily temperature (°C, red line, right axis).
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Correlation:</strong>} secondary="Observe how temperature changes potentially influence overall energy consumption (especially HVAC)." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Usage Peaks:</strong>} secondary="Identify days with the highest energy usage." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="guide-divider-2"/>

                 {/* Cost Trend Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Energy Cost Trend</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart shows the estimated total energy cost per day over the selected period.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Cost Fluctuations:</strong>} secondary="Track daily cost variations, often mirroring consumption trends." /></ListItem>
                        <ListItem><ListItemText primary={<strong>High Cost Days:</strong>} secondary="Identify days with the highest energy expenditure." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="guide-divider-3"/>

                {/* By Device Type Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Consumption by Device Type</Typography>
                    <Typography variant="body2" paragraph>
                       This pie chart shows the proportion of total energy consumption attributed to each major device type (HVAC, Lighting, etc.).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Major Consumers:</strong>} secondary="Quickly identify the device categories responsible for the largest share of energy use." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Savings Focus:</strong>} secondary="Helps prioritize energy-saving initiatives (e.g., upgrading inefficient HVAC or lighting)." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} key="guide-divider-4"/>

                 {/* By Area Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Consumption by Area</Typography>
                     <Typography variant="body2" paragraph>
                        This vertical bar chart ranks areas (e.g., Sales Floor, Stock Room) by their total energy consumption.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>High Usage Zones:</strong>} secondary="Pinpoint specific areas within the location(s) that consume the most energy." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Targeted Actions:</strong>} secondary="Suggests areas where audits or equipment checks might yield savings." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="guide-divider-5"/>

                {/* Hourly Pattern Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Avg. Hourly Consumption Pattern</Typography>
                     <Typography variant="body2" paragraph>
                        This bar chart shows the average energy consumption (kWh) for each hour of the day, averaged across the selected period and filters.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Daily Rhythm:</strong>} secondary="Understand the typical energy usage profile throughout a 24-hour cycle." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Peak Hours:</strong>} secondary="Identify the times of day with the highest average energy demand." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Off-Peak Usage:</strong>} secondary="Assess baseline energy consumption during closed hours, potentially indicating waste." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="guide-divider-6"/>

                {/* Scatter Plot Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>6. Consumption vs. Temperature</Typography>
                     <Typography variant="body2" paragraph>
                        This scatter plot visualizes the relationship between hourly energy consumption (Y-axis) and the corresponding outdoor temperature (X-axis). Each dot represents an hourly reading (sampled for performance).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Temperature Impact:</strong>} secondary="Observe the correlation - typically, higher temperatures lead to increased consumption (due to cooling). Look for outliers." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Baseline Load:</strong>} secondary="Points at moderate temperatures might indicate the baseline consumption independent of significant heating/cooling." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="guide-divider-7"/>


                {/* Details Table Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>7. Consumption Details (Hourly) Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed log of hourly energy consumption records matching the current filters.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Granular Data:</strong>} secondary="Examine specific hourly readings for detailed investigation." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting:</strong>} secondary="Click column headers (Timestamp, Location, Device Type, Area, kWh, Cost, Temp, Weather) to sort the data." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Context:</strong>} secondary="View consumption alongside location, device, area, cost, and weather conditions for each hour." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Use the controls at the bottom to navigate through the detailed hourly records." /></ListItem>
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
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data shown is simulated for demonstration and may not reflect real-world complexities perfectly." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: The dashboard automatically attempts to fetch new data every ${refreshIntervalSeconds} seconds. The last refresh time is shown top right.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Cost Calculation: Costs are estimated based on a fixed rate per kWh defined in the mock data generator." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><ThermostatIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Weather Data: Temperature and conditions are simulated daily averages per location." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><BoltIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Peak Hourly Use (KPI): Represents the highest kWh recorded in a single hour, effectively the peak average power demand for that hour." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default EnergyManagementDashboardGuide;