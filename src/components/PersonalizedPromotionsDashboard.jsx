import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Autocomplete, TextField, Skeleton, Tabs, Tab, Link, List, ListItem, ListItemText, ListItemIcon, IconButton, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, isValid, startOfDay, endOfDay, subDays } from 'date-fns';

// MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import CampaignIcon from '@mui/icons-material/Campaign';
import CategoryIcon from '@mui/icons-material/Category';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import InsightsIcon from '@mui/icons-material/Insights'; // For MBA
import RecommendIcon from '@mui/icons-material/Recommend'; // For Opportunities
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LinkIcon from '@mui/icons-material/Link';
import RuleIcon from '@mui/icons-material/Rule'; // For Association Rules
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DownloadIcon from '@mui/icons-material/Download'; // For Download

// Import data generators
import { generateMockSalesData, getMockProducts, getMockCustomers, getMockPromotions } from '../utils/mockDataGenerator';
import { generateMockAssociationRules, generateMockCustomerSegmentMetrics } from '../utils/mockAnalysisGenerator';

// --- Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// --- Helper Functions ---
const formatCurrency = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; };
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };
const formatPercent = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(digits)}%`; };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid Date'; } catch { return 'Invalid Date'; } };

// --- Custom Components ---
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', tooltip = '' }) => ( <MuiTooltip title={tooltip} placement="top" arrow disableHoverListener={!tooltip}> <Card elevation={2} sx={{ height: '100%' }}><CardContent><Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>{title}</Typography><Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>{loading ? (<Skeleton variant="text" width="80%" />) : (<>{icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}<Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}</Typography></>)}</Box></CardContent></Card> </MuiTooltip> );

// --- Main Component ---
const PersonalizedPromotionsDashboard = () => {
    const theme = useTheme();

    // State
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [salesData, setSalesData] = useState([]); const [products, setProducts] = useState([]); const [customers, setCustomers] = useState([]); const [promotions, setPromotions] = useState([]); const [associationRules, setAssociationRules] = useState([]); const [segmentMetrics, setSegmentMetrics] = useState([]);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [customerPage, setCustomerPage] = useState(0); const [customerRowsPerPage, setCustomerRowsPerPage] = useState(5);

    // --- Data Fetching & Analysis Simulation ---
    useEffect(() => {
        setLoading(true); setError(null);
        const salesPromise = new Promise(res => setTimeout(() => res(generateMockSalesData(startOfDay(subDays(new Date(), 89)), endOfDay(new Date()))), 600));
        const productsPromise = new Promise(res => setTimeout(() => res(getMockProducts()), 100));
        const customersPromise = new Promise(res => setTimeout(() => res(getMockCustomers()), 150));
        const promotionsPromise = new Promise(res => setTimeout(() => res(getMockPromotions()), 200));
        Promise.all([salesPromise, productsPromise, customersPromise, promotionsPromise])
            .then(([sales, prods, custs, promos]) => {
                if (!Array.isArray(sales) || !Array.isArray(prods) || !Array.isArray(custs) || !Array.isArray(promos)) { throw new Error("Base data failed."); }
                setSalesData(sales); setProducts(prods); setCustomers(custs); setPromotions(promos);
                const rulesPromise = new Promise(res => setTimeout(() => res(generateMockAssociationRules(prods)), 400));
                const segmentsPromise = new Promise(res => setTimeout(() => res(generateMockCustomerSegmentMetrics(custs, sales)), 500));
                return Promise.all([rulesPromise, segmentsPromise]);
            })
            .then(([rules, segments]) => {
                 if (!Array.isArray(rules) || !Array.isArray(segments)) { throw new Error("Analysis failed."); }
                setAssociationRules(rules); setSegmentMetrics(segments);
                if (segments.length > 0 && !selectedSegment) {
                    // console.log("Auto-selecting first segment:", segments[0]); // Log the object
                    setSelectedSegment(segments[0]);
                }
                setLoading(false);
            })
            .catch(err => { console.error("Error loading data:", err); setError(`Failed: ${err.message}`); setLoading(false); });
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Memoized Data ---
    const topAssociationRules = useMemo(() => associationRules.slice(0, 5), [associationRules]);
    // This one is primarily for the table/download
    const customersInSelectedSegment = useMemo(() => { if (!selectedSegment || !customers) return []; return customers.filter(c => c.segment === selectedSegment.segmentName); }, [customers, selectedSegment]);
    const activePromotions = useMemo(() => promotions.filter(p => p.endDate >= new Date()), [promotions]);

    // ** REVISED: Dynamic Top Categories Calculation - DEPENDS ON SEGMENT NAME **
    const dynamicTopCategories = useMemo(() => {
        const currentSegmentName = selectedSegment?.segmentName; // Get the name
        // console.log(`Calculating dynamicTopCategories for segment NAME: "${currentSegmentName ?? 'None'}"`); // Log name

        if (!currentSegmentName || !salesData || salesData.length === 0 || !customers || customers.length === 0) {
            // console.log("-> Skipping: No segment NAME, sales data, or customers.");
            return [];
        }

        // Find customer keys for the currently selected segment NAME
        const segmentCustomerKeys = new Set();
        customers.forEach(c => {
            if(c.segment === currentSegmentName) { // Compare names
                segmentCustomerKeys.add(c.customerKey);
            }
        });
        // console.log(`-> Found ${segmentCustomerKeys.size} keys for "${currentSegmentName}"`);
        if (segmentCustomerKeys.size === 0) return [];

        // Filter sales and count categories
        const categoryCounts = salesData.reduce((acc, sale) => {
            if (sale.customerKey && segmentCustomerKeys.has(sale.customerKey)) {
                const cat = sale.categoryName || 'Unknown';
                acc[cat] = (acc[cat] || 0) + 1;
            }
            return acc;
        }, {});
        // console.log(" -> Counts:", categoryCounts);

        // Sort and get top 3
        const topCats = Object.entries(categoryCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3)
            .map(([name]) => name);

        // console.log(" -> Result:", topCats);
        return topCats;

    }, [selectedSegment?.segmentName, salesData, customers]); // ** DEPEND ON SEGMENT NAME (PRIMITIVE) **


    // Dynamic Promotion Recommendations Logic
    const promotionOpportunities = useMemo(() => {
        if (!selectedSegment || loading) return [];
        const opportunities = []; const segmentName = selectedSegment.segmentName; const metrics = segmentMetrics.find(m => m.segmentName === segmentName); const avgVisitFreq = metrics && metrics.customerCount > 0 ? metrics.totalVisits / metrics.customerCount : 0;
        const existingSegmentPromo = activePromotions.find(p => p.segment === segmentName); if (existingSegmentPromo) { opportunities.push({ key: 'seg_promo', icon: <LoyaltyIcon color="primary" fontSize="small"/>, primary: `Utilize existing "${existingSegmentPromo.name}".`, secondary: `Targets "${segmentName}".` }); }
        if (dynamicTopCategories.length > 0) { const topCat = dynamicTopCategories[0]; const topCatKey = products.find(pr => pr.categoryName === topCat)?.categoryKey; const existingCatPromo = activePromotions.find(p => p.categoryKey && p.categoryKey === topCatKey); if (existingCatPromo) { opportunities.push({ key: 'top_cat_exist', icon: <CategoryIcon color="primary" fontSize="small"/>, primary: `Promote existing "${existingCatPromo.name}".`, secondary: `Targets top category "${topCat}".` }); } else { opportunities.push({ key: 'top_cat_new', icon: <CategoryIcon color="action" fontSize="small"/>, primary: `Create offer for top category: "${topCat}".`, secondary: `High segment affinity.` }); } }
        if (topAssociationRules.length > 0) { const rule = topAssociationRules[0]; const existingBundle = activePromotions.find(p => p.type === 'Bundle' && rule.antecedentKeys.every(k => p.relatedKeys?.includes(k)) && rule.consequentKeys.every(k => p.relatedKeys?.includes(k))); if(existingBundle) { opportunities.push({ key: 'mba_exist', icon: <LinkIcon color="primary" fontSize="small"/>, primary: `Push existing bundle: "${existingBundle.name}".`, secondary: `Based on rule: ${rule.antecedentNames} -> ${rule.consequentNames}` }); } else { opportunities.push({ key: 'mba_new', icon: <LinkIcon color="action" fontSize="small"/>, primary: `Create bundle: "${rule.antecedentNames}" + "${rule.consequentNames}".`, secondary: `Strong co-purchase (Lift ${rule.lift.toFixed(1)})` }); } }
        if (selectedSegment.avgBasketSize > 150) { const existingBasketPromo = activePromotions.find(p => p.type === 'Basket Value' && p.minValue && p.minValue <= selectedSegment.avgBasketSize * 1.1); if (existingBasketPromo) { opportunities.push({ key: 'high_basket_exist', icon: <AttachMoneyIcon color="primary" fontSize="small"/>, primary: `Highlight "${existingBasketPromo.name}".`, secondary: `High avg. basket.` }); } else { opportunities.push({ key: 'high_basket_new', icon: <AttachMoneyIcon color="action" fontSize="small"/>, primary: "Offer 'Spend & Save' (e.g., 10% off EGP 200+).", secondary: `Incentivize high basket.` }); } }
        if (!isNaN(avgVisitFreq) && avgVisitFreq > 0 && avgVisitFreq < 5) { opportunities.push({ key: 'low_freq', icon: <PeopleAltIcon color="action" fontSize="small"/>, primary: "Targeted 'Welcome Back' / Frequency offer.", secondary: `Low freq. (${avgVisitFreq.toFixed(1)} avg visits).` }); }
        if (opportunities.length < 2 || segmentName === 'New Member') { const generalPromo = activePromotions.find(p => !p.segment && !p.productKey && !p.categoryKey && p.type !== 'Bundle'); if (generalPromo && !opportunities.some(op => op.key === 'general')) { opportunities.push({ key: 'general', icon: <CampaignIcon color="info" fontSize="small"/>, primary: `Utilize general offer: "${generalPromo.name}".`, secondary: "Broad appeal / New member." }); } }
        const uniqueOpportunities = Array.from(new Map(opportunities.map(op => [op.key, op])).values()); return uniqueOpportunities.slice(0, 5);
    }, [selectedSegment, loading, activePromotions, topAssociationRules, products, segmentMetrics, dynamicTopCategories]); // Keep dependencies

    // --- Handlers ---
    const handleSegmentSelect = useCallback((segmentName) => {
        console.log("Segment selected:", segmentName); // LOG
        const seg = segmentMetrics.find(s => s.segmentName === segmentName);
        // console.log("Found segment object:", seg); // LOG
        setSelectedSegment(seg); // Update state
        setCustomerPage(0);
    }, [segmentMetrics]);

    const handleCustomerChangePage = (event, newPage) => { setCustomerPage(newPage); };
    const handleCustomerChangeRowsPerPage = (event) => { setCustomerRowsPerPage(parseInt(event.target.value, 10)); setCustomerPage(0); };
    const handleSegmentDownload = useCallback(() => { if (!selectedSegment || customersInSelectedSegment.length === 0) { alert('No customer data'); return; } const h = ["CustomerID", "CustomerName", "Segment", "ValueSegment", "JoinDate", "City"]; const r = customersInSelectedSegment.map(c => [ c.customerId || c.customerKey, `"${c.customerName.replace(/"/g, '""')}"`, c.segment, c.valueSegment || 'N/A', formatDate(c.joinDate), c.city || 'N/A' ]); let csv = "data:text/csv;charset=utf-8," + h.join(",") + "\n" + r.map(e => e.join(",")).join("\n"); try { const u = encodeURI(csv); const l = document.createElement("a"); l.setAttribute("href", u); l.setAttribute("download", `cust_seg_${selectedSegment.segmentName.replace(/\s+/g, '_')}.csv`); document.body.appendChild(l); l.click(); document.body.removeChild(l); } catch (e) { console.error("CSV Error:", e); alert("Download failed."); } }, [selectedSegment, customersInSelectedSegment]);


    // --- Render Logic ---
    // console.log("Dashboard rendering. Selected Segment Name:", selectedSegment?.segmentName, "Dynamic Top Cats:", dynamicTopCategories); // LOG

    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }

    return (
        <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                Personalized Promotions Engine
            </Typography>

            {loading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box> ) : (
                <Grid container spacing={3}>
                    {/* Left Panel: Customer Segments */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center' }}><PeopleAltIcon sx={{ mr: 1 }}/> Customer Segments</Typography>
                            {segmentMetrics.length === 0 ? ( <Typography color="textSecondary">No segment data.</Typography> ) : (
                                <List dense>
                                    {segmentMetrics.map((segment) => (
                                        <ListItem key={segment.segmentName} disablePadding secondaryAction={ <IconButton edge="end" onClick={() => handleSegmentSelect(segment.segmentName)}> <ChevronRightIcon color={selectedSegment?.segmentName === segment.segmentName ? "primary" : "inherit"}/> </IconButton> } sx={{ mb: 1, bgcolor: selectedSegment?.segmentName === segment.segmentName ? theme.palette.action.hover : 'transparent', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleSegmentSelect(segment.segmentName)} >
                                             <ListItemText primary={segment.segmentName} secondary={`${formatNumber(segment.customerCount)} Cust. | Avg: ${formatCurrency(segment.avgBasketSize)}`} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Panel: Segment Details, Insights & Recommendations */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Grid container spacing={3}>
                             {/* Selected Segment Details */}
                             <Grid item xs={12}>
                                <Paper elevation={3} sx={{ p: 2 }}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                                        <Typography variant="h6" sx={{ color: 'text.primary' }}>{selectedSegment ? `Details for: ${selectedSegment.segmentName}` : "Select a Segment"}</Typography>
                                        {selectedSegment && (<Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleSegmentDownload} disabled={customersInSelectedSegment.length === 0}>Download List ({formatNumber(customersInSelectedSegment.length)})</Button>)}
                                    </Box>
                                    {selectedSegment ? (
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} sm={3}><KpiCard title="Total Spent" value={selectedSegment.totalSpent} formatFunc={formatCurrency} loading={loading} color="success.main"/></Grid>
                                            <Grid item xs={6} sm={3}><KpiCard title="Total Visits" value={selectedSegment.totalVisits} formatFunc={formatNumber} loading={loading} /></Grid>
                                            <Grid item xs={6} sm={3}><KpiCard title="Avg Basket Size" value={selectedSegment.avgBasketSize} formatFunc={formatCurrency} loading={loading} /></Grid>
                                            <Grid item xs={6} sm={3}><KpiCard title="Customers" value={selectedSegment.customerCount} formatFunc={formatNumber} loading={loading} /></Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>Top Categories Purchased:</Typography>
                                                 {/* ** USING dynamicTopCategories ** */}
                                                 <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                     {dynamicTopCategories.length > 0
                                                        ? dynamicTopCategories.map(cat => <Chip key={cat} label={cat} size="small" color="secondary" variant="outlined"/>)
                                                        : <Chip label="N/A" size="small" />
                                                     }
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    ) : ( <Typography color="textSecondary">Select a segment to see details.</Typography> )}
                                </Paper>
                             </Grid>

                             {/* Market Basket Insights */}
                             <Grid item xs={12} lg={6}>
                                 <Paper elevation={3} sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
                                     <Typography variant="h6" sx={{ mb: 1, color: 'text.primary', display: 'flex', alignItems: 'center' }}><InsightsIcon sx={{ mr: 1 }}/> Market Basket Insights</Typography>
                                     {/* ** CLARIFICATION ADDED ** */}
                                     <Typography variant="caption" color="textSecondary" sx={{ mb: 2 }}>Top 5 GENERAL product associations by Lift</Typography>
                                     {topAssociationRules.length > 0 ? (
                                         <TableContainer sx={{ flexGrow: 1 }}>
                                             <Table size="small" stickyHeader>
                                                 <TableHead> <TableRow> <TableCell sx={{fontWeight:'bold'}}>If Buys</TableCell> <TableCell sx={{fontWeight:'bold'}}>Then Buys</TableCell> <TableCell align="right" sx={{fontWeight:'bold'}}>Lift</TableCell> <TableCell align="right" sx={{fontWeight:'bold'}}>Confid.</TableCell> </TableRow> </TableHead>
                                                 <TableBody> {topAssociationRules.map((rule) => ( <TableRow hover key={rule.ruleId || rule.antecedentNames}> <TableCell>{rule.antecedentNames}</TableCell> <TableCell>{rule.consequentNames}</TableCell> <TableCell align="right">{rule.lift.toFixed(2)}</TableCell> <TableCell align="right">{formatPercent(rule.confidence * 100, 0)}</TableCell> </TableRow> ))} </TableBody>
                                             </Table>
                                         </TableContainer>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No association rules.</Typography></Box> )}
                                 </Paper>
                             </Grid>

                             {/* Promotion Recommendations */}
                             <Grid item xs={12} lg={6}>
                                  <Paper elevation={3} sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
                                     <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center' }}><RecommendIcon sx={{ mr: 1 }} /> Promotion Opportunities</Typography>
                                     {selectedSegment ? (
                                         <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                             <Typography variant="subtitle2" gutterBottom>For Segment: "{selectedSegment.segmentName}"</Typography>
                                             {promotionOpportunities.length > 0 ? (
                                                 <List dense>
                                                     {promotionOpportunities.map((opp) => ( <ListItem key={opp.key} disablePadding sx={{mb: 1.5}}> <ListItemIcon sx={{minWidth: 35}}>{opp.icon}</ListItemIcon> <ListItemText primary={opp.primary} secondary={opp.secondary}/> </ListItem> ))}
                                                 </List>
                                              ) : ( <Typography color="textSecondary" sx={{mt: 2}}>No specific opportunities identified.</Typography> )}
                                             <Typography variant="caption" color="textSecondary" sx={{mt: 2, display: 'block'}}>* Simulated recommendations.</Typography>
                                         </Box>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">Select a segment.</Typography></Box> )}
                                 </Paper>
                             </Grid>

                             {/* Customer List Table */}
                             <Grid item xs={12}>
                                 <Paper elevation={3} sx={{ p: 2, mt: 0 }}> <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>{selectedSegment ? `Customers in Segment: ${selectedSegment.segmentName}` : "Customer List"}</Typography> {selectedSegment && customersInSelectedSegment.length > 0 ? ( <> <TableContainer sx={{ maxHeight: 400 }}> <Table size="small" stickyHeader> <TableHead><TableRow><TableCell sx={{fontWeight:'bold'}}>Customer ID</TableCell><TableCell sx={{fontWeight:'bold'}}>Name</TableCell><TableCell sx={{fontWeight:'bold'}}>Value</TableCell><TableCell sx={{fontWeight:'bold'}}>City</TableCell><TableCell sx={{fontWeight:'bold'}}>Join Date</TableCell></TableRow></TableHead> <TableBody> {customersInSelectedSegment.slice(customerPage * customerRowsPerPage, customerPage * customerRowsPerPage + customerRowsPerPage).map((customer) => ( <TableRow hover key={customer.customerKey}><TableCell>{customer.customerId || customer.customerKey}</TableCell><TableCell>{customer.customerName}</TableCell><TableCell><Chip label={customer.valueSegment || 'N/A'} size="small" color={customer.valueSegment === 'High' ? 'success' : customer.valueSegment === 'Low' ? 'warning' : 'default'} variant="outlined"/></TableCell><TableCell>{customer.city || 'N/A'}</TableCell><TableCell>{formatDate(customer.joinDate)}</TableCell></TableRow> ))} </TableBody> </Table> </TableContainer> <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={customersInSelectedSegment.length} rowsPerPage={customerRowsPerPage} page={customerPage} onPageChange={handleCustomerChangePage} onRowsPerPageChange={handleCustomerChangeRowsPerPage} sx={{'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }} /> </> ) : ( <Typography color="textSecondary">{selectedSegment ? 'No customers found.' : 'Select a segment.'}</Typography> )} </Paper>
                             </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default PersonalizedPromotionsDashboard;