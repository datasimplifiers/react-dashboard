import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Link, Chip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import RecommendIcon from '@mui/icons-material/Recommend';
import TableChartIcon from '@mui/icons-material/TableChart';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Example icon for success
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';


const PersonalizedPromotionsDashboardGuide = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Guide: Personalized Promotions Engine Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Purpose of this Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          This dashboard leverages customer segmentation and purchase pattern analysis (Market Basket Insights) to suggest personalized promotion opportunities.
          The goal is to move beyond generic offers and deliver more relevant promotions to specific customer groups, aiming to:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><LoyaltyIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Increase customer loyalty and engagement." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><ShoppingBasketIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Increase average basket size through cross-selling and up-selling." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Improve promotion effectiveness and ROI." /></ListItem>
          <ListItem><ListItemIcon sx={{minWidth: 30}}><CampaignIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary="Provide targeted offers based on segment behavior and product affinities." /></ListItem>
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
              <PeopleAltIcon sx={{ mr: 1, color: 'primary.main' }} /> Customer Segments
            </Typography>
            <Typography variant="body2" paragraph>
              This panel lists the identified customer segments based on historical purchase behavior (simulated analysis).
            </Typography>
            <List dense>
              <ListItem><ListItemText primary={<strong>Segment Name:</strong>} secondary="The label assigned to the group (e.g., Family Shopper, Budget Conscious)." /></ListItem>
              <ListItem><ListItemText primary={<strong>Metrics:</strong>} secondary="Shows the approximate number of customers and the average basket size for each segment." /></ListItem>
              <ListItem><ListItemText primary={<strong>Interaction:</strong>} secondary="Click on any segment name in this list to load its specific details, insights, and recommendations in the panels to the right." /></ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
            <Grid container spacing={3}>
                {/* Segment Details Explanation */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> Segment Details
                        </Typography>
                        <Typography variant="body2" paragraph>
                            This section displays key metrics for the **currently selected** customer segment from the left panel.
                        </Typography>
                         <List dense>
                            <ListItem><ListItemText primary={<strong>Total Spent:</strong>} secondary="Total amount spent by customers in this segment during the analysis period." /></ListItem>
                            <ListItem><ListItemText primary={<strong>Total Visits:</strong>} secondary="Total number of unique shopping days (approximating visits) for customers in this segment." /></ListItem>
                            <ListItem><ListItemText primary={<strong>Avg Basket Size:</strong>} secondary="Average amount spent per visit by customers in this segment." /></ListItem>
                            <ListItem><ListItemText primary={<strong>Customers:</strong>} secondary="The number of customers belonging to this segment." /></ListItem>
                            <ListItem><ListItemText primary={<strong>Top Categories Purchased:</strong>} secondary="The top 3 product categories most frequently purchased by customers in this specific segment (calculated dynamically)." /></ListItem>
                             <ListItem><ListItemIcon sx={{minWidth: 30}}><DownloadIcon fontSize="small" color="action" /></ListItemIcon><ListItemText primary={<strong>Download List Button:</strong>} secondary="Allows you to download a CSV file containing the list of customers within the currently selected segment." /></ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Market Basket Insights Explanation */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                         <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <InsightsIcon sx={{ mr: 1, color: 'primary.main' }} /> Market Basket Insights
                        </Typography>
                        <Typography variant="body2" paragraph>
                            This table shows the results of a simulated Market Basket Analysis across **all** customer transactions (not specific to the selected segment). It identifies products frequently purchased together.
                        </Typography>
                         <List dense>
                            <ListItem><ListItemText primary={<strong>If Buys (Antecedent):</strong>} secondary="The product(s) a customer puts in their basket." /></ListItem>
                            <ListItem><ListItemText primary={<strong>Then Buys (Consequent):</strong>} secondary="The other product(s) likely to be purchased in the same transaction." /></ListItem>
                             <ListItem><ListItemText primary={<strong>Lift:</strong>} secondary="Indicates the strength of the association. Lift > 1 suggests the items are bought together more often than expected by chance. Higher lift is stronger." /></ListItem>
                             <ListItem><ListItemText primary={<strong>Confidence:</strong>} secondary="The probability of buying the 'Consequent' given that the 'Antecedent' was already purchased (e.g., 65% confidence means 65% of baskets with Pasta also contained Pasta Sauce)." /></ListItem>
                        </List>
                         <Typography variant="body2" sx={{mt: 1}}>
                            Use these rules to identify potential product bundles or cross-selling promotion opportunities.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Recommendations Explanation */}
                 <Grid item xs={12} lg={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                         <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <RecommendIcon sx={{ mr: 1, color: 'primary.main' }} /> Promotion Opportunities
                        </Typography>
                        <Typography variant="body2" paragraph>
                            This panel provides <strong>dynamic, simulated recommendations</strong> for promotions specifically targeted at the <strong>selected customer segment</strong>. The suggestions are based on:
                        </Typography>
                         <List dense>
                            <ListItem><ListItemIcon sx={{minWidth: 30}}><CategoryIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="The segment's top purchased category." /></ListItem>
                            <ListItem><ListItemIcon sx={{minWidth: 30}}><LinkIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="The strongest overall Market Basket association rule." /></ListItem>
                             <ListItem><ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="The segment's average basket size (suggesting spend-based offers for high spenders)." /></ListItem>
                              <ListItem><ListItemIcon sx={{minWidth: 30}}><PeopleAltIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="The segment's visit frequency (suggesting win-back offers for infrequent shoppers)." /></ListItem>
                             <ListItem><ListItemIcon sx={{minWidth: 30}}><CampaignIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="Any existing promotions already targeting this segment." /></ListItem>
                             <ListItem><ListItemIcon sx={{minWidth: 30}}><LoyaltyIcon fontSize="small" color="action"/></ListItemIcon><ListItemText primary="General or New Member offers as fallbacks." /></ListItem>
                        </List>
                         <Typography variant="body2" sx={{mt: 1}}>
                            Review these suggestions to create more effective and personalized marketing campaigns.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Customer List Table Explanation */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <TableChartIcon sx={{ mr: 1, color: 'primary.main' }} /> Customer List Table
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Displays a list of individual customers belonging to the **currently selected segment**. This allows for a drill-down view after analyzing the segment's overall characteristics.
                        </Typography>
                         <List dense>
                            <ListItem><ListItemText primary={<strong>Columns:</strong>} secondary="Shows Customer ID, Name (anonymized), Value Segment (High/Medium/Low), City, and Join Date." /></ListItem>
                             <ListItem><ListItemText primary={<strong>Pagination:</strong>} secondary="Use the controls at the bottom if there are many customers in the segment." /></ListItem>
                             <ListItem><ListItemText primary={<strong>Download:</strong>} secondary="The download button at the top of the 'Segment Details' section downloads this specific customer list." /></ListItem>
                        </List>
                    </Paper>
                </Grid>

                 <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> Important Considerations
                        </Typography>
                         <List dense>
                            <ListItem><ListItemText primary="Mock Data & Analysis: All customer data, sales history, segmentation, and MBA rules are simulated." /></ListItem>
                            <ListItem><ListItemText primary="Recommendation Logic: The promotion opportunities are generated based on simple rules applied to the simulated data; a real system would use more sophisticated machine learning models." /></ListItem>
                            <ListItem><ListItemText primary="Data Requirements: Effective personalization requires accurate customer identification (loyalty program), detailed transaction history, and potentially demographic data." /></ListItem>
                        </List>
                    </Paper>
                </Grid>

            </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalizedPromotionsDashboardGuide; // ** RENAME this export **