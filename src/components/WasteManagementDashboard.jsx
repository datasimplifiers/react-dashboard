// src/components/WasteManagementDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Autocomplete, TextField, List, ListItem, ListItemText
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Treemap, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInDays, eachDayOfInterval } from 'date-fns';

// MUI Icons
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Waste
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Value
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import CategoryIcon from '@mui/icons-material/Category'; // Product Category
import LabelIcon from '@mui/icons-material/Label'; // Waste Type / Reason
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Reason
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Damage/Issue
import InventoryIcon from '@mui/icons-material/Inventory'; // Product
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import InfoIcon from '@mui/icons-material/Info';

// Import data generators and common functions
import { generateMockWasteData, getMockWasteTypes, getMockWasteReasons } from '../utils/mockWasteDataGenerator';
import { getMockStores, getMockCategories } from '../utils/mockDataGenerator';

// --- Constants ---
const COLORS = ['#ef5350', '#ab47bc', '#ff9800', '#66bb6a', '#29b6f6', '#ffa726', '#7e57c2', '#ec407a', '#5c6bc0', '#ffee58']; // More colors
const REFRESH_INTERVAL_MS = 150000; // Refresh every 2.5 minutes
const TOP_N_PRODUCTS = 10; // For Top Wasted Products list

// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid'; } catch { return 'Invalid'; } };
const formatNumber = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); };
const formatCurrency = (value, digits = 2) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`; };
const formatQuantity = (value, unit = 'units') => {
    if (value === null || value === undefined || !isFinite(value)) return 'N/A';
    const formattedValue = formatNumber(value, unit === 'kg' ? 2 : 0);
    return `${formattedValue} ${unit}`;
};
const formatPercentage = (value) => {
    if (value === null || value === undefined || !isFinite(value)) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
}

// --- Custom Treemap Content ---
const CustomizedTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, colors, name, value } = props;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[index % colors.length] : 'rgba(255,255,255,0)', // Only color top level
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 && width > 60 && height > 25 ? ( // Adjust text visibility thresholds
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
                    {name}
                </text>
            ) : null}
             {depth === 1 && width > 80 && height > 40 ? ( // Show value if enough space
                 <text x={x + 4} y={y + 18} fill="rgba(0,0,0,0.7)" fontSize={10}>
                    {formatCurrency(value)}
                 </text>
             ) : null}
        </g>
    );
};


// --- Kpi Card Component --- (Assuming similar to Energy Dashboard's)
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
const WasteManagementDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wasteData, setWasteData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 29)), endOfDay(new Date())]); // Default 30 days
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [selectedWasteType, setSelectedWasteType] = useState('ALL');
    const [selectedReason, setSelectedReason] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL'); // Product Category Filter
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('desc');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const locations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Locations' }, ...getMockStores()], []);
    const wasteTypes = useMemo(() => [{ wasteTypeKey: 'ALL', name: 'All Waste Types' }, ...getMockWasteTypes()], []);
    const wasteReasons = useMemo(() => [{ reasonKey: 'ALL', reasonDescription: 'All Reasons' }, ...getMockWasteReasons()], []);
    const productCategories = useMemo(() => [{ categoryKey: 'ALL', name: 'All Categories' }, ...getMockCategories()], []);

    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing waste data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial waste data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }

        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 900)); // Simulate API delay
            const data = generateMockWasteData(start, end);

            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock data generation failed.");

            setWasteData(data);
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading waste data:", err);
            setError(`Failed to load data: ${err.message}`);
            setWasteData([]); // Clear data on error
        } finally {
            if (isMounted) setLoading(false);
        }
        return () => { isMounted = false; };
    }, [dateRange]); // Re-run fetchData only if dateRange changes

    useEffect(() => {
        fetchData(true); // Initial fetch
        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId); // Cleanup interval
    }, [fetchData]);

    // --- Filtered Data ---
    const filteredData = useMemo(() => {
        return wasteData.filter(item =>
            (selectedLocation === 'ALL' || item.locationKey === selectedLocation) &&
            (selectedWasteType === 'ALL' || item.wasteTypeKey === selectedWasteType) &&
            (selectedReason === 'ALL' || item.reasonKey === selectedReason) &&
            (selectedCategory === 'ALL' || item.categoryKey === selectedCategory)
        );
    }, [wasteData, selectedLocation, selectedWasteType, selectedReason, selectedCategory]);

    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { totalWasteValue: 0, totalWasteQuantityKg: 0, totalWasteQuantityUnits: 0, avgValuePerEvent: 0, totalEvents: 0, topReasonValue: 'N/A', topCategoryValue: 'N/A', topTypeValue: 'N/A' };
        }

        let totalWasteValue = 0;
        let totalWasteQuantityKg = 0;
        let totalWasteQuantityUnits = 0;
        const reasonTotalsValue = {};
        const categoryTotalsValue = {};
        const typeTotalsValue = {};

        filteredData.forEach(d => {
            const value = (d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0;
            const quantity = (d.wasteQuantity != null && isFinite(d.wasteQuantity)) ? d.wasteQuantity : 0;

            totalWasteValue += value;
            if (d.unitOfMeasure === 'kg') {
                totalWasteQuantityKg += quantity;
            } else {
                totalWasteQuantityUnits += quantity;
            }

            // Sum by value for top KPIs
            if (d.reasonDescription) {
                reasonTotalsValue[d.reasonDescription] = (reasonTotalsValue[d.reasonDescription] || 0) + value;
            }
             if (d.categoryName) {
                categoryTotalsValue[d.categoryName] = (categoryTotalsValue[d.categoryName] || 0) + value;
            }
             if (d.wasteTypeName) {
                typeTotalsValue[d.wasteTypeName] = (typeTotalsValue[d.wasteTypeName] || 0) + value;
            }
        });

        const totalEvents = filteredData.length;
        const avgValuePerEvent = totalEvents > 0 ? totalWasteValue / totalEvents : 0;

        const findTop = (totals) => Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        return {
            totalWasteValue: isFinite(totalWasteValue) ? totalWasteValue : 0,
            totalWasteQuantityKg: isFinite(totalWasteQuantityKg) ? totalWasteQuantityKg : 0,
            totalWasteQuantityUnits: isFinite(totalWasteQuantityUnits) ? totalWasteQuantityUnits : 0,
            avgValuePerEvent: isFinite(avgValuePerEvent) ? avgValuePerEvent : 0,
            totalEvents: totalEvents,
            topReasonValue: findTop(reasonTotalsValue),
            topCategoryValue: findTop(categoryTotalsValue),
            topTypeValue: findTop(typeTotalsValue),
        };
    }, [filteredData]);

    // --- Chart Data Aggregations ---

    // Trend Data (Value & Events)
    const trendData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const groupedByDate = filteredData.reduce((acc, d) => {
            const dateKey = d.dateKey;
            if (!dateKey) return acc;
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, totalValue: 0, eventCount: 0 };
            }
            acc[dateKey].totalValue += (d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0;
            acc[dateKey].eventCount++;
            return acc;
        }, {});

        return Object.values(groupedByDate)
            .map(d => ({
                date: d.date,
                totalValue: parseFloat(d.totalValue.toFixed(2)),
                eventCount: d.eventCount,
                displayDate: formatDate(d.date) // Keep original for sorting, display formatted
            }))
            .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    }, [filteredData]);


    // By Waste Type (Value)
    const byWasteTypeValue = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.wasteTypeName || 'Unknown';
            acc[key] = (acc[key] || 0) + ((d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    // By Reason (Value)
    const byReasonValue = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.reasonDescription || 'Unknown';
            acc[key] = (acc[key] || 0) + ((d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0);
            return acc;
        }, {});
        // Calculate total for percentage
        const totalValue = Object.values(grouped).reduce((sum, val) => sum + val, 0);

        return Object.entries(grouped)
            .map(([name, value]) => ({
                name,
                value: parseFloat(value.toFixed(2)),
                percentage: totalValue > 0 ? parseFloat((value / totalValue).toFixed(4)) : 0
             }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);


    // By Category (Value) - Treemap requires hierarchical structure (Category -> Product) or just flat category data
     const byCategoryValueTreemap = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const catKey = d.categoryName || 'Unknown Category';
            if (!acc[catKey]) {
                acc[catKey] = { name: catKey, children: {} };
            }
             // Aggregate by category directly for the treemap value
             acc[catKey].value = (acc[catKey].value || 0) + ((d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0);

            return acc;
        }, {});

        // Convert to treemap structure { name: 'Category', value: number }
         return Object.values(grouped)
            .map(cat => ({
                 name: cat.name,
                 value: parseFloat((cat.value || 0).toFixed(2))
            }))
            .filter(d => d.value > 0) // Filter out categories with no waste value
            .sort((a,b) => b.value - a.value); // Sort for color consistency maybe

    }, [filteredData]);


    // By Location (Value)
    const byLocationValue = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.storeName || 'Unknown Location';
            acc[key] = (acc[key] || 0) + ((d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);


    // Top Wasted Products (Value)
     const topWastedProducts = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
         const productTotals = filteredData.reduce((acc, d) => {
             const key = d.productKey;
             if (!key) return acc;
             if (!acc[key]) {
                 acc[key] = {
                     productKey: key,
                     name: d.productName || 'Unknown Product',
                     category: d.categoryName || 'Unknown',
                     totalValue: 0,
                     totalQuantityKg: 0,
                     totalQuantityUnits: 0,
                     eventCount: 0,
                 };
             }
             const value = (d.wasteValue != null && isFinite(d.wasteValue)) ? d.wasteValue : 0;
             const quantity = (d.wasteQuantity != null && isFinite(d.wasteQuantity)) ? d.wasteQuantity : 0;

             acc[key].totalValue += value;
             acc[key].eventCount++;
              if (d.unitOfMeasure === 'kg') {
                 acc[key].totalQuantityKg += quantity;
             } else {
                 acc[key].totalQuantityUnits += quantity;
             }
             return acc;
         }, {});

         return Object.values(productTotals)
             .sort((a, b) => b.totalValue - a.totalValue)
             .slice(0, TOP_N_PRODUCTS)
             .map(p => ({
                 ...p,
                 totalValue: parseFloat(p.totalValue.toFixed(2)),
                 totalQuantityKg: parseFloat(p.totalQuantityKg.toFixed(2)),
                 totalQuantityUnits: Math.round(p.totalQuantityUnits),
             }));
     }, [filteredData]);


    // --- Table Logic --- (Same as Energy Dashboard - reuse useCallback hooks)
    const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

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

     const stableSort = useCallback((array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }, []);


    // Sort the 'filteredData' directly for the table
    const sortedData = useMemo(() => stableSort(filteredData, getComparator(order, orderBy)),
        [filteredData, order, orderBy, stableSort, getComparator]);

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };

    const currentTableData = useMemo(() => sortedData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage), [sortedData, tablePage, rowsPerPage]);
    const emptyRows = useMemo(() => Math.max(0, rowsPerPage - currentTableData.length), [currentTableData.length, rowsPerPage]);


    // --- Filter Reset ---
    const handleClearFilters = () => {
        setSelectedLocation('ALL');
        setSelectedWasteType('ALL');
        setSelectedReason('ALL');
        setSelectedCategory('ALL');
    };

    // --- Render Logic ---
    const chartPaperHeight = '400px'; // Increased height slightly

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Waste Management Analytics
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
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Location</InputLabel>
                                <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Location" disabled={loading}>
                                    {locations.map(loc => <MenuItem key={loc.storeKey} value={loc.storeKey}>{loc.storeName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Waste Type Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Waste Type</InputLabel>
                                <Select value={selectedWasteType} onChange={(e) => setSelectedWasteType(e.target.value)} label="Waste Type" disabled={loading}>
                                    {wasteTypes.map(type => <MenuItem key={type.wasteTypeKey} value={type.wasteTypeKey}>{type.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Reason Filter */}
                         <Grid item xs={12} sm={6} md={2.5}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Reason</InputLabel>
                                <Select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)} label="Reason" disabled={loading}>
                                    {wasteReasons.map(reason => <MenuItem key={reason.reasonKey} value={reason.reasonKey}>{reason.reasonDescription}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Product Category Filter */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Category</InputLabel>
                                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category" disabled={loading}>
                                    {productCategories.map(cat => <MenuItem key={cat.categoryKey} value={cat.categoryKey}>{cat.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Date Range Filter */}
                        <Grid item xs={12} sm={6} md={2.5}>
                            <DateRangePicker
                                localeText={{ start: "Start Date", end: "End Date" }}
                                value={dateRange}
                                onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }}
                                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
                                disabled={loading}
                            />
                        </Grid>
                         {/* Clear Filters Button */}
                         <Grid item xs={12} sm={6} md={1} sx={{ textAlign: 'right' }}>
                             <Button
                                 variant="outlined"
                                 size="small"
                                 onClick={handleClearFilters}
                                 startIcon={<FilterListOffIcon />}
                                 disabled={loading || (selectedLocation === 'ALL' && selectedWasteType === 'ALL' && selectedReason === 'ALL' && selectedCategory === 'ALL')}
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
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Waste Value" value={kpiData.totalWasteValue} formatFunc={formatCurrency} icon={<MonetizationOnIcon />} loading={loading} color="error.dark" tooltip="Total cost value of wasted products" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Waste Qty (Kg)" value={kpiData.totalWasteQuantityKg} formatFunc={(v) => formatQuantity(v, 'kg')} icon={<DeleteSweepIcon />} loading={loading} color="warning.main" tooltip="Total quantity of waste measured in Kg" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Waste Qty (Units)" value={kpiData.totalWasteQuantityUnits} formatFunc={(v) => formatQuantity(v, 'units')} icon={<DeleteSweepIcon />} loading={loading} color="warning.dark" tooltip="Total quantity of waste measured in units/packs/etc." /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg Value / Event" value={kpiData.avgValuePerEvent} formatFunc={formatCurrency} icon={<InfoIcon />} loading={loading} color="info.main" tooltip="Average cost value per recorded waste event" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Top Reason (Value)" value={kpiData.topReasonValue} formatFunc={(v) => v} icon={<HelpOutlineIcon />} loading={loading} color="secondary.main" tooltip="Waste reason contributing the most to total waste value" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Top Category (Value)" value={kpiData.topCategoryValue} formatFunc={(v) => v} icon={<CategoryIcon />} loading={loading} color="primary.main" tooltip="Product category contributing the most to total waste value" /></Grid>
                    <Grid item xs={6} sm={4} md={2}><KpiCard title="Top Waste Type (Value)" value={kpiData.topTypeValue} formatFunc={(v) => v} icon={<LabelIcon />} loading={loading} color="success.main" tooltip="Waste type contributing the most to total waste value" /></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="# Waste Events" value={kpiData.totalEvents} icon={<ErrorOutlineIcon />} loading={loading} color="text.secondary" tooltip="Total number of waste entries recorded" /></Grid>
                </Grid>

                {/* Charts & Top Products */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Trend Chart (Value & Events) */}
                    <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Waste Value & Events Trend</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : trendData.length > 0 ? (
                                        <LineChart data={trendData} margin={{ top: 5, right: 5, left: 15, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis yAxisId="left" label={{ value: 'Value (EGP)', angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.primary.main }} tickFormatter={(v) => `${formatNumber(v/1000, 0)}k`} />
                                            <YAxis yAxisId="right" orientation="right" label={{ value: '# Events', angle: 90, position: 'insideRight', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.secondary.main }} />
                                            <Tooltip formatter={(value, name) => {
                                                if (name === 'Total Value') return [formatCurrency(value), name];
                                                if (name === '# Events') return [formatNumber(value, 0), name];
                                                return value;
                                             }} />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                            <Line yAxisId="left" type="monotone" dataKey="totalValue" name="Total Value" stroke={theme.palette.error.dark} strokeWidth={2} dot={false} />
                                            <Line yAxisId="right" type="monotone" dataKey="eventCount" name="# Events" stroke={theme.palette.warning.main} strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                                        </LineChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No trend data available.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                     {/* Waste by Reason (Value & %) */}
                     <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Waste by Reason (Value)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : byReasonValue.length > 0 ? (
                                         <BarChart data={byReasonValue} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => `${formatNumber(v/1000, 0)}k`} />
                                             <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <Tooltip formatter={(value, name, props) => [`${formatCurrency(value)} (${formatPercentage(props.payload.percentage)})`, "Value (% of Total)"]} />
                                             <Bar dataKey="value" name="Waste Value" >
                                                  {byReasonValue.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                             </Bar>
                                         </BarChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No reason data available.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                     {/* Waste by Type */}
                     <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Waste by Type (Value)</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : byWasteTypeValue.length > 0 ? (
                                        <PieChart>
                                            <Pie data={byWasteTypeValue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" labelLine={false} label={({ name, percent }) => percent > 0.03 ? `${name}: ${formatPercentage(percent)}` : ''} // Label only larger slices
                                            >
                                                {byWasteTypeValue.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [formatCurrency(value), name]} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: '10px' }} />
                                        </PieChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No waste type data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Waste by Category Treemap */}
                     <Grid item xs={12} md={6} lg={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Waste by Category (Value)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : byCategoryValueTreemap.length > 0 ? (
                                        <Treemap
                                            data={byCategoryValueTreemap}
                                            dataKey="value"
                                            ratio={4 / 3}
                                            stroke="#fff"
                                            fill="#8884d8"
                                            isAnimationActive={false} // Disable animation for performance if needed
                                            content={<CustomizedTreemapContent colors={COLORS} />}
                                        >
                                             <Tooltip formatter={(value, name) => [formatCurrency(value), name]}/>
                                         </Treemap>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No category data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>

                     {/* Top Wasted Products List */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Top {TOP_N_PRODUCTS} Wasted Products (by Value)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
                                {loading ? ( Array.from(new Array(TOP_N_PRODUCTS)).map((_, i) => <Skeleton key={i} variant="text" sx={{ my: 0.5 }}/>) ) :
                                  topWastedProducts.length > 0 ? (
                                    <List dense>
                                        {topWastedProducts.map((product, index) => (
                                            <React.Fragment key={product.productKey}>
                                                <ListItem disableGutters>
                                                     <ListItemText
                                                         primary={`${index + 1}. ${product.name}`}
                                                         secondary={
                                                             <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                                 <Box component="span">{product.category}</Box>
                                                                 <Box component="span" sx={{ fontWeight: 'bold' }}>{formatCurrency(product.totalValue)}</Box>
                                                             </Box>
                                                         }
                                                         primaryTypographyProps={{ sx: { fontSize: '0.85rem' } }}
                                                         secondaryTypographyProps={{ component: 'div' }} // Use div for secondary to allow flex layout
                                                     />
                                                </ListItem>
                                                {index < topWastedProducts.length - 1 && <Divider component="li" light />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No product data available.</Typography></Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Waste Log Details</Typography>
                     <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {[
                                        { id: 'timestamp', label: 'Timestamp', minWidth: 130 },
                                        { id: 'locationName', label: 'Location', minWidth: 120 },
                                        { id: 'productName', label: 'Product', minWidth: 180 },
                                        { id: 'categoryName', label: 'Category', minWidth: 100 },
                                        { id: 'wasteTypeName', label: 'Waste Type', minWidth: 100 },
                                        { id: 'reasonDescription', label: 'Reason', minWidth: 150 },
                                        { id: 'wasteQuantity', label: 'Qty', minWidth: 70, align: 'right'},
                                        { id: 'unitOfMeasure', label: 'UoM', minWidth: 50},
                                        { id: 'unitCost', label: 'Unit Cost', minWidth: 70, align: 'right'},
                                        { id: 'wasteValue', label: 'Waste Value', minWidth: 90, align: 'right'},
                                        { id: 'reasonSourceArea', label: 'Source Area', minWidth: 100 },
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
                                         <TableRow key={`skel-${index}`}><TableCell colSpan={11}><Skeleton animation="wave" /></TableCell></TableRow>
                                     ))
                                ) : sortedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3 }}>No waste data matches filters.</TableCell></TableRow>
                                ) : (
                                    currentTableData.map((row) => (
                                        <TableRow hover key={row.wasteEntryId} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { fontSize: '0.78rem', py: 0.5 } }}>
                                            <TableCell>{formatDateTime(row.timestamp)}</TableCell>
                                            <TableCell>{row.locationName}</TableCell>
                                            <TableCell>{row.productName}</TableCell>
                                            <TableCell>{row.categoryName}</TableCell>
                                            <TableCell>{row.wasteTypeName}</TableCell>
                                            <TableCell>{row.reasonDescription}</TableCell>
                                            <TableCell align="right">{formatNumber(row.wasteQuantity, row.unitOfMeasure === 'kg' ? 2 : 0)}</TableCell>
                                            <TableCell>{row.unitOfMeasure}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.unitCost)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(row.wasteValue)}</TableCell>
                                            <TableCell>{row.reasonSourceArea}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Render empty rows */}
                                {!loading && sortedData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={11} /></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     {/* Show pagination only if there's data */}
                    {!loading && sortedData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[15, 30, 50, 100]}
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

export default WasteManagementDashboard;