// src/components/FinancialOverviewDashboardGuide.jsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Revenue, Profit
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Growth, Profit Margin
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Expense, COGS
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Net Profit
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Expenses
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Variance
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InfoIcon from '@mui/icons-material/Info';

const FinancialOverviewDashboardGuide = () => {
  const refreshIntervalSeconds = 180; // Match dashboard constant

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Financial Overview Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard provides a high-level overview of Metro's financial performance, focusing on profitability (Profit & Loss), key financial metrics, trends over time, and comparison against budget.
          The main goals are to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Track overall Revenue, Gross Profit, and Net Profit." /></ListItem>
           <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Monitor key profitability margins (Gross Margin %, Net Margin %)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ReceiptLongIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Analyze Operating Expenses (OpEx) and their components." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Visualize financial trends (Revenue, Profit) over time (monthly)." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CompareArrowsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Compare actual performance against budgeted figures." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Assess profitability across different store locations." /></ListItem>
        </List>
         <Typography variant="body2" sx={{mt: 1}}>
            Use these insights to understand financial health, identify areas for cost control or revenue enhancement, evaluate budget adherence, and make informed strategic decisions.
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
              <ListItem><ListItemIcon sx={{minWidth: 30}}><StorefrontIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Location:</strong>} secondary="Select a specific store or 'All Locations' to view aggregated or specific data." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Date Range:</strong>} secondary="Choose the start and end dates for the financial analysis period." /></ListItem>
              <ListItem><ListItemIcon sx={{minWidth: 30}}><FilterListOffIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Clear Loc. Button:</strong>} secondary="Resets the Location filter to 'All Locations'." /></ListItem>
               {/* <ListItem><ListItemIcon sx={{minWidth: 30}}><CompareArrowsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Scenario:</strong>} secondary="(Currently focused on Actual vs Budget comparisons where applicable)" /></ListItem> */}
            </List>
             <Typography variant="body2" sx={{mt: 2}}>
                All KPIs and charts update based on your selections. Budget comparisons are shown where relevant (KPIs, P&L Summary chart).
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Key Performance Indicators (KPIs)
                </Typography>
                <Typography variant="body1" paragraph>
                These cards summarize key financial metrics for the selected period and location(s). Budget variance (%) is shown below the actual value where applicable.
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary={<strong>Total Revenue:</strong>} secondary="Total income from sales before deducting costs." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Gross Profit:</strong>} secondary="Revenue minus the Cost of Goods Sold (COGS)." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Gross Margin:</strong>} secondary="Gross Profit shown as a percentage of Total Revenue." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Operating Expenses:</strong>} secondary="Total costs incurred for running the business (e.g., salaries, rent, utilities)." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Net Profit:</strong>} secondary="Gross Profit minus Operating Expenses. The 'bottom line'." /></ListItem>
                  <ListItem><ListItemText primary={<strong>Net Margin:</strong>} secondary="Net Profit shown as a percentage of Total Revenue." /></ListItem>
                   <ListItem><ListItemText primary={<strong>Budget Variance:</strong>} secondary="Percentage difference between Actual and Budget figures (Positive % is favorable for Revenue/Profit, negative % is favorable for Expenses)." /></ListItem>
                </List>
                <Typography variant="caption" color="text.secondary">
                    Hover over a KPI card for a brief explanation (tooltip). Financial values may be compacted (K for thousands, M for millions).
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
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>1. P&L Summary (vs Budget)</Typography>
                    <Typography variant="body2" paragraph>
                        This vertical bar chart compares key Profit & Loss components (Actual vs. Budget) for the selected period. The primary bars show Actual (Blue) and Budget (Grey) values. Labels on the right indicate the percentage variance of Actual vs. Budget for each component.
                    </Typography>
                    <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Performance Check:</strong>} secondary="Quickly see if Revenue, Gross Profit, and Net Profit met or exceeded budget." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Variance Analysis:</strong>} secondary="Identify which P&L lines had the largest positive or negative variance compared to the budget." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>2. Monthly Financial Trends (Actual)</Typography>
                    <Typography variant="body2" paragraph>
                        This chart displays the trend of actual Total Revenue (Green Area), Gross Profit (Blue Line), and Net Profit (Red Line) on a monthly basis over the selected date range.
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Performance Over Time:</strong>} secondary="Track the trajectory of key financial metrics month-over-month." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Seasonality/Patterns:</strong>} secondary="Identify potential seasonal patterns or significant changes in profitability." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Correlation:</strong>} secondary="Observe how changes in revenue impact gross and net profit over time." /></ListItem>
                    </List>
                </Box>
                 <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>3. Operating Expense Breakdown (Actual)</Typography>
                     <Typography variant="body2" paragraph>
                       This donut chart shows the proportion of total actual Operating Expenses attributed to each major expense category (e.g., Salaries, Rent, Utilities).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Cost Structure:</strong>} secondary="Understand the major components driving operating costs." /></ListItem>
                         <ListItem><ListItemText primary={<strong>Cost Control Focus:</strong>} secondary="Highlight the largest expense categories where cost-saving efforts might have the most impact." /></ListItem>
                    </List>
                </Box>
                <Divider sx={{ my: 2 }}/>

                 <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'bold'}}>4. Store Profitability (Actual Net Profit & Margin)</Typography>
                     <Typography variant="body2" paragraph>
                        This chart ranks stores based on their actual Net Profit (Green Bars, bottom axis) and also displays their Net Profit Margin (Red Line, top axis) for the selected period. Stores are sorted by Net Profit (highest first).
                    </Typography>
                     <List dense sx={{pl: 2}}>
                        <ListItem><ListItemText primary={<strong>Top/Bottom Performers:</strong>} secondary="Identify the most and least profitable store locations." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Profit vs. Margin:</strong>} secondary="Compare absolute profit with profitability percentage. A store might have high profit but lower margin, or vice-versa." /></ListItem>
                        <ListItem><ListItemText primary={<strong>Benchmarking:</strong>} secondary="Compare individual store performance against the average or best performers." /></ListItem>
                    </List>
                </Box>
                {/* Add Table explanation if a details table is included later */}
            </Paper>
        </Grid>

         <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                 <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> Important Considerations
                </Typography>
                 <List dense>
                    <ListItem><ListItemIcon sx={{minWidth: 30}}><InfoIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Mock Data: Financial figures are simulated based on assumed relationships and base values. Actual financial data involves more complex accounting." /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><UpdateIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={`Data Refresh: Dashboard attempts to fetch new data every ${refreshIntervalSeconds} seconds.`} /></ListItem>
                     <ListItem><ListItemIcon sx={{minWidth: 30}}><AccountBalanceIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="P&L Calculations: Gross Profit = Revenue - COGS. Net Profit = Gross Profit - Operating Expenses. Margins are calculated relative to Revenue." /></ListItem>
                      <ListItem><ListItemIcon sx={{minWidth: 30}}><CompareArrowsIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Budget Data: Budget figures are simulated and may represent simplified targets." /></ListItem>
                       <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingDownIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Expense Sign: Expenses (COGS, OpEx) are stored as positive values in the data; their negative impact is applied visually or in calculations (e.g., P&L summary, profit calculations)." /></ListItem>
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialOverviewDashboardGuide;