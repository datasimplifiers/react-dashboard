// src/components/RoutePlanningDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonIcon from '@mui/icons-material/Person';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


const RoutePlanningDashboardGuide = () => {
  const refreshIntervalSeconds = 180; // Match dashboard constant

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Optimal Route Planning
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard analyzes the efficiency and effectiveness of delivery routes from distribution centers (DCs) to stores. It compares planned schedules and resource usage against actual performance to identify opportunities for optimization, cost savings, and improved service levels.
          The main goals are to:
        </Typography>
        <List dense>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleOutlineIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track On-Time Delivery (OTD) performance." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze variances between planned and actual trip durations." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><ErrorOutlineIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify the magnitude and frequency of delays." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><SpeedIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor actual distance traveled compared to planned." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><LocalGasStationIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze fuel consumption and efficiency (km/L) by vehicle type." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Estimate total fuel costs associated with deliveries." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><LocalShippingIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Compare performance across different vehicles and drivers (via filtering and table)." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><AltRouteIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify routes with consistent delays or inefficiencies." /></ListItem>
        </List>
         <Typography variant="body2" sx={{mt: 1}}>
            Use these insights to refine route schedules, optimize vehicle assignments, provide feedback to drivers, and identify potential issues impacting delivery times (e.g., traffic patterns, loading delays).
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Refine the data using the filters at the top:
            </Typography>
            <List dense>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><WarehouseIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Source (DC):</strong>} secondary="Select the originating Distribution Center or 'All Sources'." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Destination:</strong>} secondary="Select the destination Store or 'All Destinations'." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><LocalShippingIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Vehicle:</strong>} secondary="Filter by a specific vehicle ID or 'All Vehicles'." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><PersonIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Driver:</strong>} secondary="Filter by a specific driver or 'All Drivers'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the analysis period (based on departure date)." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Button:</strong>} secondary="Resets Source, Destination, Vehicle, and Driver filters to 'ALL'." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, and the details table update based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                A quick summary of route performance for the selected filters:
                </Typography>
                <List dense>
                   <ListItem><ListItemText primary={<strong>Total Trips:</strong>} secondary="The total number of delivery trips completed." /></ListItem>
                   <ListItem><ListItemText primary={<strong>OTD Rate:</strong>} secondary="Percentage of trips arriving within the acceptable time window (On-Time)." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Delay (Late):</strong>} secondary="The average lateness (in hours and minutes) only for trips that arrived late." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Duration Var.:</strong>} secondary="Average difference between actual and planned trip duration. Positive means trips took longer than planned." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Total Distance:</strong>} secondary="Total actual kilometers driven across all filtered trips." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Total Fuel Cost:</strong>} secondary="Estimated total cost (EGP) of fuel consumed." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Total Fuel Used:</strong>} secondary="Total liters of fuel consumed." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Fuel Eff.:</strong>} secondary="Average kilometers driven per liter of fuel (km/L)." /></ListItem>
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
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. On-Time Delivery Trend</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart shows the percentage of trips delivered on time each day over the selected period.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Service Level:</strong>} secondary="Monitor daily fluctuations and overall trends in delivery timeliness." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Identify Issues:</strong>} secondary="Dips in the trend might indicate widespread issues (e.g., bad weather, systemic delays) affecting OTD on specific days." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Avg. Daily Duration Variance (Actual - Planned)</Typography>
                    <Typography variant="body2" paragraph>
                        This line chart tracks the average difference (in minutes) between the actual duration of trips and their planned duration for each day. Values above zero mean trips took longer than planned on average.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Planning Accuracy:</strong>} secondary="Assess how well planned durations match reality. Consistently high positive variance suggests underestimation in planning." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Efficiency Trends:</strong>} secondary="Track whether trips are generally becoming faster or slower compared to plan over time." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Delivery Status</Typography>
                     <Typography variant="body2" paragraph>
                       This pie chart shows the breakdown of completed trips by their delivery status (On-Time vs. Late).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Overall Performance:</strong>} secondary="Provides a quick visual summary of the proportion of late deliveries." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Filter Impact:</strong>} secondary="Observe how this distribution changes when filtering by specific routes, drivers, or vehicles." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Avg. Fuel Efficiency (km/L)</Typography>
                     <Typography variant="body2" paragraph>
                        This vertical bar chart compares the average fuel efficiency (kilometers driven per liter of fuel) achieved by different vehicle types.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Vehicle Performance:</strong>} secondary="Identify which vehicle types are more fuel-efficient in practice." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Cost Implications:</strong>} secondary="Highlights potential cost savings through optimizing vehicle usage or maintenance." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Duration Variance vs. Distance</Typography>
                     <Typography variant="body2" paragraph>
                        This scatter plot visualizes the relationship between the actual distance of a trip (X-axis) and its duration variance (Y-axis, actual minus planned time in minutes). Each dot represents a single trip (sampled for performance).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Identify Outliers:</strong>} secondary="Points far above zero on the Y-axis represent trips that took much longer than planned. Investigate these." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Distance Impact:</strong>} secondary="Observe if longer trips (further right on X-axis) tend to have higher variance (more spread vertically)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Negative Variance:</strong>} secondary="Points below zero indicate trips completed faster than planned." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>6. Trip Log Details Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed, filterable, and sortable log of every delivery trip.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Granular Data:</strong>} secondary="Examine individual trip details for specific investigations." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting & Filtering:</strong>} secondary="Click column headers to sort (e.g., by Delay, Duration Variance). Use top filters." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Full Trip Info:</strong>} secondary="Includes timestamps (planned/actual), locations, driver, vehicle, status, durations (planned/actual/variance), distance, and fuel details." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Navigate through the complete list of trips." /></ListItem>
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
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data is simulated, including distances, durations, fuel consumption, and delays." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: Dashboard attempts to fetch new data every ${refreshIntervalSeconds} seconds. See refresh time top right.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Fuel Cost: Estimated based on simulated consumption and predefined fuel prices per type in the mock generator." /></ListItem>
                      <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Duration Variance: A positive value indicates the actual trip took longer than planned." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleOutlineIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="On-Time Definition: Based on a configurable threshold (e.g., 15 minutes) relative to the planned arrival time in the mock generator." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><LocalShippingIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Trip Simplification: Mock data assumes one primary destination per trip for simplicity." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default RoutePlanningDashboardGuide;