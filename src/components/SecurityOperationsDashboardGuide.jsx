// src/components/SecurityOperationsDashboardGuide.jsx

import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SecurityIcon from '@mui/icons-material/Security';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import TimerIcon from '@mui/icons-material/Timer';
import CancelIcon from '@mui/icons-material/Cancel';
import NoMeetingRoomIcon from '@mui/icons-material/NoMeetingRoom';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import UpdateIcon from '@mui/icons-material/Update';
// Removed unused AdjustIcon
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const SecurityOperationsDashboardGuide = () => {
  // Define the refresh interval value here for display purposes if needed,
  // or just write it directly in the text below.
  const refreshIntervalSeconds = 60; // Example: Set the value directly

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Security Operations Center Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a centralized view for monitoring and managing security events across retail locations. It combines data from security alerts and access control systems.
          The main goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><SecurityIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track the volume and types of security alerts generated." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ErrorIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor high-priority security events requiring immediate attention." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><PendingIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track the status and progress of alert investigations." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze alert resolution times and identify bottlenecks." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><NoMeetingRoomIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify patterns in failed access attempts to restricted areas." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Visualize trends in security events over time and by location." /></ListItem>
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
              <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Store:</strong>} secondary="Select a specific store or view aggregated data for 'All Stores'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><NotificationsActiveIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Alert Type:</strong>} secondary="Focus on a specific type of alert (e.g., 'Potential Item Not Scanned') or view 'All Types'." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><ErrorIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Severity:</strong>} secondary="Filter alerts by their assigned severity level ('High', 'Medium', 'Low')." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CheckCircleIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Status:</strong>} secondary="Filter alerts by their current investigation status ('New', 'Investigating', 'Resolved', 'False Positive')." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the period you want to analyze." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs, charts, and the alert details table will update automatically based on your selections.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards provide a quick summary of key security metrics for the selected filters:
                </Typography>
                <List dense>
                <ListItem><ListItemText primary={<strong>Total Alerts:</strong>} secondary="Total number of security alerts matching the filters." /></ListItem>
                <ListItem><ListItemText primary={<strong>High Severity:</strong>} secondary="Count of alerts classified as 'High' severity." /></ListItem>
                <ListItem><ListItemText primary={<strong>Open Alerts:</strong>} secondary="Number of alerts currently in 'New' or 'Investigating' status." /></ListItem>
                <ListItem><ListItemText primary={<strong>Failed Access:</strong>} secondary="Count of denied attempts to access restricted zones." /></ListItem>
                <ListItem><ListItemText primary={<strong>Avg Resolution:</strong>} secondary="Average time taken to move alerts to 'Resolved' status (in minutes/hours)." /></ListItem>
                <ListItem><ListItemText primary={<strong>False Positive %:</strong>} secondary="Percentage of total alerts marked as 'False Positive'." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    Hover over a KPI card for a brief explanation (tooltip). These KPIs do not compare to a previous period.
                </Typography>
            </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                    <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Understanding the Visualizations
                </Typography>
                {/* Added unique keys to Dividers */}
                <Divider sx={{ my: 2 }} key="divider-viz-1" />

                {/* Alert Trend Chart Explanation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Alert Trend by Severity</Typography>
                    <Typography variant="body2" paragraph>
                        This stacked bar chart shows the volume of alerts per day, broken down by severity (High, Medium, Low), within the selected date range.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Trend Analysis:</strong>} secondary="Identify days with unusually high alert volumes or shifts in severity mix." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Severity Mix:</strong>} secondary="Observe the proportion of High, Medium, and Low severity alerts over time." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="divider-viz-2" />

                {/* Alerts by Severity Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Alerts by Severity (Distribution)</Typography>
                    <Typography variant="body2" paragraph>
                       This pie chart shows the overall distribution of alerts across severity levels (High, Medium, Low) for the entire filtered dataset.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Overall Risk Profile:</strong>} secondary="Quickly understand the proportion of high-risk versus lower-risk alerts." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Focus Areas:</strong>} secondary="Helps determine if efforts should focus on reducing high-severity incidents or managing overall volume." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} key="divider-viz-3" />

                 {/* Top Alert Types Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Top Alert Types</Typography>
                     <Typography variant="body2" paragraph>
                        This vertical bar chart displays the most frequent types of security alerts encountered, ranked by count.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Common Issues:</strong>} secondary="Identify the most prevalent security concerns (e.g., potential theft, loitering)." /></ListItem>
                        <ListItem><ListItemText primary={<strong>System Tuning:</strong>} secondary="High frequency of certain types might indicate a need to adjust sensor sensitivity or AI models." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} key="divider-viz-4" />

                {/* Failed Access by Zone Chart Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Failed Access by Zone</Typography>
                     <Typography variant="body2" paragraph>
                        This vertical bar chart shows the restricted zones experiencing the highest number of denied access attempts.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Vulnerable Points:</strong>} secondary="Highlights areas where unauthorized access is frequently attempted (e.g., stock rooms, offices)." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Policy/Training Needs:</strong>} secondary="May indicate confusion about access rights or deliberate attempts to bypass security." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }} key="divider-viz-5" />

                {/* Alert Details Table Explanation */}
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Alert Details Table</Typography>
                     <Typography variant="body2" paragraph>
                        This table provides a detailed, sortable, and paginated list of individual security alerts matching the current filters.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Investigation Aid:</strong>} secondary="Examine specific alerts with details like exact timestamp, location, type, severity, and current status." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting:</strong>} secondary="Click column headers (Timestamp, Store, Location, Type, Severity, Status, Confidence, Resolution Time) to sort the data. Click again to reverse." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Status & Severity Chips:</strong>} secondary="Color-coded chips provide quick visual cues for severity and status." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Use the controls at the bottom to navigate through multiple pages of alerts if the list is long." /></ListItem>
                        {/* Removed items not present in Security Dashboard (Export, TopN, etc) */}
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
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data shown is simulated and for demonstration purposes only." /></ListItem>
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon>
                        {/* Corrected the text to not use the undefined variable */}
                        <ListItemText primary={`Data Refresh: The dashboard automatically attempts to fetch new data every ${refreshIntervalSeconds} seconds. The last refresh time is shown in the top right.`} />
                    </ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Resolution Time: Calculated as the difference between the alert timestamp and the resolved timestamp (if available)." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><CancelIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="False Positive Rate: Calculated as (False Positive Alerts / Total Alerts) * 100 for the filtered period." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default SecurityOperationsDashboardGuide;