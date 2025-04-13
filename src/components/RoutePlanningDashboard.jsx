// src/components/RoutePlanningDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, List, ListItem, ListItemText
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

// MUI Icons
import AltRouteIcon from '@mui/icons-material/AltRoute'; // Route Planning
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Vehicle/Shipment
import TimerIcon from '@mui/icons-material/Timer'; // Duration
import SpeedIcon from '@mui/icons-material/Speed'; // Distance/Speed
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'; // Fuel
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // On-Time
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Delay/Issue
import PersonIcon from '@mui/icons-material/Person'; // Driver
import WarehouseIcon from '@mui/icons-material/Warehouse'; // DC (Source)
import StorefrontIcon from '@mui/icons-material/Storefront'; // Store (Destination)
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


// Import data generators and common functions
import { generateMockRouteData, getMockDistributionCenters, getMockVehicles, getMockDrivers } from '../utils/mockRoutePlanningGenerator';
import { getMockStores } from '../utils/mockDataGenerator';

// --- Constants ---
const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#ef5350', '#ab47bc', '#7e57c2', '#03a9f4', '#8bc34a'];
const POSITIVE_COLOR = '#4caf50'; // Green for good variance/on-time
const NEGATIVE_COLOR = '#ef5350'; // Red for bad variance/late
const REFRESH_INTERVAL_MS = 180000; // Refresh every 3 minutes

// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid'; } catch { return 'Invalid'; } };
const formatNumber = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); };
const formatCurrency = (value, digits = 2) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`; };
const formatDuration = (minutes) => { if (minutes === null || minutes === undefined || !isFinite(minutes)) return 'N/A'; const mins = Math.round(minutes); const h = Math.floor(mins / 60); const m = mins % 60; return `${h}h ${m}m`; };
const formatDurationVariance = (minutes) => { if (minutes === null || minutes === undefined || !isFinite(minutes)) return 'N/A'; const symbol = minutes > 0 ? '+' : ''; return `${symbol}${formatDuration(minutes)}`; };
const formatDistance = (km) => { if (km === null || km === undefined || !isFinite(km)) return 'N/A'; return `${formatNumber(km, 1)} km`; };
const formatFuel = (liters) => { if (liters === null || liters === undefined || !isFinite(liters)) return 'N/A'; return `${formatNumber(liters, 1)} L`; };
const formatFuelEfficiency = (kmPerLiter) => { if (kmPerLiter === null || kmPerLiter === undefined || !isFinite(kmPerLiter)) return 'N/A'; return `${formatNumber(kmPerLiter, 1)} km/L`; };
const formatPercentage = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${(value * 100).toFixed(1)}%`; };

// --- Kpi Card Component --- (Assuming similar)
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip, changeValue, changeFormatFunc = formatPercentage }) => (
    <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography sx={{ fontSize: 14, mb: 0.5 }} color="text.secondary" gutterBottom>{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mb: (changeValue !== undefined ? 0.5 : 0) }}>
                    {loading ? (<Skeleton variant="text" width="80%" height={30} />) : (
                        <>
                            {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || color, lineHeight: 1.2 }}>
                                {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}
                            </Typography>
                        </>
                    )}
                </Box>
                 {/* Optional Change Indicator */}
                 {!loading && changeValue !== undefined && (
                    <Typography variant="caption" color={changeValue >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR} sx={{ alignSelf: 'flex-end' }}>
                        {changeValue >= 0 ? '+' : ''}{changeFormatFunc(changeValue)} vs Prev.
                    </Typography>
                 )}
            </CardContent>
        </Card>
    </MuiTooltip>
);

// --- Main Component ---
const RoutePlanningDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [routeData, setRouteData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 13)), endOfDay(new Date())]); // Default 14 days
    const [selectedSource, setSelectedSource] = useState('ALL');
    const [selectedDestination, setSelectedDestination] = useState('ALL');
    const [selectedVehicle, setSelectedVehicle] = useState('ALL');
    const [selectedDriver, setSelectedDriver] = useState('ALL');
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Fewer rows initially
    const [orderBy, setOrderBy] = useState('actualDepartureTimestamp');
    const [order, setOrder] = useState('desc');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const sources = useMemo(() => [{ dcKey: 'ALL', dcName: 'All Sources' }, ...getMockDistributionCenters()], []);
    const destinations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Destinations' }, ...getMockStores()], []);
    const vehicles = useMemo(() => [{ vehicleKey: 'ALL', vehicleId: 'All Vehicles' }, ...getMockVehicles()], []);
    const drivers = useMemo(() => [{ driverKey: 'ALL', driverName: 'All Drivers' }, ...getMockDrivers()], []);

    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing route data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial route data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }

        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 950)); // Simulate API delay
            const data = generateMockRouteData(start, end);

            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock data generation failed.");

            setRouteData(data);
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading route data:", err);
            setError(`Failed to load data: ${err.message}`);
            setRouteData([]);
        } finally {
            if (isMounted) setLoading(false);
        }
        return () => { isMounted = false; };
    }, [dateRange]);

    useEffect(() => {
        fetchData(true);
        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // --- Filtered Data ---
    const filteredData = useMemo(() => {
        return routeData.filter(trip =>
            (selectedSource === 'ALL' || trip.sourceLocationKey === selectedSource) &&
            (selectedDestination === 'ALL' || trip.destinationLocationKey === selectedDestination) &&
            (selectedVehicle === 'ALL' || trip.vehicleKey === selectedVehicle) &&
            (selectedDriver === 'ALL' || trip.driverKey === selectedDriver)
        );
    }, [routeData, selectedSource, selectedDestination, selectedVehicle, selectedDriver]);

    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { totalTrips: 0, otdRate: 0, avgDelayLate: 0, totalDistance: 0, totalFuel: 0, avgFuelEfficiency: 0, avgDurationVariance: 0, totalFuelCost: 0 };
        }

        let totalTrips = 0;
        let onTimeCount = 0;
        let totalDelayLate = 0;
        let lateCount = 0;
        let totalDistance = 0;
        let totalFuel = 0;
        let totalDurationVariance = 0;
        let totalFuelCost = 0;

        filteredData.forEach(d => {
            totalTrips++;
            if (d.deliveryStatus === 'On-Time') {
                onTimeCount++;
            } else if (d.deliveryStatus === 'Late') {
                totalDelayLate += d.delayMinutes || 0;
                lateCount++;
            }
            totalDistance += d.actualDistanceKm || 0;
            totalFuel += d.fuelConsumedLiters || 0;
            totalDurationVariance += d.durationVarianceMinutes || 0;
             totalFuelCost += d.fuelCost || 0;
        });

        const otdRate = totalTrips > 0 ? onTimeCount / totalTrips : 0;
        const avgDelayLate = lateCount > 0 ? totalDelayLate / lateCount : 0;
        const avgFuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
        const avgDurationVariance = totalTrips > 0 ? totalDurationVariance / totalTrips : 0;

        return {
            totalTrips: totalTrips,
            otdRate: isFinite(otdRate) ? otdRate : 0,
            avgDelayLate: isFinite(avgDelayLate) ? avgDelayLate : 0, // Avg delay only for late trips
            totalDistance: isFinite(totalDistance) ? totalDistance : 0,
            totalFuel: isFinite(totalFuel) ? totalFuel : 0,
            avgFuelEfficiency: isFinite(avgFuelEfficiency) ? avgFuelEfficiency : 0,
            avgDurationVariance: isFinite(avgDurationVariance) ? avgDurationVariance : 0, // Positive means longer than planned
            totalFuelCost: isFinite(totalFuelCost) ? totalFuelCost : 0,
        };
    }, [filteredData]);

    // --- Chart Data Aggregations ---

    // OTD Trend
    const otdTrendData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const groupedByDate = filteredData.reduce((acc, d) => {
            const dateKey = d.dateKey;
            if (!dateKey) return acc;
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, total: 0, onTime: 0 };
            }
            acc[dateKey].total++;
            if (d.deliveryStatus === 'On-Time') {
                acc[dateKey].onTime++;
            }
            return acc;
        }, {});

        return Object.values(groupedByDate)
            .map(d => ({
                date: d.date,
                otdRate: d.total > 0 ? parseFloat((d.onTime / d.total).toFixed(3)) : 0,
                displayDate: formatDate(d.date)
            }))
            .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    }, [filteredData]);

     // Duration Variance Trend (Average per day)
     const durationVarianceTrendData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const groupedByDate = filteredData.reduce((acc, d) => {
            const dateKey = d.dateKey;
            if (!dateKey) return acc;
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, totalVariance: 0, count: 0 };
            }
            acc[dateKey].totalVariance += d.durationVarianceMinutes || 0;
            acc[dateKey].count++;
            return acc;
        }, {});

        return Object.values(groupedByDate)
            .map(d => ({
                date: d.date,
                avgVariance: d.count > 0 ? parseFloat((d.totalVariance / d.count).toFixed(1)) : 0,
                displayDate: formatDate(d.date)
            }))
            .sort((a, b) => parseISO(a.date) - parseISO(b.date));
     }, [filteredData]);


    // Fuel Efficiency by Vehicle Type
    const fuelEfficiencyByVehicleTypeData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.vehicleType || 'Unknown';
            if (!acc[key]) {
                acc[key] = { totalDist: 0, totalFuel: 0, count: 0 };
            }
            acc[key].totalDist += d.actualDistanceKm || 0;
            acc[key].totalFuel += d.fuelConsumedLiters || 0;
            acc[key].count++;
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([name, data]) => ({
                name,
                avgKmPerLiter: (data.totalFuel > 0) ? parseFloat((data.totalDist / data.totalFuel).toFixed(1)) : 0
            }))
            .filter(d => d.avgKmPerLiter > 0)
            .sort((a, b) => b.avgKmPerLiter - a.avgKmPerLiter); // Highest efficiency first
    }, [filteredData]);

    // Delivery Status Distribution
    const deliveryStatusCountsData = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
         const counts = filteredData.reduce((acc, d) => {
             const status = d.deliveryStatus || 'Unknown';
             acc[status] = (acc[status] || 0) + 1;
             return acc;
         }, {});
         const total = filteredData.length;
         return Object.entries(counts)
            .map(([name, value]) => ({ name, value, percentage: total > 0 ? value/total : 0 }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);


     // Performance Scatter (Duration Variance vs Distance) - Sampled for performance
    const performanceScatterData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const sampleSize = 500;
        const dataToSample = filteredData.filter(d =>
             d.actualDistanceKm != null && isFinite(d.actualDistanceKm) &&
             d.durationVarianceMinutes != null && isFinite(d.durationVarianceMinutes)
        );
        if (dataToSample.length === 0) return [];

        const step = Math.max(1, Math.floor(dataToSample.length / sampleSize));
        return dataToSample
                .filter((_, index) => index % step === 0)
                .map(d => ({
                    distance: d.actualDistanceKm,
                    variance: d.durationVarianceMinutes,
                    driver: d.driverName,
                    vehicle: d.vehicleType,
                    route: `${d.sourceName} -> ${d.destinationName}`
                }));
    }, [filteredData]);



    // --- Table Logic --- (Similar to previous dashboards)
    const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const descendingComparator = useCallback((a, b, orderByField) => {
        let valA = a[orderByField]; let valB = b[orderByField];
        if (valA == null && valB == null) return 0; if (valA == null) return 1; if (valB == null) return -1;
        // Special handling for dates
        if (orderByField.includes('Timestamp')) { try { valA = parseISO(valA); valB = parseISO(valB); } catch(e){} }
        if (typeof valA === 'string' && typeof valB === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valB < valA) return -1; if (valB > valA) return 1; return 0;
    }, []);

     const getComparator = useCallback((currentOrder, currentOrderBy) => {
        return currentOrder === 'desc'
            ? (a, b) => descendingComparator(a, b, currentOrderBy)
            : (a, b) => -descendingComparator(a, b, currentOrderBy);
    }, [descendingComparator]);

     const stableSort = useCallback((array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }, []);


    const sortedData = useMemo(() => stableSort(filteredData, getComparator(order, orderBy)),
        [filteredData, order, orderBy, stableSort, getComparator]);

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };

    const currentTableData = useMemo(() => sortedData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage), [sortedData, tablePage, rowsPerPage]);
    const emptyRows = useMemo(() => Math.max(0, rowsPerPage - currentTableData.length), [currentTableData.length, rowsPerPage]);

    // --- Filter Reset ---
    const handleClearFilters = () => {
        setSelectedSource('ALL');
        setSelectedDestination('ALL');
        setSelectedVehicle('ALL');
        setSelectedDriver('ALL');
    };

    // --- Render Logic ---
    const chartPaperHeight = '380px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Optimal Route Planning
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
                        {/* Source Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Source (DC)</InputLabel>
                                <Select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} label="Source (DC)" disabled={loading}>
                                    {sources.map(dc => <MenuItem key={dc.dcKey} value={dc.dcKey}>{dc.dcName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Destination Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Destination</InputLabel>
                                <Select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)} label="Destination" disabled={loading}>
                                    {destinations.map(store => <MenuItem key={store.storeKey} value={store.storeKey}>{store.storeName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Vehicle Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Vehicle</InputLabel>
                                <Select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} label="Vehicle" disabled={loading}>
                                    {vehicles.map(v => <MenuItem key={v.vehicleKey} value={v.vehicleKey}>{v.vehicleId}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Driver Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Driver</InputLabel>
                                <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} label="Driver" disabled={loading}>
                                    {drivers.map(d => <MenuItem key={d.driverKey} value={d.driverKey}>{d.driverName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Date Range Filter */}
                         <Grid item xs={12} sm={9} md={3}>
                             <DateRangePicker
                                localeText={{ start: "Start Date", end: "End Date" }}
                                value={dateRange}
                                onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }}
                                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
                                disabled={loading}
                            />
                        </Grid>
                         {/* Clear Filters Button */}
                         <Grid item xs={12} sm={3} md={1} sx={{ textAlign: 'right' }}>
                             <Button
                                 variant="outlined"
                                 size="small"
                                 onClick={handleClearFilters}
                                 startIcon={<FilterListOffIcon />}
                                 disabled={loading || (selectedSource === 'ALL' && selectedDestination === 'ALL' && selectedVehicle === 'ALL' && selectedDriver === 'ALL')}
                                 sx={{ height: '40px' }}
                             >
                                 Clear
                             </Button>
                         </Grid>
                    </Grid>
                </Paper>

                {/* Error Display */}
                {error && !loading && ( <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert> )}

                {/* KPIs */}
                 <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total Trips" value={kpiData.totalTrips} formatFunc={(v)=>formatNumber(v,0)} icon={<AltRouteIcon />} loading={loading} color="primary.main" tooltip="Total number of delivery trips" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="OTD Rate" value={kpiData.otdRate} formatFunc={formatPercentage} icon={<CheckCircleOutlineIcon />} loading={loading} color={POSITIVE_COLOR} tooltip="On-Time Delivery Percentage" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg Delay (Late)" value={kpiData.avgDelayLate} formatFunc={formatDuration} icon={<ErrorOutlineIcon />} loading={loading} color={NEGATIVE_COLOR} tooltip="Average delay for trips that arrived late" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg Duration Var." value={kpiData.avgDurationVariance} formatFunc={formatDurationVariance} icon={<TimerIcon />} loading={loading} color={kpiData.avgDurationVariance > 5 ? NEGATIVE_COLOR : (kpiData.avgDurationVariance < -5 ? POSITIVE_COLOR : 'text.secondary')} tooltip="Average difference: Actual vs Planned duration (+ means longer)" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total Distance" value={kpiData.totalDistance} formatFunc={formatDistance} icon={<SpeedIcon />} loading={loading} color="info.main" tooltip="Total actual distance covered" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total Fuel Cost" value={kpiData.totalFuelCost} formatFunc={formatCurrency} icon={<AttachMoneyIcon />} loading={loading} color="success.dark" tooltip="Estimated total cost of fuel consumed" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total Fuel Used" value={kpiData.totalFuel} formatFunc={formatFuel} icon={<LocalGasStationIcon />} loading={loading} color="warning.dark" tooltip="Total fuel consumed in Liters" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg Fuel Eff." value={kpiData.avgFuelEfficiency} formatFunc={formatFuelEfficiency} icon={<LocalGasStationIcon />} loading={loading} color="secondary.main" tooltip="Average distance covered per Liter of fuel (Km/L)" /></Grid>
                 </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* OTD Trend */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>On-Time Delivery Trend</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : otdTrendData.length > 0 ? (
                                        <LineChart data={otdTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis domain={[0, 1]} tickFormatter={formatPercentage} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                            <Tooltip formatter={(value) => [formatPercentage(value), "OTD Rate"]}/>
                                            <Line type="monotone" dataKey="otdRate" name="OTD Rate" stroke={POSITIVE_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No OTD data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                    {/* Duration Variance Trend */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Daily Duration Variance (Actual - Planned)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : durationVarianceTrendData.length > 0 ? (
                                         <LineChart data={durationVarianceTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} unit="m" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} />
                                             <Tooltip formatter={(value) => [formatDurationVariance(value), "Avg Variance"]}/>
                                             <Line type="monotone" dataKey="avgVariance" name="Avg Variance" stroke={theme.palette.warning.main} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                              <Line type="monotone" dataKey="zero" stroke={theme.palette.text.disabled} strokeDasharray="5 5" dot={false} /> {/* Reference Line at 0 */}
                                         </LineChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No variance data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                    {/* Delivery Status Distribution */}
                     <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Delivery Status</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : deliveryStatusCountsData.length > 0 ? (
                                        <PieChart>
                                            <Pie data={deliveryStatusCountsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}>
                                                 {deliveryStatusCountsData.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={entry.name === 'On-Time' ? POSITIVE_COLOR : (entry.name === 'Late' ? NEGATIVE_COLOR : COLORS[index % COLORS.length])} />
                                                 ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${formatNumber(value, 0)} trips (${formatPercentage(props.payload.percentage)})`, name]} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: '10px' }} />
                                        </PieChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No status data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                     {/* Fuel Efficiency by Vehicle Type */}
                    <Grid item xs={12} md={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Fuel Efficiency (km/L)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : fuelEfficiencyByVehicleTypeData.length > 0 ? (
                                        <BarChart data={fuelEfficiencyByVehicleTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} unit=" km/L"/>
                                            <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatFuelEfficiency(value)}/>
                                            <Bar dataKey="avgKmPerLiter" name="Avg km/L" >
                                                 {fuelEfficiencyByVehicleTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No efficiency data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>

                      {/* Performance Scatter */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Duration Variance vs. Distance</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : performanceScatterData.length > 0 ? (
                                        <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 5, }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis type="number" dataKey="distance" name="Distance" unit="km" label={{ value: "Distance (km)", position: "insideBottom", offset: -15, fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatNumber(v,0)} />
                                            <YAxis type="number" dataKey="variance" name="Duration Variance" unit="m" label={{ value: "Var (m)", angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                                                if(name === 'Distance') return formatDistance(value);
                                                if(name === 'Duration Variance') return formatDurationVariance(value);
                                                return `${value} (${props.payload.route})`; // Add route info to tooltip
                                            }}/>
                                             <Scatter name="Trip" data={performanceScatterData} fill={theme.palette.primary.light} shape="circle" opacity={0.6} />
                                        </ScatterChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No performance data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Trip Log Details</Typography>
                     <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                     {[
                                        { id: 'actualDepartureTimestamp', label: 'Actual Depart', minWidth: 100 },
                                        { id: 'sourceName', label: 'Source', minWidth: 100 },
                                        { id: 'destinationName', label: 'Destination', minWidth: 120 },
                                        { id: 'driverName', label: 'Driver', minWidth: 90 },
                                        { id: 'vehicleId', label: 'Vehicle', minWidth: 80 },
                                        { id: 'deliveryStatus', label: 'Status', minWidth: 70 },
                                        { id: 'plannedDurationMinutes', label: 'Plan Dur.', minWidth: 60, align: 'right' },
                                        { id: 'actualDurationMinutes', label: 'Actual Dur.', minWidth: 60, align: 'right' },
                                        { id: 'durationVarianceMinutes', label: 'Var.', minWidth: 50, align: 'right' },
                                        { id: 'actualDistanceKm', label: 'Dist. (km)', minWidth: 60, align: 'right' },
                                        { id: 'fuelConsumedLiters', label: 'Fuel (L)', minWidth: 60, align: 'right' },
                                        { id: 'fuelCost', label: 'Fuel Cost', minWidth: 70, align: 'right' },
                                        { id: 'actualArrivalTimestamp', label: 'Actual Arrival', minWidth: 100 },
                                        { id: 'plannedArrivalTimestamp', label: 'Planned Arrival', minWidth: 100 },
                                     ].map((headCell) => (
                                        <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={orderBy === headCell.id ? order : false} sx={{ py: 0.8, minWidth: headCell.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>
                                                {headCell.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                             <TableBody>
                                {loading ? (
                                     Array.from(new Array(rowsPerPage)).map((_, index) => (
                                         <TableRow key={`skel-${index}`}><TableCell colSpan={14}><Skeleton animation="wave" /></TableCell></TableRow>
                                     ))
                                ) : sortedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={14} align="center" sx={{ py: 3 }}>No trip data matches filters.</TableCell></TableRow>
                                ) : (
                                    currentTableData.map((row) => (
                                        <TableRow hover key={row.tripId} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { fontSize: '0.75rem', py: 0.4 } }}>
                                            <TableCell>{formatDateTime(row.actualDepartureTimestamp)}</TableCell>
                                            <TableCell>{row.sourceName}</TableCell>
                                            <TableCell>{row.destinationName}</TableCell>
                                            <TableCell>{row.driverName}</TableCell>
                                            <TableCell>{row.vehicleId}</TableCell>
                                            <TableCell>
                                                 <Chip label={row.deliveryStatus} size="small" color={row.deliveryStatus === 'On-Time' ? 'success' : 'error'} variant="outlined" sx={{fontSize: '0.7rem', height: '20px'}}/>
                                            </TableCell>
                                            <TableCell align="right">{formatDuration(row.plannedDurationMinutes)}</TableCell>
                                            <TableCell align="right">{formatDuration(row.actualDurationMinutes)}</TableCell>
                                            <TableCell align="right" sx={{ color: row.durationVarianceMinutes > 5 ? NEGATIVE_COLOR : 'inherit' }}>
                                                {formatDurationVariance(row.durationVarianceMinutes)}
                                            </TableCell>
                                            <TableCell align="right">{formatDistance(row.actualDistanceKm)}</TableCell>
                                            <TableCell align="right">{formatFuel(row.fuelConsumedLiters)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.fuelCost, 2)}</TableCell>
                                            <TableCell>{formatDateTime(row.actualArrivalTimestamp)}</TableCell>
                                            <TableCell>{formatDateTime(row.plannedArrivalTimestamp)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Empty rows */}
                                {!loading && sortedData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 29 * emptyRows }}><TableCell colSpan={14} /></TableRow> // Adjust height based on row padding
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     {/* Pagination */}
                    {!loading && sortedData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={sortedData.length}
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

export default RoutePlanningDashboard;