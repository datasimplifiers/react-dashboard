// src/components/EnergyManagementDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Autocomplete, TextField
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInDays, getHours, eachDayOfInterval } from 'date-fns';

// MUI Icons
import BoltIcon from '@mui/icons-material/Bolt'; // Energy
import ThermostatIcon from '@mui/icons-material/Thermostat'; // Temperature
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import DevicesIcon from '@mui/icons-material/Devices'; // Device Type
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Area
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import UpdateIcon from '@mui/icons-material/Update';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Cost
import InfoIcon from '@mui/icons-material/Info';
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Weather conditions
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain'; // Rainy
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';


// Import data generator
import { generateMockEnergyConsumption } from '../utils/mockEnergyConsumptionGenerator';
import { getMockStores } from '../utils/mockDataGenerator'; // To get store list for filtering

// --- Constants ---
const COLORS = ['#1976d2', '#ef5350', '#ff9800', '#4caf50', '#ab47bc', '#7e57c2', '#03a9f4', '#8bc34a'];
const REFRESH_INTERVAL_MS = 120000; // Refresh every 2 minutes (adjust as needed)

// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d') : 'Invalid'; } catch { return 'Invalid'; } };
const formatNumber = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); };
const formatCurrency = (value, digits = 2) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`; };
const formatTemperature = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(1)}°C`; };
const formatKWh = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${formatNumber(value, digits)} kWh`; };
const formatKW = (value, digits = 2) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${formatNumber(value, digits)} kW`; }; // For power (rate)

// --- Kpi Card Component (Corrected rendering logic) ---
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
                                {/* Check for null/undefined AND finite for numbers */}
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
const EnergyManagementDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consumptionData, setConsumptionData] = useState([]); // Raw data from fetch
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]);
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [selectedDeviceType, setSelectedDeviceType] = useState('ALL');
    const [selectedArea, setSelectedArea] = useState('ALL');
    // Table State
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('desc');
    // Last Refreshed Timestamp
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const locations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Locations' }, ...getMockStores()], []);
    // Corrected Memos for Device Types and Areas with filtering for valid values
     const deviceTypes = useMemo(() => {
        if (!consumptionData || consumptionData.length === 0) return ['ALL'];
        const types = [...new Set(consumptionData.map(d => d.deviceTypeName).filter(Boolean))].sort(); // Filter out null/undefined
        return ['ALL', ...types];
    }, [consumptionData]);
    const areas = useMemo(() => {
        if (!consumptionData || consumptionData.length === 0) return ['ALL'];
        const areaList = [...new Set(consumptionData.map(d => d.areaName).filter(Boolean))].sort(); // Filter out null/undefined
        return ['ALL', ...areaList];
    }, [consumptionData]);

    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing energy data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial energy data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }

        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 800)); // Simulate API delay
            const data = generateMockEnergyConsumption(start, end);

            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock data generation failed.");

            setConsumptionData(data); // Set the raw data
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading energy data:", err);
            setError(`Failed to load data: ${err.message}`);
             setConsumptionData([]); // Clear data on error
        } finally {
            if (isMounted) setLoading(false);
        }
        return () => { isMounted = false; };
    }, [dateRange]); // Re-run fetchData only if dateRange changes

    useEffect(() => {
        fetchData(true); // Initial fetch
        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId); // Cleanup interval
    }, [fetchData]); // Depend on the fetchData callback


    // --- Filtered Data ---
    const filteredData = useMemo(() => {
        // Important: Filter from the raw `consumptionData` state
        return consumptionData.filter(item =>
            (selectedLocation === 'ALL' || item.locationKey === selectedLocation) &&
            (selectedDeviceType === 'ALL' || item.deviceTypeName === selectedDeviceType) &&
            (selectedArea === 'ALL' || item.areaName === selectedArea)
        );
    }, [consumptionData, selectedLocation, selectedDeviceType, selectedArea]);

    // --- KPI Calculations (Refined Checks) ---
    const kpiData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { totalKWh: 0, totalCost: 0, avgDailyKWh: 0, avgCostPerKWh: 0, peakKW: 0, peakHour: null, topDevice: 'N/A' };
        }

        let totalKWh = 0; let totalCost = 0; const dailyTotals = {}; let peakKW = 0; let peakHour = null; const hourlyConsumption = {}; const deviceTotals = {};

        filteredData.forEach(d => {
            // Use explicit null/undefined checks and isFinite for numbers
            const consumption = (d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh)) ? d.energyConsumed_kWh : 0;
            const cost = (d.energyCost != null && isFinite(d.energyCost)) ? d.energyCost : 0;

            totalKWh += consumption;
            totalCost += cost;

            if (d.dateKey && consumption > 0) { // Only add to daily if consumption occurred
                dailyTotals[d.dateKey] = (dailyTotals[d.dateKey] || 0) + consumption;
            }
             // Track hourly consumption for peak calculation
             if (d.dateKey && d.hourOfDay != null) {
                 const hourKey = `${d.dateKey}-${String(d.hourOfDay).padStart(2, '0')}`;
                 hourlyConsumption[hourKey] = (hourlyConsumption[hourKey] || 0) + consumption;
                 // Update peak only if current hour's consumption is greater
                 if (hourlyConsumption[hourKey] > peakKW) {
                     peakKW = hourlyConsumption[hourKey];
                     peakHour = `${d.dateKey} ${String(d.hourOfDay).padStart(2, '0')}:00`;
                 }
             }
             // Sum by device type
            if (d.deviceTypeName && consumption > 0) {
                deviceTotals[d.deviceTypeName] = (deviceTotals[d.deviceTypeName] || 0) + consumption;
            }
        });

        const numDaysWithConsumption = Object.keys(dailyTotals).length;
        const avgDailyKWh = numDaysWithConsumption > 0 ? totalKWh / numDaysWithConsumption : 0;
        const avgCostPerKWh = totalKWh > 0 ? totalCost / totalKWh : 0; // Avoid division by zero

        // Find top device based on summed consumption
        const topDevice = Object.entries(deviceTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        return {
            totalKWh: isFinite(totalKWh) ? totalKWh : 0,
            totalCost: isFinite(totalCost) ? totalCost : 0,
            avgDailyKWh: isFinite(avgDailyKWh) ? avgDailyKWh : 0,
            avgCostPerKWh: isFinite(avgCostPerKWh) ? avgCostPerKWh : 0,
            peakKW: isFinite(peakKW) ? peakKW : 0, // Peak KW is the highest kWh in an hour
            peakHour,
            topDevice
        };
    }, [filteredData]);


    // --- Chart Data Aggregations ---
    // Trend Data (Consumption & Temp) - Requires 'filteredData'
    const trendData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const groupedByDate = filteredData.reduce((acc, d) => {
            const dateKey = d.dateKey;
            if (!dateKey) return acc;
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, totalKWh: 0, temps: [], count: 0 };
            }
            acc[dateKey].totalKWh += (d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh)) ? d.energyConsumed_kWh : 0;
            if (d.temperatureCelsius != null && isFinite(d.temperatureCelsius)) {
                 acc[dateKey].temps.push(d.temperatureCelsius);
            }
            acc[dateKey].count++; // Still count records even if consumption/temp is invalid for avg temp calc
            return acc;
        }, {});

        return Object.values(groupedByDate)
             .map(d => ({
                 date: d.date, // Keep original date for sorting
                 totalKWh: parseFloat(d.totalKWh.toFixed(1)),
                 avgTemp: d.temps.length > 0 ? parseFloat((d.temps.reduce((s, t) => s + t, 0) / d.temps.length).toFixed(1)) : null,
                 displayDate: formatDate(d.date)
             }))
             .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    }, [filteredData]);

     // Cost Trend Data - Requires 'filteredData'
     const costTrendData = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
         const groupedByDate = filteredData.reduce((acc, d) => {
             const dateKey = d.dateKey;
             if (!dateKey) return acc;
             acc[dateKey] = (acc[dateKey] || 0) + ((d.energyCost != null && isFinite(d.energyCost)) ? d.energyCost : 0);
             return acc;
         }, {});
         return Object.entries(groupedByDate)
             .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(2)), displayDate: formatDate(date) }))
             .sort((a, b) => parseISO(a.date) - parseISO(b.date));
     }, [filteredData]);


    // By Device Type - Requires 'filteredData'
    const byDeviceTypeData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.deviceTypeName || 'Unknown';
            acc[key] = (acc[key] || 0) + ((d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh)) ? d.energyConsumed_kWh : 0);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
            .filter(d => d.value > 0) // Only show types with consumption
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    // By Area - Requires 'filteredData'
    const byAreaData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.areaName || 'Unknown';
            acc[key] = (acc[key] || 0) + ((d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh)) ? d.energyConsumed_kWh : 0);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
            .filter(d => d.value > 0) // Only show areas with consumption
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    // Hourly Pattern - Requires 'filteredData'
    const hourlyPatternData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return Array(24).fill(0).map((_, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, avgKWh: 0 })); // Return zeroed array

        const hourlyAggregates = filteredData.reduce((acc, d) => {
            const hour = d.hourOfDay;
             if (hour != null && hour >= 0 && hour < 24) {
                 if (!acc[hour]) {
                     acc[hour] = { totalKWh: 0, count: 0 };
                 }
                 const consumption = (d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh)) ? d.energyConsumed_kWh : 0;
                 acc[hour].totalKWh += consumption;
                 acc[hour].count++;
             }
             return acc;
         }, {});

         // Calculate average, filling gaps with 0
         return Array.from({ length: 24 }, (_, hour) => {
             const aggregate = hourlyAggregates[hour];
             return {
                 hour: `${String(hour).padStart(2, '0')}:00`,
                 avgKWh: (aggregate && aggregate.count > 0) ? parseFloat((aggregate.totalKWh / aggregate.count).toFixed(2)) : 0
             };
         });

    }, [filteredData]);


    // Scatter Data - Requires 'filteredData'
    const scatterData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const sampleSize = 1000;
        const dataToSample = filteredData.filter(d =>
             d.temperatureCelsius != null && isFinite(d.temperatureCelsius) &&
             d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh) && d.energyConsumed_kWh > 0 // Only plot points with consumption
        );
        if (dataToSample.length === 0) return [];

        const step = Math.max(1, Math.floor(dataToSample.length / sampleSize));
        return dataToSample
                .filter((_, index) => index % step === 0) // Sample
                .map(d => ({
                    temp: d.temperatureCelsius,
                    kWh: d.energyConsumed_kWh,
                    hour: d.hourOfDay,
                    device: d.deviceTypeName
                }));
    }, [filteredData]);


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
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }, []);

    const descendingComparator = useCallback((a, b, orderByField) => {
        let valA = a[orderByField]; let valB = b[orderByField];
        if (valA == null && valB == null) return 0; if (valA == null) return 1; if (valB == null) return -1;
        if (orderByField === 'timestamp') { try { valA = parseISO(valA); valB = parseISO(valB); } catch(e){} }
        if (typeof valA === 'string' && typeof valB === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valB < valA) return -1; if (valB > valA) return 1; return 0;
    }, []);

    const getComparator = useCallback((currentOrder, currentOrderBy) => {
        return currentOrder === 'desc'
            ? (a, b) => descendingComparator(a, b, currentOrderBy)
            : (a, b) => -descendingComparator(a, b, currentOrderBy);
    }, [descendingComparator]);

    // Sort the 'filteredData' directly for the table
    const sortedData = useMemo(() => stableSort(filteredData, getComparator(order, orderBy)),
        [filteredData, order, orderBy, stableSort, getComparator]);

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };

    // Calculate empty rows based on sortedData length and current page/rowsPerPage
    const currentTableData = useMemo(() => sortedData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage), [sortedData, tablePage, rowsPerPage]);
    const emptyRows = useMemo(() => Math.max(0, rowsPerPage - currentTableData.length), [currentTableData.length, rowsPerPage]);


    // --- Filter Reset ---
    const handleClearFilters = () => {
        setSelectedLocation('ALL');
        setSelectedDeviceType('ALL');
        setSelectedArea('ALL');
    };

    // --- Render Logic ---
    const chartPaperHeight = '380px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Energy Management Hub
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
                        {/* Location Filter */}
                         <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Location</InputLabel>
                                <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Location" disabled={loading}>
                                    {locations.map(loc => <MenuItem key={loc.storeKey} value={loc.storeKey}>{loc.storeName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Device Type Filter */}
                         <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Device Type</InputLabel>
                                <Select value={selectedDeviceType} onChange={(e) => setSelectedDeviceType(e.target.value)} label="Device Type" disabled={loading || deviceTypes.length <= 1}>
                                    {deviceTypes.map(type => <MenuItem key={type} value={type}>{type === 'ALL' ? 'All Device Types' : type}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Area Filter */}
                         <Grid item xs={12} sm={6} md={2.5}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Area</InputLabel>
                                <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} label="Area" disabled={loading || areas.length <= 1}>
                                    {areas.map(area => <MenuItem key={area} value={area}>{area === 'ALL' ? 'All Areas' : area}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Date Range Filter */}
                        <Grid item xs={12} sm={6} md={3.5}>
                            <DateRangePicker
                                localeText={{ start: "Start Date", end: "End Date" }}
                                value={dateRange}
                                onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }}
                                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
                                disabled={loading}
                            />
                        </Grid>
                         {/* Clear Filters Button */}
                         <Grid item xs={12} sm={12} md={1} sx={{ textAlign: { xs: 'right', md: 'left' } }}>
                             <Button
                                 variant="outlined"
                                 size="small"
                                 onClick={handleClearFilters}
                                 startIcon={<FilterListOffIcon />}
                                 disabled={loading || (selectedLocation === 'ALL' && selectedDeviceType === 'ALL' && selectedArea === 'ALL')}
                                 sx={{ height: '40px' }} // Match text field height
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
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Consumption" value={kpiData.totalKWh} formatFunc={formatKWh} icon={<BoltIcon />} loading={loading} color="primary.main" tooltip="Total energy consumed in kWh for the period" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Cost" value={kpiData.totalCost} formatFunc={formatCurrency} icon={<AttachMoneyIcon />} loading={loading} color="success.dark" tooltip="Estimated total energy cost" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg Daily Use" value={kpiData.avgDailyKWh} formatFunc={formatKWh} icon={<CalendarTodayIcon />} loading={loading} color="info.main" tooltip="Average daily energy consumption" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg Cost / kWh" value={kpiData.avgCostPerKWh} formatFunc={(v) => formatCurrency(v, 3)} icon={<InfoIcon />} loading={loading} color="secondary.main" tooltip="Average cost per kilowatt-hour" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Peak Hourly Use" value={kpiData.peakKW} formatFunc={formatKW} icon={<ShowChartIcon />} loading={loading} color="warning.dark" tooltip={`Highest consumption in a single hour (${kpiData.peakHour || 'N/A'})`} /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Top Device Type" value={kpiData.topDevice} formatFunc={(v) => v} icon={<DevicesIcon />} loading={loading} color="error.main" tooltip="Device type with highest total consumption" /></Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Trend Chart (Consumption & Temp) */}
                    <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Consumption & Temperature Trend</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : trendData.length > 0 ? (
                                        <ComposedChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis yAxisId="left" label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => `${formatNumber(v, 0)}`} />
                                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} domain={['dataMin - 2', 'dataMax + 2']} />
                                            <Tooltip formatter={(value, name) => {
                                                if (name === 'Avg Temp') return [formatTemperature(value), name];
                                                return [formatKWh(value), name];
                                             }} />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                            <Bar yAxisId="left" dataKey="totalKWh" name="Total kWh" fill={theme.palette.primary.light} barSize={20} />
                                            <Line yAxisId="right" type="monotone" dataKey="avgTemp" name="Avg Temp" stroke={theme.palette.error.main} strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No trend data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                     {/* Cost Trend Chart */}
                     <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Energy Cost Trend</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : costTrendData.length > 0 ? (
                                         <LineChart data={costTrendData} margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatCurrency(v, 0)} />
                                             <Tooltip formatter={(value) => [formatCurrency(value), "Daily Cost"]} />
                                             <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                             <Line type="monotone" dataKey="cost" name="Daily Cost" stroke={theme.palette.success.dark} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                         </LineChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No cost data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                     {/* Consumption by Device Type */}
                     <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Consumption by Device Type</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : byDeviceTypeData.length > 0 ? (
                                        <PieChart>
                                            <Pie data={byDeviceTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                {byDeviceTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatKWh(value)} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: '10px' }} />
                                        </PieChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Consumption by Area */}
                     <Grid item xs={12} md={6} lg={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Consumption by Area</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : byAreaData.length > 0 ? (
                                        <BarChart data={byAreaData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => `${formatNumber(v/1000, 1)}k`} />
                                            <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatKWh(value)}/>
                                            <Bar dataKey="value" name="kWh Consumed" >
                                                {byAreaData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>

                    {/* Avg Hourly Consumption */}
                     <Grid item xs={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Hourly Consumption Pattern</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : hourlyPatternData.some(d=>d.avgKWh>0) ? (
                                        <BarChart data={hourlyPatternData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="hour" fontSize={10} tick={{ fill: theme.palette.text.secondary }} interval={2} />
                                            <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatKWh(v, 1)} />
                                            <Tooltip formatter={(value) => [formatKWh(value, 2), 'Avg kWh']} />
                                            <Bar dataKey="avgKWh" name="Avg kWh" fill={theme.palette.secondary.light}>
                                                 {hourlyPatternData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                     {/* Consumption vs Temp Scatter */}
                     <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Consumption vs. Temperature</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : scatterData.length > 0 ? (
                                        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10, }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" domain={['dataMin - 1', 'dataMax + 1']} label={{ value: "Temperature (°C)", position: "insideBottom", offset: -15, fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis type="number" dataKey="kWh" name="Consumption" unit="kWh" label={{ value: "kWh", angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                                                if(name === 'Temperature') return formatTemperature(value);
                                                if(name === 'Consumption') return formatKWh(value, 2);
                                                return value;
                                            }}/>
                                            <Scatter name="Hourly Reading" data={scatterData} fill={theme.palette.info.main} shape="circle" />
                                        </ScatterChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No scatter data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Consumption Details (Hourly)</Typography>
                     <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {[
                                        { id: 'timestamp', label: 'Timestamp', minWidth: 130 },
                                        { id: 'locationName', label: 'Location', minWidth: 150 },
                                        { id: 'deviceTypeName', label: 'Device Type', minWidth: 120 },
                                        { id: 'areaName', label: 'Area', minWidth: 120 },
                                        { id: 'energyConsumed_kWh', label: 'kWh', minWidth: 70, align: 'right'},
                                        { id: 'energyCost', label: 'Cost (EGP)', minWidth: 90, align: 'right'},
                                        { id: 'temperatureCelsius', label: 'Temp (°C)', minWidth: 80, align: 'right'},
                                        { id: 'weatherCondition', label: 'Weather', minWidth: 100, align: 'left'},
                                    ].map((headCell) => (
                                        <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={orderBy === headCell.id ? order : false} sx={{ py: 1, minWidth: headCell.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold' }}>
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
                                         <TableRow key={`skel-${index}`}><TableCell colSpan={8}><Skeleton animation="wave" /></TableCell></TableRow>
                                     ))
                                ) : sortedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>No consumption data matches filters.</TableCell></TableRow>
                                ) : (
                                    /* Use currentTableData which is already sliced */
                                    currentTableData.map((row) => (
                                        <TableRow hover key={row.consumptionId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{fontSize: '0.8rem'}}>{formatDateTime(row.timestamp)}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}}>{row.locationName}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}}>{row.deviceTypeName}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}}>{row.areaName}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}} align="right">{formatKWh(row.energyConsumed_kWh, 2)}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}} align="right">{formatCurrency(row.energyCost, 2)}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}} align="right">{formatTemperature(row.temperatureCelsius)}</TableCell>
                                            <TableCell sx={{fontSize: '0.8rem'}}>{row.weatherCondition}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Render empty rows only if not loading and there is data */}
                                {!loading && sortedData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={8} /></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     {/* Show pagination only if there's data */}
                    {!loading && sortedData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[15, 30, 50, 100]}
                            component="div"
                            count={sortedData.length} // Count should be based on the full sorted list
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

export default EnergyManagementDashboard;