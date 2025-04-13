import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WebIcon from '@mui/icons-material/Web';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import MoodIcon from '@mui/icons-material/Mood';
import TimerIcon from '@mui/icons-material/Timer';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';


const CustomerExperienceDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Customer Experience & Support Overview
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a consolidated view of the customer experience across both online interactions (website/app) and direct support channels (tickets).
          Its purpose is to help understand customer satisfaction, identify friction points, and monitor support efficiency. Key goals include:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><WebIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor online user engagement and conversion funnels." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><SupportAgentIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track support ticket volume, categories, and resolution times." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><MoodIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Measure overall customer satisfaction (CSAT)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><InsightsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify areas needing improvement in either the online experience or support processes." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Using the Filters
            </Typography>
            <Typography variant="body1" paragraph>
              Filters allow you to focus the analysis on specific segments or statuses:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary={<strong>Date Range:</strong>} secondary="Select the time period for analyzing both web interactions and support tickets." /></ListItem>
              <ListItem><ListItemText primary={<strong>Channel:</strong>} secondary="Filter by interaction channel (e.g., WebApp, MobileApp, Phone, Chat). 'ALL' includes everything." /></ListItem>
              <ListItem><ListItemText primary={<strong>Customer Segment:</strong>} secondary="Focus on a specific customer group based on their assigned segment (requires customer login for web data)." /></ListItem>
              <ListItem><ListItemText primary={<strong>Ticket Status:</strong>} secondary="View support tickets based on their current status (e.g., Open, Resolved, Closed)." /></ListItem>
            </List>
            <Typography variant="body2" sx={{mt: 2}}>
                Changes update all KPIs, charts, and the ticket table.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                A snapshot of key CX and support metrics for the filtered data:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Web Sessions:</strong>} secondary="Total number of unique online sessions (WebApp/MobileApp)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Conversion Rate:</strong>} secondary="Percentage of web sessions that resulted in a completed purchase." /></ListItem>
                <ListItem><ListItemText primary={<strong>Search Success %:</strong>} secondary="Percentage of online searches that were deemed successful (based on simulation)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Recommend. CTR %:</strong>} secondary="Click-Through Rate on product recommendations shown online." /></ListItem>
                <ListItem><ListItemText primary={<strong>Total Tickets:</strong>} secondary="Total number of support tickets created." /></ListItem>
                <ListItem><ListItemText primary={<strong>Open Tickets:</strong>} secondary="Number of tickets currently in 'New' or 'In Progress' status." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. Resolution:</strong>} secondary="Average time taken to resolve tickets (for tickets marked Resolved/Closed)." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg. CSAT:</strong>} secondary="Average Customer Satisfaction score (1-5 scale) from tickets where feedback was provided." /></ListItem>
                </List>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Funnel Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Online Journey Funnel</Typography>
                    <Typography variant="body2" paragraph>
                        Visualizes the typical stages of a customer's online shopping journey (WebApp/MobileApp). It shows the number of sessions progressing through each stage.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Stages:</strong>} secondary="Typically shows total Sessions -> Viewed Product -> Added to Cart -> Purchased." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Drop-off:</strong>} secondary="Decreases in bar size between stages indicate where customers abandon the process. Analyze significant drop-offs." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Tickets by Category Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Support Tickets by Category</Typography>
                    <Typography variant="body2" paragraph>
                       Displays the volume of support tickets broken down by their assigned category (e.g., Order Issue, Technical Support). Shows the top 7 categories.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>High Volume Categories:</strong>} secondary="Identify the most common reasons customers contact support. This can highlight recurring problems or areas needing clearer information." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} />

                 {/* CSAT Distribution Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. CSAT Score Distribution</Typography>
                     <Typography variant="body2" paragraph>
                        Shows the distribution of Customer Satisfaction (CSAT) scores (typically 1-5 stars) provided on resolved/closed support tickets.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Score Interpretation:</strong>} secondary="Generally, 4s and 5s are positive, 3 is neutral, and 1s and 2s indicate dissatisfaction. Bars are color-coded from red (1) to green (5)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Trends:</strong>} secondary="Monitor the overall shape of the distribution. A skew towards higher scores is desirable." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />

                 {/* Tickets Table Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Recent Support Tickets Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed, sortable list of individual support tickets matching the current filters.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Columns:</strong>} secondary="Includes Ticket ID, Customer Name, Category, Channel, Status (with color-coding/icon), Creation Time, Resolution Time (if applicable), and CSAT score (if provided)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Sorting:</strong>} secondary="Click column headers (like 'Created', 'Resolution Time') to sort the table and identify patterns (e.g., oldest open tickets, longest resolution times)." /></ListItem>
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
                    <ListItem><ListItemText primary="Mock Data: All interaction and ticket data is simulated." /></ListItem>
                    <ListItem><ListItemText primary="Data Integration: A real system requires integrating data from web analytics platforms (like Google Analytics or custom tracking) and the customer support ticketing system (like Zendesk, Freshdesk, or internal tools)." /></ListItem>
                    <ListItem><ListItemText primary="Definitions: Ensure clear, consistent definitions for metrics like 'Session', 'Conversion', 'Search Success', 'Resolution Time', and CSAT across systems." /></ListItem>
                     <ListItem><ListItemText primary="Correlation vs. Causation: While the dashboard shows correlations (e.g., high CSAT and high conversion), it doesn't automatically prove causation. Further analysis might be needed." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default CustomerExperienceDashboardGuide;