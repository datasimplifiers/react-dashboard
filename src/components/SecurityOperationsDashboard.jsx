// src/components/SecurityOperationsDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Link, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInMinutes, addDays } from 'date-fns';

// MUI Icons
import SecurityIcon from '@mui/icons-material/Security';
import ErrorIcon from '@mui/icons-material/Error'; // High Severity
import WarningIcon from '@mui/icons-material/Warning'; // Medium Severity
import InfoIcon from '@mui/icons-material/Info'; // Low Severity / General Info
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Resolved
import CancelIcon from '@mui/icons-material/Cancel'; // False Positive
import PendingIcon from '@mui/icons-material/Pending'; // Investigating
import FiberNewIcon from '@mui/icons-material/FiberNew'; // New
import TimerIcon from '@mui/icons-material/Timer';
import NoMeetingRoomIcon from '@mui/icons-material/NoMeetingRoom'; // Failed Access
import UpdateIcon from '@mui/icons-material/Update'; // For refresh indication maybe

// Import data generators
import { getMockStores, getMockAlertTypes } from '../utils/mockDataGenerator';
import { generateMockSecurityAlerts } from '../utils/mockSecurityAlertsGenerator';
import { generateMockAccessControlLogs } from '../utils/mockAccessControlLogGenerator';

// --- Constants ---
const COLORS = ['#d32f2f', '#ed6c02', '#ffc107', '#0288d1', '#388e3c', '#607d8b', '#7e57c2', '#d81b60'];
const REFRESH_INTERVAL_MS = 60000; // Refresh data every 60 seconds

// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, HH:mm:ss') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d') : 'Invalid'; } catch { return 'Invalid'; } };
const formatMinutes = (mins) => { if (mins === null || !isFinite(mins)) return 'N/A'; if (mins < 60) return `${Math.round(mins)} min`; const hours = Math.floor(mins / 60); const remMins = Math.round(mins % 60); return `${hours}h ${remMins}m`; };
const formatPercent = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(digits)}%`; };
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };

// --- Kpi Card Component ---
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip }) => (
    <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>{title}</Typography>
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
    </MuiTooltip>
);

// --- Main Component ---
const SecurityOperationsDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertsData, setAlertsData] = useState([]);
    const [accessLogsData, setAccessLogsData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]);
    const [selectedStore, setSelectedStore] = useState('ALL');
    const [selectedAlertType, setSelectedAlertType] = useState('ALL');
    const [selectedSeverity, setSelectedSeverity] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    // Table State
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('desc');
    // Last Refreshed Timestamp
    const [lastRefreshed, setLastRefreshed] = useState(null);


    // --- Dimensions & Maps (using useMemo & theme) ---
    const stores = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Stores' }, ...getMockStores().sort((a, b) => a.storeName.localeCompare(b.storeName))], []);
    const alertTypes = useMemo(() => [{ alertTypeKey: 'ALL', alertDescription: 'All Types' }, ...getMockAlertTypes().sort((a, b) => a.alertDescription.localeCompare(b.alertDescription))], []);
    const severities = useMemo(() => ['ALL', 'High', 'Medium', 'Low'], []);
    const statuses = useMemo(() => ['ALL', 'New', 'Investigating', 'Resolved', 'False Positive'], []);

    const SEVERITY_MAP = useMemo(() => ({
        High: { color: theme.palette.error.main, icon: <ErrorIcon fontSize="inherit" /> },
        Medium: { color: theme.palette.warning.main, icon: <WarningIcon fontSize="inherit" /> },
        Low: { color: theme.palette.info.main, icon: <InfoIcon fontSize="inherit" /> },
        Unknown: { color: theme.palette.grey[500], icon: <InfoIcon fontSize="inherit" /> }
    }), [theme]);

    const STATUS_MAP = useMemo(() => ({
        New: { color: theme.palette.info.dark, icon: <FiberNewIcon fontSize="inherit" /> },
        Investigating: { color: theme.palette.secondary.main, icon: <PendingIcon fontSize="inherit" /> },
        Resolved: { color: theme.palette.success.main, icon: <CheckCircleIcon fontSize="inherit" /> },
        'False Positive': { color: theme.palette.grey[700], icon: <CancelIcon fontSize="inherit" /> }
    }), [theme]);

    // --- Data Fetching Callback ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) {
            console.log(`Refreshing security data at ${new Date().toLocaleTimeString()}...`);
        } else {
            console.log("Initial security data fetch...");
        }
        setError(null);
        setLoading(true); // Show loading indicator on every fetch
        const [start, end] = dateRange;

        if (!isValid(start) || !isValid(end)) {
            setError("Invalid date range.");
            setLoading(false);
            return;
        }

        let isMounted = true;
        try {
            const [alerts, accessLogs] = await Promise.all([
                new Promise(res => setTimeout(() => res(generateMockSecurityAlerts(start, end)), 500)),
                new Promise(res => setTimeout(() => res(generateMockAccessControlLogs(start, end)), 400)),
            ]);

            if (!isMounted) return;

            if (!Array.isArray(alerts) || !Array.isArray(accessLogs)) {
                throw new Error("Data generation failed for alerts or access logs.");
            }
            setAlertsData(alerts);
            setAccessLogsData(accessLogs);
            setLastRefreshed(new Date()); // Update refresh timestamp

        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading security data:", err);
            setError(`Failed to load data: ${err.message}`);
            // Optionally clear old data on error:
            // setAlertsData([]);
            // setAccessLogsData([]);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
        // Cleanup function for component unmount during fetch
        return () => { isMounted = false; };

    }, [dateRange]); // Re-create fetch function only if dateRange changes


    // --- Initial Data Fetch & Refresh Interval ---
    useEffect(() => {
        fetchData(true); // Initial fetch marked as true

        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);

        // Cleanup interval on component unmount or when fetchData changes (due to dateRange change)
        return () => clearInterval(intervalId);
    }, [fetchData]); // Dependency array includes fetchData

    // --- Filtered Data ---
    const filteredAlerts = useMemo(() => {
        return alertsData.filter(alert =>
            (selectedStore === 'ALL' || alert.storeKey === selectedStore) &&
            (selectedAlertType === 'ALL' || alert.alertTypeKey === selectedAlertType) &&
            (selectedSeverity === 'ALL' || alert.severityLevel === selectedSeverity) &&
            (selectedStatus === 'ALL' || alert.status === selectedStatus)
        );
    }, [alertsData, selectedStore, selectedAlertType, selectedSeverity, selectedStatus]);

    const filteredAccessLogs = useMemo(() => {
        return accessLogsData.filter(log =>
            (selectedStore === 'ALL' || log.storeKey === selectedStore)
            // Add more filters for access logs if needed (e.g., zone, outcome)
        );
    }, [accessLogsData, selectedStore]);


    // --- KPIs ---
    const kpiData = useMemo(() => {
        const totalAlerts = filteredAlerts.length;
        const openAlerts = filteredAlerts.filter(a => a.status === 'New' || a.status === 'Investigating').length;
        const resolvedAlerts = filteredAlerts.filter(a => a.status === 'Resolved');
        const totalResolutionTime = resolvedAlerts.reduce((sum, a) => sum + (a.resolutionTimeMinutes || 0), 0);
        const avgResolutionTime = resolvedAlerts.length > 0 ? totalResolutionTime / resolvedAlerts.length : null;
        const falsePositiveCount = filteredAlerts.filter(a => a.status === 'False Positive').length;
        const falsePositiveRate = totalAlerts > 0 ? (falsePositiveCount / totalAlerts) * 100 : 0;
        const highSeverityCount = filteredAlerts.filter(a => a.severityLevel === 'High').length;
        const failedAccessCount = filteredAccessLogs.filter(log => !log.accessGranted).length;

        return {
            totalAlerts,
            highSeverityCount,
            openAlerts,
            avgResolutionTime,
            falsePositiveRate,
            failedAccessCount
        };
    }, [filteredAlerts, filteredAccessLogs]);

    // --- Chart Data ---
    const alertsByDate = useMemo(() => {
        const grouped = filteredAlerts.reduce((acc, alert) => {
            const date = alert.dateKey || format(parseISO(alert.timestamp), 'yyyy-MM-dd');
            if (!acc[date]) acc[date] = { date, High: 0, Medium: 0, Low: 0 };
            const severity = alert.severityLevel || 'Low';
            if (acc[date][severity] !== undefined) acc[date][severity]++;
            else acc[date]['Low']++; // Default to Low if severity is somehow missing
            return acc;
        }, {});
        // Ensure dates are parsed correctly for sorting
        return Object.values(grouped).sort((a, b) => {
            try { return parseISO(a.date) - parseISO(b.date); } catch { return 0; }
        }).map(d => ({ ...d, displayDate: formatDate(d.date) }));
    }, [filteredAlerts]);

    const alertsByType = useMemo(() => {
        const grouped = filteredAlerts.reduce((acc, alert) => {
            const desc = alert.alertDescription || 'Unknown Type';
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 7); // Limit to top 7 types for clarity
    }, [filteredAlerts]);

    const alertsBySeverity = useMemo(() => {
        const grouped = filteredAlerts.reduce((acc, alert) => {
            const severity = alert.severityLevel || 'Low';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => { // Custom sort to put High first, then Medium, then Low
                 const order = { 'High': 1, 'Medium': 2, 'Low': 3 };
                 return (order[a.name] || 99) - (order[b.name] || 99);
            });
    }, [filteredAlerts]);

    const failedAccessByZone = useMemo(() => {
        const grouped = filteredAccessLogs
            .filter(log => !log.accessGranted)
            .reduce((acc, log) => {
                const zone = log.zoneName || 'Unknown Zone';
                acc[zone] = (acc[zone] || 0) + 1;
                return acc;
            }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 7); // Limit to top 7 zones
    }, [filteredAccessLogs]);


    // --- Table Logic ---
    const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const stableSort = useCallback((array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1]; // Stable sort using original index
        });
        return stabilizedThis.map((el) => el[0]);
    }, []);

    const descendingComparator = useCallback((a, b, orderByField) => {
        let valA = a[orderByField];
        let valB = b[orderByField];

        // Handle nulls/undefined: sort them to the end
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1; // a is null/undefined, sort b first
        if (valB == null) return -1; // b is null/undefined, sort a first

        // Attempt date comparison for timestamp fields
        if (orderByField === 'timestamp' || orderByField === 'resolvedTimestamp') {
            try {
                valA = parseISO(valA);
                valB = parseISO(valB);
            } catch (e) { /* Ignore parse errors, fallback to default comparison */ }
        }

        // Case-insensitive string comparison
        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        // Standard comparison
        if (valB < valA) return -1;
        if (valB > valA) return 1;
        return 0;
    }, []);

    const getComparator = useCallback((currentOrder, currentOrderBy) => {
        return currentOrder === 'desc'
            ? (a, b) => descendingComparator(a, b, currentOrderBy)
            : (a, b) => -descendingComparator(a, b, currentOrderBy);
    }, [descendingComparator]);

    const sortedAlertData = useMemo(() => stableSort(filteredAlerts, getComparator(order, orderBy)),
        [filteredAlerts, order, orderBy, stableSort, getComparator]);

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setTablePage(0);
    };

    const emptyRows = useMemo(() => {
        const count = sortedAlertData.length;
        return count > 0 ? Math.max(0, rowsPerPage - (count - tablePage * rowsPerPage)) : 0;
    }, [sortedAlertData.length, tablePage, rowsPerPage]); // Use length directly


    // --- Render Logic ---
    const chartPaperHeight = '350px'; // Consistent height for chart containers
    const isLoadingOrNoData = loading || filteredAlerts.length === 0; // Helper for conditional rendering

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                     <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Security Operations Center
                    </Typography>
                     <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {loading && <CircularProgress size={16} />}
                        {lastRefreshed && (
                            <MuiTooltip title={`Last refreshed: ${format(lastRefreshed, 'HH:mm:ss')}`}>
                                <Typography variant="caption" color="text.secondary">
                                    <UpdateIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} />
                                     {format(lastRefreshed, 'HH:mm')}
                                 </Typography>
                             </MuiTooltip>
                         )}
                     </Box>
                </Box>


                {/* Filters */}
                <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Store</InputLabel> <Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} label="Store"> {stores.map(s => <MenuItem key={s.storeKey} value={s.storeKey}>{s.storeName}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={12} sm={6} md={3}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Alert Type</InputLabel> <Select value={selectedAlertType} onChange={(e) => setSelectedAlertType(e.target.value)} label="Alert Type"> {alertTypes.map(t => <MenuItem key={t.alertTypeKey} value={t.alertTypeKey}>{t.alertDescription}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={6} sm={3} md={1.5}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Severity</InputLabel> <Select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} label="Severity"> {severities.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={6} sm={3} md={1.5}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Status</InputLabel> <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Status"> {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)} </Select> </FormControl> </Grid>
                        <Grid item xs={12} md={3}> <DateRangePicker localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} /> </Grid>
                    </Grid>
                </Paper>

                 {/* Error Display */}
                {error && !loading && ( <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert> )}

                {/* KPIs */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Alerts" value={kpiData.totalAlerts} icon={<SecurityIcon />} loading={loading} color="primary.main" tooltip="Total alerts matching filters" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="High Severity" value={kpiData.highSeverityCount} icon={<ErrorIcon />} loading={loading} color="error.main" tooltip="Count of 'High' severity alerts" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Open Alerts" value={kpiData.openAlerts} icon={<PendingIcon />} loading={loading} color="warning.dark" tooltip="Alerts currently 'New' or 'Investigating'" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Failed Access" value={kpiData.failedAccessCount} icon={<NoMeetingRoomIcon />} loading={loading} color="secondary.dark" tooltip="Denied access attempts to restricted zones" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg Resolution" value={kpiData.avgResolutionTime} formatFunc={formatMinutes} icon={<TimerIcon />} loading={loading} tooltip="Average time for 'Resolved' alerts" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="False Positive %" value={kpiData.falsePositiveRate} formatFunc={v => formatPercent(v, 1)} icon={<CancelIcon />} loading={loading} tooltip="Percentage of alerts marked 'False Positive'" /></Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Alert Trend */}
                    <Grid item xs={12} md={6} lg={7}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Alert Trend by Severity</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : alertsByDate.length > 0 ? (
                                        <BarChart data={alertsByDate} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis allowDecimals={false} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatNumber(value)} labelFormatter={(label) => label} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                            <Bar dataKey="High" stackId="a" fill={SEVERITY_MAP['High']?.color} name="High" />
                                            <Bar dataKey="Medium" stackId="a" fill={SEVERITY_MAP['Medium']?.color} name="Medium" />
                                            <Bar dataKey="Low" stackId="a" fill={SEVERITY_MAP['Low']?.color} name="Low" />
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No alert trend data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                    {/* Alert Severity Distribution */}
                    <Grid item xs={12} sm={6} md={6} lg={5}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Alerts by Severity</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : alertsBySeverity.length > 0 ? (
                                        <PieChart>
                                            <Pie data={alertsBySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name}: ${formatPercent(percent * 100, 0)}`} >
                                                {alertsBySeverity.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={SEVERITY_MAP[entry.name]?.color || theme.palette.grey[500]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [`${formatNumber(value)} alerts`, name]} />
                                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                                        </PieChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No severity data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                    {/* Alerts by Type */}
                     <Grid item xs={12} sm={6} md={6} lg={7}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Top Alert Types</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : alertsByType.length > 0 ? (
                                        <BarChart layout="vertical" data={alertsByType} margin={{ top: 5, right: 20, left: 150, bottom: 5 }}> {/* Increased left margin */}
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                            <YAxis dataKey="name" type="category" width={150} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatNumber(value)} />
                                            <Bar dataKey="value" name="Alert Count" >
                                                {alertsByType.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No alert type data.</Typography></Box> )}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                     {/* Failed Access Attempts by Zone */}
                     <Grid item xs={12} sm={6} md={6} lg={5}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Failed Access by Zone</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : failedAccessByZone.length > 0 ? (
                                        <BarChart layout="vertical" data={failedAccessByZone} margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" fontSize={10}/>
                                            <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={10}/>
                                            <Tooltip formatter={(value) => `${formatNumber(value)} attempts`} />
                                            <Bar dataKey="value" name="Failed Attempts" fill={theme.palette.secondary.dark}>
                                                 {failedAccessByZone.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />))} {/* Offset colors */}
                                            </Bar>
                                        </BarChart>
                                     ) : <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><Typography color="textSecondary">No failed access data.</Typography></Box>}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>
                </Grid>

                {/* Alert Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Alert Details</Typography>
                    <TableContainer sx={{ maxHeight: 600 }}> {/* Set max height for scroll */}
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {[
                                        { id: 'timestamp', label: 'Timestamp', minWidth: 130 },
                                        { id: 'storeName', label: 'Store', minWidth: 150 },
                                        { id: 'cameraLocation', label: 'Location', minWidth: 120 },
                                        { id: 'alertDescription', label: 'Alert Type', minWidth: 170 },
                                        { id: 'severityLevel', label: 'Severity', minWidth: 80, align: 'center' },
                                        { id: 'status', label: 'Status', minWidth: 100, align: 'center' },
                                        { id: 'confidenceScore', label: 'Confidence', minWidth: 80, align: 'right', format: (v) => v ? formatPercent(v * 100, 0) : '-' },
                                        { id: 'resolutionTimeMinutes', label: 'Resolution Time', minWidth: 100, align: 'right', format: formatMinutes },
                                    ].map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.align || 'left'}
                                            sortDirection={orderBy === headCell.id ? order : false}
                                            sx={{ py: 1, minWidth: headCell.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold' }}
                                        >
                                            <TableSortLabel
                                                active={orderBy === headCell.id}
                                                direction={orderBy === headCell.id ? order : 'asc'}
                                                onClick={() => handleRequestSort(headCell.id)}
                                            >
                                                {headCell.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                     // Skeleton rows during load
                                     Array.from(new Array(rowsPerPage)).map((_, index) => (
                                         <TableRow key={`skel-${index}`}>
                                             <TableCell colSpan={8}><Skeleton animation="wave" /></TableCell>
                                         </TableRow>
                                     ))
                                ) : sortedAlertData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            No alert data matches the current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedAlertData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((alert) => {
                                        const severityStyle = SEVERITY_MAP[alert.severityLevel] || SEVERITY_MAP['Unknown'];
                                        const statusStyle = STATUS_MAP[alert.status] || {};
                                        return (
                                            <TableRow hover key={alert.alertId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{fontSize: '0.8rem'}}>{formatDateTime(alert.timestamp)}</TableCell>
                                                <TableCell sx={{fontSize: '0.8rem'}}>{alert.storeName}</TableCell>
                                                <TableCell sx={{fontSize: '0.8rem'}}>{alert.cameraLocation}</TableCell>
                                                <TableCell sx={{fontSize: '0.8rem'}}>{alert.alertDescription}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={severityStyle.icon}
                                                        label={alert.severityLevel}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.7rem', color: severityStyle.color, borderColor: severityStyle.color + '90', backgroundColor: severityStyle.color + '15' }}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={statusStyle.icon}
                                                        label={alert.status}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.7rem', color: statusStyle.color, borderColor: statusStyle.color + '90', backgroundColor: statusStyle.color + '15' }}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{fontSize: '0.8rem'}} align="right">{alert.confidenceScore ? formatPercent(alert.confidenceScore * 100, 0) : '-'}</TableCell>
                                                <TableCell sx={{fontSize: '0.8rem'}} align="right">{formatMinutes(alert.resolutionTimeMinutes)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                                {/* Empty rows for consistent table height */}
                                {!loading && sortedAlertData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 33 * emptyRows }}>
                                        <TableCell colSpan={8} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* Pagination - only show if there's data */}
                    {sortedAlertData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={sortedAlertData.length}
                            rowsPerPage={rowsPerPage}
                            page={tablePage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }}
                        />
                    )}
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default SecurityOperationsDashboard;