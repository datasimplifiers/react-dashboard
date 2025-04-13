import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Autocomplete, TextField, Skeleton, Tabs, Tab, Link, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInMinutes } from 'date-fns'; // Removed addDays if not used

// MUI Icons
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WebIcon from '@mui/icons-material/Web';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import MoodIcon from '@mui/icons-material/Mood'; // Good CSAT
import MoodBadIcon from '@mui/icons-material/MoodBad'; // Bad CSAT
import TimerIcon from '@mui/icons-material/Timer';
import PendingActionsIcon from '@mui/icons-material/PendingActions'; // Open tickets
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Resolved
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // For Segment filter
import ErrorIcon from '@mui/icons-material/Error'; // For Closed/Cancelled?
import UpdateIcon from '@mui/icons-material/Update'; // For In Progress

// Import data generators
import { getMockCustomers, getMockProducts } from '../utils/mockDataGenerator'; // Get base dimensions
import { generateMockWebInteractions, generateMockSupportTickets } from '../utils/mockSupportDataGenerator';

// --- Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const CSAT_COLORS = ['#d32f2f', '#ed6c02', '#ffc107', '#8bc34a', '#4caf50'];

// ** NEW: STATUS_MAP Constant **
const STATUS_MAP = {
    'Open': { color: (theme) => theme.palette.info.main, icon: <PendingActionsIcon fontSize="inherit" /> },
    'In Progress': { color: (theme) => theme.palette.secondary.main, icon: <UpdateIcon fontSize="inherit" /> },
    'Resolved': { color: (theme) => theme.palette.success.main, icon: <CheckCircleOutlineIcon fontSize="inherit" /> },
    'Closed': { color: (theme) => theme.palette.success.dark, icon: <CheckCircleOutlineIcon fontSize="inherit" /> },
    'False Positive': { color: (theme) => theme.palette.grey[500], icon: <ErrorIcon fontSize="inherit" /> },
    // Add more statuses as needed
    'New': { color: (theme) => theme.palette.info.main, icon: <PendingActionsIcon fontSize="inherit" /> }, // Map 'New' to same as 'Open'
};

// --- Helper Functions ---
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };
const formatPercent = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(digits)}%`; };
const formatMinutes = (mins) => { if (mins === null || !isFinite(mins)) return 'N/A'; if (mins < 60) return `${Math.round(mins)} min`; const hours = Math.floor(mins / 60); const remMins = Math.round(mins % 60); return `${hours}h ${remMins}m`; };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d') : ''; } catch { return ''; } };
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };


// --- Kpi Card ---
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
             <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
                 <Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>{title}</Typography>
             </MuiTooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                {loading ? (<Skeleton variant="text" width="80%" />) : (
                    <>
                        {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || color }}>
                            {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}
                        </Typography>
                    </>
                )}
            </Box>
        </CardContent>
    </Card>
);


// --- Main Component ---
const CustomerExperienceDashboard = () => {
    const theme = useTheme();

    // State
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [webInteractions, setWebInteractions] = useState([]); const [supportTickets, setSupportTickets] = useState([]); const [customers, setCustomers] = useState([]); const [products, setProducts] = useState([]);
    // Filters
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 29)), endOfDay(new Date())]);
    const [selectedChannel, setSelectedChannel] = useState('ALL'); const [selectedSegment, setSelectedSegment] = useState('ALL'); const [selectedTicketStatus, setSelectedTicketStatus] = useState('ALL');
    // Table State
    const [tablePage, setTablePage] = useState(0); const [rowsPerPage, setRowsPerPage] = useState(10);
    // ** ADDED Table Sorting State **
    const [orderBy, setOrderBy] = useState('createdTimestamp'); // Default sort for tickets
    const [order, setOrder] = useState('desc');

    // Dimensions for Filters
    const channels = useMemo(() => ['ALL', 'WebApp', 'MobileApp', 'Phone', 'Chat', 'Email'], []);
    const customerSegments = useMemo(() => ['ALL', ...new Set(customers.map(c => c.segment).filter(Boolean))].sort(), [customers]);
    const ticketStatuses = useMemo(() => ['ALL', 'New', 'In Progress', 'Resolved', 'Closed', 'False Positive'], []);

    // --- Data Fetching ---
    useEffect(() => {
        setLoading(true); setError(null); const [start, end] = dateRange; if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }
        Promise.all([ new Promise(res => setTimeout(() => res(getMockCustomers()), 100)), new Promise(res => setTimeout(() => res(getMockProducts()), 150)), ])
        .then(([custs, prods]) => { if (!Array.isArray(custs) || !Array.isArray(prods)) throw new Error("Base dimension fetch failed."); setCustomers(custs); setProducts(prods); return Promise.all([ new Promise(res => setTimeout(() => res(generateMockWebInteractions(start, end, custs, prods)), 600)), new Promise(res => setTimeout(() => res(generateMockSupportTickets(start, end, custs)), 500)), ]); })
        .then(([interactions, tickets]) => { if (!Array.isArray(interactions) || !Array.isArray(tickets)) throw new Error("Interactional data fetch failed."); setWebInteractions(interactions); setSupportTickets(tickets); setLoading(false); })
        .catch(err => { console.error("Error loading CX data:", err); setError(`Failed: ${err.message}`); setLoading(false); });
    }, [dateRange]);

    // Customer Map for quick lookup
    const customerMap = useMemo(() => new Map(customers.map(c => [c.customerKey, c])), [customers]);

    // --- Filtered Data ---
    const filteredWebInteractions = useMemo(() => { if (loading) return []; return webInteractions.filter(i => (selectedChannel === 'ALL' || selectedChannel === i.channel || ['WebApp', 'MobileApp'].includes(selectedChannel)) && (selectedSegment === 'ALL' || (i.customerKey && customerMap.get(i.customerKey)?.segment === selectedSegment)) ); }, [loading, webInteractions, selectedChannel, selectedSegment, customerMap]);
    const filteredSupportTickets = useMemo(() => { if (loading) return []; return supportTickets.filter(t => (selectedChannel === 'ALL' || selectedChannel === t.channel || !['WebApp', 'MobileApp'].includes(selectedChannel)) && (selectedSegment === 'ALL' || (t.customerKey && customerMap.get(t.customerKey)?.segment === selectedSegment)) && (selectedTicketStatus === 'ALL' || t.status === selectedTicketStatus) ); }, [loading, supportTickets, selectedChannel, selectedSegment, selectedTicketStatus, customerMap]);


    // --- KPIs ---
    const kpiData = useMemo(() => {
        const sessions = new Set(filteredWebInteractions.map(i => i.sessionId)); const totalSessions = sessions.size; const purchaseEvents = filteredWebInteractions.filter(i => i.eventType === 'purchase_complete'); const uniquePurchasingSessions = new Set(purchaseEvents.map(i=>i.sessionId)); const conversionRate = totalSessions > 0 ? (uniquePurchasingSessions.size / totalSessions) * 100 : 0; const searchEvents = filteredWebInteractions.filter(i => i.eventType === 'search'); const successfulSearches = searchEvents.filter(i => i.isSearchSuccess).length; const searchSuccessRate = searchEvents.length > 0 ? (successfulSearches / searchEvents.length) * 100 : 0; const recClicks = filteredWebInteractions.filter(i => i.eventType === 'click_recommendation').length; const sessionsWithPotentialRecs = new Set(filteredWebInteractions.filter(i => i.eventType === 'view_product').map(i => i.sessionId)); const recommendationCTR = sessionsWithPotentialRecs.size > 0 ? (recClicks / sessionsWithPotentialRecs.size) * 100 : 0;
        const totalTickets = filteredSupportTickets.length; const openTickets = filteredSupportTickets.filter(t => t.status === 'New' || t.status === 'In Progress').length; const resolvedTickets = filteredSupportTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed'); const totalResolutionTime = resolvedTickets.reduce((sum, t) => sum + (t.resolutionTimeMinutes || 0), 0); const avgResolutionTime = resolvedTickets.length > 0 ? totalResolutionTime / resolvedTickets.length : null; const ticketsWithCsat = filteredSupportTickets.filter(t => t.csatScore !== null && isFinite(t.csatScore)); const totalCsatScore = ticketsWithCsat.reduce((sum, t) => sum + t.csatScore, 0); const avgCSAT = ticketsWithCsat.length > 0 ? totalCsatScore / ticketsWithCsat.length : null;
        return { totalSessions, conversionRate, searchSuccessRate, recommendationCTR, totalTickets, openTickets, avgResolutionTime, avgCSAT };
    }, [filteredWebInteractions, filteredSupportTickets]);

    // --- Chart Data ---
    const funnelData = useMemo(() => { const sessions = new Set(filteredWebInteractions.map(i => i.sessionId)); const viewProductSessions = new Set(filteredWebInteractions.filter(i => i.eventType === 'view_product').map(i => i.sessionId)); const addToCartSessions = new Set(filteredWebInteractions.filter(i => i.eventType === 'add_to_cart').map(i => i.sessionId)); const purchaseSessions = new Set(filteredWebInteractions.filter(i => i.eventType === 'purchase_complete').map(i => i.sessionId)); return [ { name: 'Sessions', value: sessions.size }, { name: 'Viewed Product', value: viewProductSessions.size }, { name: 'Added to Cart', value: addToCartSessions.size }, { name: 'Purchased', value: purchaseSessions.size }, ]; }, [filteredWebInteractions]);
    const csatDistribution = useMemo(() => { const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; filteredSupportTickets.forEach(t => { if (t.csatScore >= 1 && t.csatScore <= 5) counts[t.csatScore]++; }); return Object.entries(counts).map(([name, value]) => ({ name: `${name} Star`, value })); }, [filteredSupportTickets]);
    const ticketsByCategory = useMemo(() => { const grouped = filteredSupportTickets.reduce((acc, t) => { const cat = t.category || 'Unknown'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {}); return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value); }, [filteredSupportTickets]);

    // --- Table Logic ---
    const handleRequestSort = useCallback((property) => { const isAsc = orderBy === property && order === 'asc'; setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); }, [order, orderBy]);
    const stableSort = useCallback((array, comparator) => { const sT = array.map((e, i) => [e, i]); sT.sort((x, y) => { const o = comparator(x[0], y[0]); if (o !== 0) return o; return x[1] - y[1]; }); return sT.map((e) => e[0]); }, []);
    const descendingComparator = useCallback((a, b, oB) => { let vA=a[oB]; let vB=b[oB]; if(vA==null&&vB==null)return 0; if(vA==null)return 1; if(vB==null)return -1; if(typeof vA==='string'&&typeof vB==='string'){vA=vA.toLowerCase();vB=vB.toLowerCase();} if(oB==='createdTimestamp'||oB==='resolvedTimestamp'){try{vA=parseISO(vA);vB=parseISO(vB);}catch(e){}} if(vB<vA)return -1; if(vB>vA)return 1; return 0; }, []);
    const getComparator = useCallback((o, oB) => { return o === 'desc' ? (a, b) => descendingComparator(a, b, oB) : (a, b) => -descendingComparator(a, b, oB); }, [descendingComparator]);
    // ** Using the STATE variables 'order' and 'orderBy' **
    const sortedTicketData = useMemo(() => stableSort(filteredSupportTickets, getComparator(order, orderBy)), [filteredSupportTickets, order, orderBy, stableSort, getComparator]);
    const handleChangePage = (event, newPage) => setTablePage(newPage); const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };
    const emptyRows = useMemo(() => { const count = sortedTicketData.length; return count > 0 ? Math.max(0, rowsPerPage - (count - tablePage * rowsPerPage)) : 0; }, [sortedTicketData, tablePage, rowsPerPage]);


    // --- Render Logic ---
    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }
    const chartPaperHeight = '380px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    Customer Experience & Support Overview
                </Typography>

                {/* Filters */}
                <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}> <DateRangePicker localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} /> </Grid>
                        <Grid item xs={12} sm={6} md={3}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Channel</InputLabel> <Select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} label="Channel" disabled={loading}> {channels.map(c => <MenuItem key={c} value={c}>{c === 'ALL' ? 'All Channels' : c}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={12} sm={6} md={3}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Customer Segment</InputLabel> <Select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} label="Customer Segment" disabled={loading || customerSegments.length <= 1}> {customerSegments.map(s => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All Segments' : s}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={12} sm={6} md={3}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Ticket Status</InputLabel> <Select value={selectedTicketStatus} onChange={(e) => setSelectedTicketStatus(e.target.value)} label="Ticket Status" disabled={loading}> {ticketStatuses.map(s => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</MenuItem>)} </Select> </FormControl> </Grid>
                    </Grid>
                </Paper>

                {/* KPIs */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Web Sessions" value={kpiData.totalSessions} icon={<WebIcon />} loading={loading} color="primary.main" /></Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Conversion Rate" value={kpiData.conversionRate} formatFunc={v => formatPercent(v, 1)} icon={<ShoppingCartCheckoutIcon />} loading={loading} color="success.main" tooltip="(Purchasing Sessions / Total Sessions) * 100" /></Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Search Success" value={kpiData.searchSuccessRate} formatFunc={v => formatPercent(v, 1)} icon={<SearchIcon />} loading={loading} color="info.main" tooltip="(Successful Searches / Total Searches) * 100"/></Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Recommend. CTR" value={kpiData.recommendationCTR} formatFunc={v => formatPercent(v, 1)} icon={<RecommendIcon />} loading={loading} color="secondary.main" tooltip="(Rec Clicks / Sessions with Views) * 100" /></Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Total Tickets" value={kpiData.totalTickets} icon={<SupportAgentIcon />} loading={loading} color="warning.dark" /></Grid>
                    <Grid item xs={6} sm={4} md={2} lg={1.5}><KpiCard title="Open Tickets" value={kpiData.openTickets} icon={<PendingActionsIcon />} loading={loading} color="warning.main" /></Grid>
                    <Grid item xs={6} sm={6} md={2} lg={1.5}><KpiCard title="Avg. Resolution" value={kpiData.avgResolutionTime} formatFunc={formatMinutes} icon={<TimerIcon />} loading={loading} /></Grid>
                    <Grid item xs={6} sm={6} md={2} lg={1.5}><KpiCard title="Avg. CSAT" value={kpiData.avgCSAT} formatFunc={v => v?.toFixed(1) ?? 'N/A'} icon={kpiData.avgCSAT === null ? <MoodIcon/> : kpiData.avgCSAT >= 4 ? <MoodIcon/> : <MoodBadIcon/>} loading={loading} color={kpiData.avgCSAT === null ? 'text.secondary' : kpiData.avgCSAT >= 4 ? 'success.main' : kpiData.avgCSAT <= 2 ? 'error.main' : 'warning.main'} /></Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6} lg={4}> {/* Web Funnel */}
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Online Journey Funnel</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : funnelData[0].value > 0 ? ( <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} /> <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }}/> <YAxis type="category" dataKey="name" width={90} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/> <Tooltip formatter={(value) => formatNumber(value)} /> <Bar dataKey="value" name="Sessions"> {funnelData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))} </Bar> </BarChart> ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No session data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}> {/* Tickets by Category */}
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Support Tickets by Category</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : ticketsByCategory.length > 0 ? ( <BarChart data={ticketsByCategory.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} /> <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} /> <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/> <Tooltip formatter={(value) => formatNumber(value)} /> <Bar dataKey="value" name="Ticket Count"> {ticketsByCategory.slice(0, 7).map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} /> ))} </Bar> </BarChart> ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No ticket data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                    </Grid>
                     <Grid item xs={12} md={6} lg={4}> {/* CSAT Distribution */}
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>CSAT Score Distribution</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                      {loading ? <Skeleton variant="rectangular" height="100%" /> : csatDistribution.some(d=>d.value > 0) ? ( <BarChart data={csatDistribution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/> <XAxis dataKey="name" fontSize={10} tick={{ fill: theme.palette.text.secondary }}/> <YAxis allowDecimals={false} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/> <Tooltip formatter={(value) => formatNumber(value)} /> <Bar dataKey="value" name="Ticket Count"> {csatDistribution.map((entry, index) => ( <Cell key={`cell-${index}`} fill={CSAT_COLORS[index % CSAT_COLORS.length]} /> ))} </Bar> </BarChart> ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No CSAT data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                    </Grid>
                 </Grid>

                {/* Recent Support Tickets Table */}
                 <Paper elevation={3} sx={{ p: {xs: 1, sm: 2}, overflow: 'hidden', mt: 0 }}> {/* Removed mt */}
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Recent Support Tickets</Typography>
                    <TableContainer sx={{ maxHeight: 500 }}> {/* Adjusted height */}
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {[ { id: 'createdTimestamp', label: 'Created', minWidth: 100 }, { id: 'ticketId', label: 'Ticket ID', minWidth: 120, sortable: false }, { id: 'customerName', label: 'Customer', minWidth: 120 }, { id: 'category', label: 'Category', minWidth: 150 }, { id: 'channel', label: 'Channel', minWidth: 80 }, { id: 'status', label: 'Status', minWidth: 100, align: 'center' }, { id: 'resolutionTimeMinutes', label: 'Resolution Time', minWidth: 100, align: 'right' }, { id: 'csatScore', label: 'CSAT', minWidth: 60, align: 'center' }, ].map((h) => ( <TableCell key={h.id} align={h.align || 'left'} sortDirection={orderBy === h.id ? order : false} sx={{ py: 1, minWidth: h.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold' }}> {h.sortable !== false ? (<TableSortLabel active={orderBy === h.id} direction={orderBy === h.id ? order : 'asc'} onClick={() => handleRequestSort(h.id)}> {h.label} </TableSortLabel>) : h.label } </TableCell> ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? ( <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow> ) : sortedTicketData.length === 0 ? ( <TableRow><TableCell colSpan={8} align="center" sx={{py: 3}}>No tickets match filters.</TableCell></TableRow> ) : (
                                    sortedTicketData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((ticket) => {
                                        const statusStyle = STATUS_MAP[ticket.status] || {};
                                        return (
                                            <TableRow hover key={ticket.ticketId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>{formatDateTime(ticket.createdTimestamp)}</TableCell>
                                                <TableCell>{ticket.ticketId}</TableCell>
                                                <TableCell>{ticket.customerName || 'N/A'}</TableCell>
                                                <TableCell>{ticket.category}</TableCell>
                                                <TableCell>{ticket.channel}</TableCell>
                                                <TableCell align="center"><Chip icon={statusStyle.icon} label={ticket.status} size="small" sx={{ color: statusStyle.color?.(theme), borderColor: statusStyle.color?.(theme)+'90', backgroundColor: statusStyle.color?.(theme)+'15' }} variant="outlined"/></TableCell>
                                                <TableCell align="right">{formatMinutes(ticket.resolutionTimeMinutes)}</TableCell>
                                                <TableCell align="center">{ticket.csatScore || '-'}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                                {sortedTicketData.length > 0 && emptyRows > 0 && (<TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={8} /></TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {sortedTicketData.length > 0 && ( <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={sortedTicketData.length} rowsPerPage={rowsPerPage} page={tablePage} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }} /> )}
                </Paper>

            </Box>
        </LocalizationProvider>
    );
};

export default CustomerExperienceDashboard;