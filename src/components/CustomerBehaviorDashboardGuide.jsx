import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import MapIcon from '@mui/icons-material/Map';
import RouteIcon from '@mui/icons-material/Route';
import TrafficIcon from '@mui/icons-material/Traffic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GrainIcon from '@mui/icons-material/Grain';

const CustomerBehaviorDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Customer Behavior Analysis Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard analyzes how customers navigate and interact within your stores using simulated surveillance or sensor data. Understanding these patterns helps optimize store layout, product placement, and staffing for an improved shopping experience and potentially increased sales.
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><LocationOnIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify high-traffic zones and 'cold spots'." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><AccessTimeFilledIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Understand where customers spend the most time (dwell time)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><RouteIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze common paths customers take through the store." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Correlate in-store behavior (traffic, dwell) with sales data from specific zones/categories." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrafficIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify peak traffic hours within different store zones." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Control the scope of the analysis using these filters:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary={<strong>Store:</strong>} secondary="Select the specific store location you want to analyze." /></ListItem>
              <ListItem><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the time period for which you want to view customer behavior data." /></ListItem>
            </List>
            <Typography variant="body2" sx={{mt: 2}}>
                Changing filters updates all KPIs and visualizations on the dashboard.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <InsightsIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards provide a quick overview of customer activity for the selected store and period:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Total Customer Sessions:</strong>} secondary="The estimated number of unique customer visits or paths recorded." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Dwell Time / Session:</strong>} secondary="The average total time a customer spent across all zones during their visit." /></ListItem>
                <ListItem><ListItemText primary={<strong>Busiest Zone (Events):</strong>} secondary="The store zone that recorded the highest number of customer entries or dwell events." /></ListItem>
                <ListItem><ListItemText primary={<strong>Peak Hour (Est.):</strong>} secondary="The hour of the day with the highest overall zone event count across the store." /></ListItem>
                </List>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <MapIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Zone Performance Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Zone Performance (Traffic & Dwell)</Typography>
                    <Typography variant="body2" paragraph>
                        This chart compares the top store zones based on two key metrics:
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Unique Sessions (Bar - Top Axis):</strong>} secondary="Shows the number of distinct customer sessions that entered each zone. Higher bars indicate higher traffic." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Avg Dwell / Visit (Line - Bottom Axis):</strong>} secondary="Shows the average time customers spent within a zone *each time* they entered it. Helps identify zones where customers linger." /></ListItem>
                    </List>
                    <Typography variant="body2">
                       Use this to see which zones are popular (high traffic) and which ones capture attention (high dwell). Compare Service areas vs. Aisles vs. Display areas.
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Sales Correlation Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Zone Traffic vs Category Sales</Typography>
                    <Typography variant="body2" paragraph>
                        This scatter plot attempts to correlate zone activity with sales performance for the categories typically located within those zones (based on a predefined mapping).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>X-Axis (Zone Traffic):</strong>} secondary="Number of unique customer sessions visiting the zone." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Y-Axis (Category Sales):</strong>} secondary="Total sales (EGP) for the product categories mapped to that zone during the period." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Dot Size (Avg Dwell):</strong>} secondary="Larger dots indicate longer average dwell times within that zone." /></ListItem>
                    </List>
                     <Typography variant="body2">
                       Look for zones in the top-right (high traffic, high sales) or zones with large dots (high dwell) that might have lower-than-expected sales, potentially indicating poor product placement or assortment within that engaging zone.
                    </Typography>
                </Box>
                 <Divider sx={{ my: 2 }} />

                 {/* Heatmap Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Traffic Heatmap (Zone vs Hour)</Typography>
                     <Typography variant="body2" paragraph>
                        Visualizes traffic intensity (number of entries/events) across different zones throughout the day.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>X-Axis (Hour of Day):</strong>} secondary="Represents the operating hours of the store." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Y-Axis (Zone Name):</strong>} secondary="Lists the different zones within the store layout." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Dot Size:</strong>} secondary="Larger dots indicate a higher number of customer events recorded in that zone during that specific hour." /></ListItem>
                    </List>
                    <Typography variant="body2">
                       Use this to identify peak hours for specific zones (e.g., Bakery Corner in the morning, Checkout Area in the evening) to optimize staffing and product availability.
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                 {/* Sankey Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Top Customer Paths (Sankey Diagram)</Typography>
                     <Typography variant="body2" paragraph>
                        Illustrates the most common sequences of zones visited by customers during their shopping sessions. The width of the flow between two zones represents the number of times customers moved directly from the source zone to the target zone.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Nodes (Rectangles):</strong>} secondary="Represent the store zones." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Links (Flows):</strong>} secondary="Show the transitions between zones. Thicker links indicate more frequent paths." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Top Paths Only:</strong>} secondary="For clarity, only the most frequent (top 20-25) paths are displayed." /></ListItem>
                    </List>
                     <Typography variant="body2">
                       Analyze common customer journeys. Are they logical? Do they pass key promotional areas? Are there unexpected detours or bottlenecks? This helps optimize store flow and layout based on actual customer movement. Hover over links/nodes for details.
                    </Typography>
                </Box>

            </Paper>
        </Grid>

         <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                 <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> Important Considerations
                </Typography>
                 <List dense>
                    <ListItem><ListItemText primary="Mock Data: All behavior data is simulated. Real-world sensor accuracy, coverage, and path reconstruction can vary." /></ListItem>
                    <ListItem><ListItemText primary="Zone Mapping: The correlation between zone traffic and category sales depends heavily on an accurate mapping of which product categories reside in which zones. This is simplified here." /></ListItem>
                     <ListItem><ListItemText primary="Session Definition: The accuracy of 'sessions' depends on the underlying tracking technology's ability to distinguish unique customer visits." /></ListItem>
                    <ListItem><ListItemText primary="Privacy: Real-world implementations must adhere strictly to privacy regulations regarding customer tracking and data anonymization." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default CustomerBehaviorDashboardGuide;