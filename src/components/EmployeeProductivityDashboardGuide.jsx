// src/components/EmployeeProductivityDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import GroupIcon from '@mui/icons-material/Group';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TimerIcon from '@mui/icons-material/Timer';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';

const EmployeeProductivityDashboardGuide = () => {
  const refreshIntervalSeconds = 240; // Match dashboard constant

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Employee Productivity Analysis
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard analyzes employee task performance and efficiency across different locations, zones, roles, and task types. It aims to provide insights into task completion rates, time management, adherence to planned schedules, and identify areas for process improvement or training.
          The main goals are to:
        </Typography>
        <List dense>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TaskAltIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor the volume of tasks completed." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze the average time taken to complete tasks." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><AccessAlarmIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track the variance between actual and planned task durations." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><GroupIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Understand overall productive time spent by employees." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify the most frequently performed tasks and those taking longer than planned." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><BadgeIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Compare productivity patterns across different employee roles." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><MyLocationIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze productivity within specific store zones (e.g., Checkout, Stock Room)." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Identify trends in task completion and efficiency over time." /></ListItem>
        </List>
         <Typography variant="body2" sx={{mt: 1}}>
            Use these insights to optimize workflows, allocate resources effectively, identify training needs, set realistic performance targets, and improve overall operational efficiency.
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
               <ListItem><ListItemIcon sx={{minWidth: 30}}><MyLocationIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Zone:</strong>} secondary="Filter by a specific work zone within the store(s)." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><BadgeIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Role:</strong>} secondary="Focus on a specific employee role (e.g., Cashier, Stocker)." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><PersonSearchIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Employee:</strong>} secondary="Select a specific employee (list updates based on Location filter)." /></ListItem>
               <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Task Type:</strong>} secondary="Filter by a specific task performed." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for analysis." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Button:</strong>} secondary="Resets Location, Zone, Role, Employee, and Task Type filters to 'ALL'." /></ListItem>
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                KPIs, charts, and the details table update based on selections. Note: KPIs generally exclude 'Break/Idle' tasks.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                A summary of productivity metrics for the selected filters (excluding non-productive tasks):
                </Typography>
                <List dense>
                   <ListItem><ListItemText primary={<strong>Total Tasks:</strong>} secondary="Total number of productive tasks logged as completed." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Task Duration:</strong>} secondary="Average actual time spent per completed task (in minutes)." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Avg Duration Var.:</strong>} secondary="Average difference between actual and planned task duration. Positive (+) means tasks took longer than planned." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Total Prod. Hours:</strong>} secondary="Sum of actual time spent on all completed productive tasks." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Most Frequent Task:</strong>} secondary="The task type that was completed most often." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Slowest Task (Avg Var):</strong>} secondary="The task type with the highest positive average duration variance (taking longest compared to plan)." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Top Role (Tasks):</strong>} secondary="The employee role that completed the highest number of tasks overall." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    Hover over a KPI card for a brief explanation (tooltip). Variance color indicates performance (Red = slower, Green = faster than planned).
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
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. Daily Tasks Completed</Typography>
                    <Typography variant="body2" paragraph>
                        This bar chart shows the total number of productive tasks completed each day within the selected period and filters.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Workload Volume:</strong>} secondary="Track daily task output and identify high/low volume days." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Resource Allocation:</strong>} secondary="Compare task volume with staffing levels (implicitly) to assess workload balance." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Avg. Daily Duration Variance (Actual - Plan)</Typography>
                    <Typography variant="body2" paragraph>
                        Tracks the average daily difference (in minutes) between actual and planned task durations. Values above zero indicate tasks took longer than planned on average that day. The dashed line represents the target (zero variance).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Efficiency Trend:</strong>} secondary="Monitor if tasks are generally getting completed faster or slower than planned over time." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Identify Problem Days:</strong>} secondary="Peaks above the zero line highlight days where overall efficiency was lower than planned." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Tasks by Type</Typography>
                     <Typography variant="body2" paragraph>
                       This pie chart shows the distribution of completed tasks based on their type (e.g., Checkout Scanning, Stocking Shelves). Labels show types contributing >3%.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Work Distribution:</strong>} secondary="Understand the proportion of time/effort spent on different task categories." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Focus Areas:</strong>} secondary="Identify the most common tasks, which might be prime candidates for process optimization." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Tasks Completed by Role</Typography>
                     <Typography variant="body2" paragraph>
                        This vertical bar chart compares the total number of tasks completed by employees in different roles.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Role Output:</strong>} secondary="Compare the task volume handled by different roles (note: task complexity varies)." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Workload Insights:</strong>} secondary="Provides a high-level view of task distribution among roles." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>5. Avg. Duration Variance by Role</Typography>
                     <Typography variant="body2" paragraph>
                        Compares the average task duration variance (Actual - Planned, in minutes) across different employee roles. Bars extending right (positive) mean slower than planned; bars left (negative) mean faster.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Role Efficiency:</strong>} secondary="Identify roles that consistently deviate significantly from planned task times." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Training/Process Needs:</strong>} secondary="Roles with high positive variance might benefit from process review or additional training. Roles with high negative variance might have overly generous planned times." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>


                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>6. Productivity Log Details Table</Typography>
                     <Typography variant="body2" paragraph>
                        Provides a detailed, filterable, and sortable log of every recorded productivity event (including breaks/idle if not filtered out).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Granular Analysis:</strong>} secondary="Examine individual task records." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Sorting & Filtering:</strong>} secondary="Click column headers to sort (e.g., by Variance, Duration). Use top filters." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Full Context:</strong>} secondary="Includes timestamp, employee details, location/zone, task details, planned vs. actual durations, variance, units completed, and optional quality score." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Navigate through large logs." /></ListItem>
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
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: All data, including task times, employee efficiency, and quality scores, is simulated." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: Dashboard attempts to fetch new data every ${refreshIntervalSeconds} seconds.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><TimerIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Standard Times: Planned durations are based on 'standard times' defined in the mock data, which may not perfectly reflect real-world task complexity." /></ListItem>
                      <ListItem><ListItemIcon sx={{minWidth: 30}}><AccessAlarmIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Duration Variance: Positive variance means the task took longer than planned; negative means it was faster." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><TaskAltIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Task Units: The 'Units' column represents different things depending on the task (e.g., items, cases, interactions). Focus on duration/variance for cross-task comparison." /></ListItem>
                        <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Productive Tasks: Most KPIs and charts exclude explicitly logged 'Break/Idle' tasks for focused productivity analysis." /></ListItem>
                </List>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default EmployeeProductivityDashboardGuide;