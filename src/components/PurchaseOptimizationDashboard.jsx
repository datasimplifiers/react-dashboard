// src/components/PurchaseOptimizationDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Autocomplete, TextField, List, ListItem, ListItemText
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInDays } from 'date-fns';

// MUI Icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Purchase Order
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // PO Details
import BusinessIcon from '@mui/icons-material/Business'; // Supplier
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Product
import CategoryIcon from '@mui/icons-material/Category'; // Category
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location (Receiving)
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer'; // Lead Time
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'; // Variance/Delay
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // On-Time
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Late/Issue
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Cost/Price
import PriceCheckIcon from '@mui/icons-material/PriceCheck'; // Price Variance
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


// Import data generators and common functions
import { generateMockPurchaseOrderData } from '../utils/mockPurchaseOptimizationGenerator';
import { getMockStores, getMockProducts, getMockSuppliers, getMockCategories } from '../utils/mockDataGenerator';

// --- Constants ---
const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#ef5350', '#ab47bc', '#7e57c2', '#03a9f4', '#8bc34a'];
const POSITIVE_VARIANCE_COLOR = '#ef5350'; // Red for higher price/longer lead time
const NEGATIVE_VARIANCE_COLOR = '#4caf50'; // Green for lower price/shorter lead time
const NEUTRAL_COLOR = 'text.secondary';
const REFRESH_INTERVAL_MS = 300000; // Refresh every 5 minutes
const ON_TIME_THRESHOLD_DAYS = 1; // Defined in generator, copied here for table coloring logic consistency


// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'yyyy-MM-dd') : 'Invalid'; } catch { return 'Invalid'; } }; // Use yyyy-MM-dd for consistency
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); };
const formatCurrency = (value, digits = 2) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`; };
const formatPercentage = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${(value * 100).toFixed(1)}%`; };
const formatDays = (days) => { if (days === null || days === undefined || !isFinite(days)) return 'N/A'; return `${formatNumber(days, 1)} days`; };
const formatVarianceDays = (days) => { if (days === null || days === undefined || !isFinite(days)) return 'N/A'; const symbol = days > 0 ? '+' : ''; return `${symbol}${formatNumber(days, 1)} days`; };
const formatPriceVariance = (variance, digits = 2) => { if (variance === null || variance === undefined || !isFinite(variance)) return 'N/A'; const symbol = variance > 0 ? '+' : ''; return `${symbol}${formatCurrency(variance, digits)}`; };
const getStatusColor = (status) => {
    switch (status) {
        case 'On-Time': return 'success';
        case 'Late': return 'error';
        case 'Early': return 'info';
        case 'Partially Received': return 'warning';
        default: return 'default';
    }
};


// --- Kpi Card Component ---
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip, changeValue, changeFormatFunc = formatPercentage }) => (
    <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                  {!loading && changeValue !== undefined && (
                     <Typography variant="caption" color={changeValue >= 0 ? POSITIVE_VARIANCE_COLOR : NEGATIVE_VARIANCE_COLOR} sx={{ alignSelf: 'flex-end' }}>
                         {changeValue >= 0 ? '+' : ''}{changeFormatFunc(changeValue)} vs Prev.
                     </Typography>
                  )}
             </CardContent>
        </Card>
    </MuiTooltip>
);

// --- Main Component ---
const PurchaseOptimizationDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [poData, setPoData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 29)), endOfDay(new Date())]); // Default 30 days
    const [selectedSupplier, setSelectedSupplier] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedLocation, setSelectedLocation] = useState('ALL'); // Receiving Store
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [orderBy, setOrderBy] = useState('orderTimestamp');
    const [order, setOrder] = useState('desc');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const suppliers = useMemo(() => [{ supplierKey: 'ALL', supplierName: 'All Suppliers' }, ...getMockSuppliers()], []);
    const categories = useMemo(() => [{ categoryKey: 'ALL', name: 'All Categories' }, ...getMockCategories()], []);
    const locations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Locations' }, ...getMockStores()], []);
    const statuses = useMemo(() => ['ALL', 'On-Time', 'Late', 'Early', 'Partially Received'], []); // Added 'ALL'

    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing PO data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial PO data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }

        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 1100)); // Simulate API delay
            const data = generateMockPurchaseOrderData(start, end);

            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock PO data generation failed.");

            setPoData(data);
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading PO data:", err);
            setError(`Failed to load data: ${err.message}`);
            setPoData([]);
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
        return poData.filter(po =>
            (selectedSupplier === 'ALL' || po.supplierKey === selectedSupplier) &&
            (selectedCategory === 'ALL' || po.categoryKey === selectedCategory) &&
            (selectedLocation === 'ALL' || po.locationKey === selectedLocation) &&
            (selectedStatus === 'ALL' || po.receiptStatus === selectedStatus)
        );
    }, [poData, selectedSupplier, selectedCategory, selectedLocation, selectedStatus]);

    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { totalPOValue: 0, totalPOs: 0, avgPOValue: 0, otdRate: 0, avgLeadTimeActual: 0, avgLeadTimeVariance: 0, avgPriceVarianceVsCostPerc: 0, topSupplierValue: 'N/A' };
        }

        let totalPOValue = 0;
        let totalPOs = filteredData.length;
        let onTimeCount = 0;
        let totalLeadTimeActual = 0;
        let totalLeadTimeVariance = 0;
        let totalAbsPriceVarianceVsCost = 0;
        let totalBaseCostValue = 0; // Sum of (qty * baseCost) for variance % calc
        const supplierValue = {};

        filteredData.forEach(d => {
            totalPOValue += d.totalCost || 0;
            if (d.onTimeFlag === 1) {
                onTimeCount++;
            }
            totalLeadTimeActual += d.leadTimeActualDays || 0;
            totalLeadTimeVariance += d.leadTimeVarianceDays || 0;

             // For avg price variance % vs base cost
             const baseValue = (d.orderedQuantity || 0) * (d.baseUnitCost || 0);
             if (baseValue > 0) {
                 totalAbsPriceVarianceVsCost += Math.abs((d.unitPrice || 0) - (d.baseUnitCost || 0)) * (d.orderedQuantity || 0);
                 totalBaseCostValue += baseValue;
             }

             // Supplier Value
             if(d.supplierName) {
                supplierValue[d.supplierName] = (supplierValue[d.supplierName] || 0) + (d.totalCost || 0);
             }
        });

        const avgPOValue = totalPOs > 0 ? totalPOValue / totalPOs : 0;
        const otdRate = totalPOs > 0 ? onTimeCount / totalPOs : 0;
        const avgLeadTimeActual = totalPOs > 0 ? totalLeadTimeActual / totalPOs : 0;
        const avgLeadTimeVariance = totalPOs > 0 ? totalLeadTimeVariance / totalPOs : 0;
        // Weighted average price variance percentage vs base cost
        const avgPriceVarianceVsCostPerc = totalBaseCostValue > 0 ? totalAbsPriceVarianceVsCost / totalBaseCostValue : 0;

        const topSupplierValue = Object.entries(supplierValue).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';


        return {
            totalPOValue: isFinite(totalPOValue) ? totalPOValue : 0,
            totalPOs: totalPOs,
            avgPOValue: isFinite(avgPOValue) ? avgPOValue : 0,
            otdRate: isFinite(otdRate) ? otdRate : 0,
            avgLeadTimeActual: isFinite(avgLeadTimeActual) ? avgLeadTimeActual : 0,
            avgLeadTimeVariance: isFinite(avgLeadTimeVariance) ? avgLeadTimeVariance : 0,
            avgPriceVarianceVsCostPerc: isFinite(avgPriceVarianceVsCostPerc) ? avgPriceVarianceVsCostPerc : 0, // Show as %
            topSupplierValue: topSupplierValue,
        };
    }, [filteredData]);


    // --- Chart Data Aggregations ---

    // OTD Rate by Supplier
    const otdBySupplierData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.supplierName || 'Unknown Supplier';
            if (!acc[key]) {
                acc[key] = { total: 0, onTime: 0 };
            }
            acc[key].total++;
             if (d.onTimeFlag === 1) { // Check the flag we created
                acc[key].onTime++;
            }
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([name, data]) => ({
                name,
                otdRate: data.total > 0 ? parseFloat((data.onTime / data.total).toFixed(3)) : 0
            }))
            .filter(d => d.otdRate >= 0) // Ensure valid rate
            .sort((a, b) => a.otdRate - b.otdRate); // Sort worst to best OTD
    }, [filteredData]);

    // Average Lead Time Variance by Supplier (Corrected)
    const leadTimeVarBySupplierData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.supplierName || 'Unknown Supplier';
            if (!acc[key]) {
                acc[key] = { totalVariance: 0, count: 0 }; // Keep track of count
            }
             acc[key].totalVariance += d.leadTimeVarianceDays || 0;
             acc[key].count++;
            return acc;
        }, {});

        return Object.entries(grouped)
             .map(([name, data]) => ({
                 name,
                 avgVariance: data.count > 0 ? parseFloat((data.totalVariance / data.count).toFixed(1)) : 0,
                 count: data.count // Pass count along
             }))
             // *** FIX HERE: Filter based on the count property of the mapped object 'd' ***
             .filter(d => d.count > 0)
             .sort((a, b) => b.avgVariance - a.avgVariance); // Sort highest variance (worst) first
     }, [filteredData]); // Dependency is correct


    // PO Value by Supplier
    const poValueBySupplierData = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
         const grouped = filteredData.reduce((acc, d) => {
             const key = d.supplierName || 'Unknown Supplier';
             acc[key] = (acc[key] || 0) + (d.totalCost || 0);
             return acc;
         }, {});
         return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 15); // Limit to top 15 for chart clarity
    }, [filteredData]);


    // Average Price Variance % vs Cost by Category (Corrected count check)
    const priceVarByCategoryData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];
        const grouped = filteredData.reduce((acc, d) => {
            const key = d.categoryName || 'Unknown Category';
             if (!acc[key]) {
                 acc[key] = { totalWeightedVariance: 0, totalBaseValue: 0, count: 0 };
             }
             const baseValue = (d.orderedQuantity || 0) * (d.baseUnitCost || 0);
             if (baseValue > 0 && d.priceVarianceVsCost !== null && isFinite(d.priceVarianceVsCost)) {
                 // Sum the absolute monetary variance
                 acc[key].totalWeightedVariance += Math.abs(d.priceVarianceVsCost * (d.orderedQuantity || 0));
                 acc[key].totalBaseValue += baseValue;
                 acc[key].count++;
             }
            return acc;
        }, {});

         return Object.entries(grouped)
             .map(([name, data]) => ({
                 name,
                 // Calculate weighted average variance percentage
                 avgVariancePerc: data.totalBaseValue > 0 ? parseFloat((data.totalWeightedVariance / data.totalBaseValue).toFixed(4)) : 0,
                 count: data.count // Pass count along
             }))
             // *** FIX HERE: Filter based on the count property of the mapped object 'd' ***
             .filter(d => d.count > 0) // Ensure category had valid data
             .sort((a, b) => b.avgVariancePerc - a.avgVariancePerc); // Highest variance first
     }, [filteredData]);

    // Scatter Plot: Lead Time Variance vs PO Value
    const leadTimeScatterData = useMemo(() => {
         if (!filteredData || filteredData.length === 0) return [];
         const sampleSize = 500;
         const dataToSample = filteredData.filter(d =>
             d.totalCost != null && isFinite(d.totalCost) && d.totalCost > 0 &&
             d.leadTimeVarianceDays != null && isFinite(d.leadTimeVarianceDays)
         );
         if (dataToSample.length === 0) return [];

         const step = Math.max(1, Math.floor(dataToSample.length / sampleSize));
         return dataToSample
                 .filter((_, index) => index % step === 0)
                 .map(d => ({
                     poValue: d.totalCost,
                     varianceDays: d.leadTimeVarianceDays,
                     supplier: d.supplierName,
                     poNumber: d.poNumber
                 }));
     }, [filteredData]);


    // --- Table Logic ---
     const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const descendingComparator = useCallback((a, b, orderByField) => {
        let valA = a[orderByField]; let valB = b[orderByField];
        if (valA == null && valB == null) return 0; if (valA == null) return 1; if (valB == null) return -1;
        if (orderByField.includes('Timestamp') || orderByField.includes('DateKey')) { try { valA = parseISO(valA); valB = parseISO(valB); } catch(e){} }
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
        setSelectedSupplier('ALL');
        setSelectedCategory('ALL');
        setSelectedLocation('ALL');
        setSelectedStatus('ALL');
    };

    // --- Render Logic ---
    const chartPaperHeight = '380px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Purchase Order Optimization
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
                          {/* Supplier Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Supplier</InputLabel>
                                <Select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} label="Supplier" disabled={loading}>
                                    {suppliers.map(s => <MenuItem key={s.supplierKey} value={s.supplierKey}>{s.supplierName}</MenuItem>)}
                                </Select>
                            </FormControl>
                         </Grid>
                          {/* Category Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Category</InputLabel>
                                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category" disabled={loading}>
                                    {categories.map(c => <MenuItem key={c.categoryKey} value={c.categoryKey}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                          {/* Location Filter */}
                          <Grid item xs={12} sm={6} md={2}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Receiving Store</InputLabel>
                                <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Receiving Store" disabled={loading}>
                                    {locations.map(l => <MenuItem key={l.storeKey} value={l.storeKey}>{l.storeName}</MenuItem>)}
                                </Select>
                            </FormControl>
                         </Grid>
                          {/* Status Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Receipt Status</InputLabel>
                                <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Receipt Status" disabled={loading}>
                                    {statuses.map(s => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</MenuItem>)}
                                </Select>
                            </FormControl>
                         </Grid>
                         {/* Date Range Filter */}
                         <Grid item xs={12} sm={9} md={3}>
                             <DateRangePicker
                                localeText={{ start: "Order Start Date", end: "Order End Date" }}
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
                                 disabled={loading || (selectedSupplier === 'ALL' && selectedCategory === 'ALL' && selectedLocation === 'ALL' && selectedStatus === 'ALL')}
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
                    <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total PO Value" value={kpiData.totalPOValue} formatFunc={formatCurrency} icon={<ReceiptLongIcon />} loading={loading} color="primary.main" tooltip="Total value of purchase orders placed" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Total POs" value={kpiData.totalPOs} formatFunc={(v)=>formatNumber(v,0)} icon={<ShoppingCartIcon />} loading={loading} color="secondary.main" tooltip="Total number of purchase orders" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="OTD Rate" value={kpiData.otdRate} formatFunc={formatPercentage} icon={<CheckCircleOutlineIcon />} loading={loading} color={NEGATIVE_VARIANCE_COLOR} tooltip="On-Time Delivery Rate (received on expected date +/- threshold)" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg Lead Time" value={kpiData.avgLeadTimeActual} formatFunc={formatDays} icon={<TimerIcon />} loading={loading} color="info.main" tooltip="Average actual lead time from order to receipt" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg LT Variance" value={kpiData.avgLeadTimeVariance} formatFunc={formatVarianceDays} icon={<AccessAlarmIcon />} loading={loading} color={kpiData.avgLeadTimeVariance > 0.5 ? POSITIVE_VARIANCE_COLOR : (kpiData.avgLeadTimeVariance < -0.5 ? NEGATIVE_VARIANCE_COLOR : NEUTRAL_COLOR)} tooltip="Average difference: Actual vs Planned lead time (+ means longer)" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg Price Var %" value={kpiData.avgPriceVarianceVsCostPerc} formatFunc={formatPercentage} icon={<PriceCheckIcon />} loading={loading} color={kpiData.avgPriceVarianceVsCostPerc > 0.02 ? POSITIVE_VARIANCE_COLOR : NEUTRAL_COLOR } tooltip="Average absolute price variance vs base cost (weighted by order value)" /></Grid>
                     <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Avg PO Value" value={kpiData.avgPOValue} formatFunc={formatCurrency} icon={<AttachMoneyIcon />} loading={loading} color="success.dark" tooltip="Average value per purchase order" /></Grid>
                    <Grid item xs={6} sm={4} md={1.5}><KpiCard title="Top Supplier" value={kpiData.topSupplierValue} formatFunc={(v)=>v} icon={<BusinessIcon />} loading={loading} color="purple" tooltip="Supplier with the highest total PO value" /></Grid>
                 </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* OTD Rate by Supplier */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>On-Time Delivery Rate by Supplier</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : otdBySupplierData.length > 0 ? (
                                        <BarChart data={otdBySupplierData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" domain={[0, 1]} tickFormatter={formatPercentage} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatPercentage(value)} />
                                            <Bar dataKey="otdRate" name="OTD Rate">
                                                {otdBySupplierData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.otdRate >= 0.95 ? NEGATIVE_VARIANCE_COLOR : (entry.otdRate < 0.8 ? POSITIVE_VARIANCE_COLOR : theme.palette.warning.main)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No OTD data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                     {/* Avg Lead Time Variance by Supplier */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Lead Time Variance by Supplier (Days)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : leadTimeVarBySupplierData.length > 0 ? (
                                         <BarChart data={leadTimeVarBySupplierData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} unit="d" domain={['dataMin - 1', 'dataMax + 1']}/>
                                            <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatVarianceDays(value)}/>
                                             <Bar dataKey="avgVariance" name="Avg LT Variance">
                                                 {leadTimeVarBySupplierData.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={entry.avgVariance > 1 ? POSITIVE_VARIANCE_COLOR : (entry.avgVariance < -1 ? NEGATIVE_VARIANCE_COLOR : theme.palette.info.light)} />
                                                 ))}
                                             </Bar>
                                        </BarChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No lead time variance data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                     {/* PO Value by Supplier */}
                     <Grid item xs={12} md={6} lg={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>PO Value by Supplier (Top 15)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : poValueBySupplierData.length > 0 ? (
                                        <BarChart data={poValueBySupplierData} margin={{ top: 5, right: 5, left: 0, bottom: 60 }}> {/* Increased bottom margin */}
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis dataKey="name" fontSize={9} interval={0} angle={-45} textAnchor="end" tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => `${formatNumber(v/1000,0)}k`} />
                                            <Tooltip formatter={(value) => formatCurrency(value)}/>
                                            <Bar dataKey="value" name="Total PO Value">
                                                 {poValueBySupplierData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No PO value data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>

                     {/* Avg Price Var % by Category */}
                     <Grid item xs={12} md={6} lg={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg Price Variance % vs Cost by Category</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : priceVarByCategoryData.length > 0 ? (
                                         <BarChart data={priceVarByCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" tickFormatter={formatPercentage} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => formatPercentage(value)}/>
                                             <Bar dataKey="avgVariancePerc" name="Avg Price Var %">
                                                 {priceVarByCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                                             </Bar>
                                        </BarChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No price variance data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                    {/* Scatter Plot */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Lead Time Variance vs. PO Value</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : leadTimeScatterData.length > 0 ? (
                                        <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis type="number" dataKey="poValue" name="PO Value" unit=" EGP" domain={['dataMin', 'dataMax']} label={{ value: "PO Value (EGP)", position: "insideBottom", offset: -15, fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatNumber(v/1000,0)+'k'} />
                                            <YAxis type="number" dataKey="varianceDays" name="LT Variance" unit="d" label={{ value: "Variance (d)", angle: -90, position: 'insideLeft', fontSize: 10, fill: theme.palette.text.secondary }} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                                                if(name === 'PO Value') return [formatCurrency(value), `${name} (${props.payload.poNumber})`];
                                                if(name === 'LT Variance') return [formatVarianceDays(value), name];
                                                return value;
                                            }}/>
                                             <Scatter name="PO" data={leadTimeScatterData} fill={theme.palette.secondary.main} shape="circle" opacity={0.6} />
                                        </ScatterChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No scatter data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Purchase Order Details</Typography>
                     <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                     {[
                                        { id: 'poNumber', label: 'PO #', minWidth: 80 },
                                        { id: 'orderTimestamp', label: 'Order Date', minWidth: 100 },
                                        { id: 'supplierName', label: 'Supplier', minWidth: 120 },
                                        { id: 'productName', label: 'Product', minWidth: 150 },
                                        { id: 'categoryName', label: 'Category', minWidth: 100 },
                                        { id: 'storeName', label: 'Receiving Loc', minWidth: 110 },
                                        { id: 'orderedQuantity', label: 'Ord Qty', minWidth: 60, align: 'right' },
                                        { id: 'receivedQuantity', label: 'Rec Qty', minWidth: 60, align: 'right' },
                                        { id: 'unitPrice', label: 'Unit Price', minWidth: 70, align: 'right' },
                                        { id: 'totalCost', label: 'Total Cost', minWidth: 80, align: 'right' },
                                        { id: 'expectedReceiptDateKey', label: 'Expect Rcv', minWidth: 90 },
                                        { id: 'actualReceiptDateKey', label: 'Actual Rcv', minWidth: 90 },
                                        { id: 'leadTimePlannedDays', label: 'Plan LT', minWidth: 50, align: 'right' },
                                        { id: 'leadTimeActualDays', label: 'Actual LT', minWidth: 50, align: 'right' },
                                        { id: 'leadTimeVarianceDays', label: 'LT Var', minWidth: 50, align: 'right' },
                                        { id: 'receiptStatus', label: 'Status', minWidth: 80 },
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
                                         <TableRow key={`skel-${index}`}><TableCell colSpan={16}><Skeleton animation="wave" /></TableCell></TableRow>
                                     ))
                                ) : sortedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={16} align="center" sx={{ py: 3 }}>No purchase order data matches filters.</TableCell></TableRow>
                                ) : (
                                    currentTableData.map((row) => (
                                        <TableRow hover key={row.purchaseOrderKey} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { fontSize: '0.75rem', py: 0.4 } }}>
                                            <TableCell>{row.poNumber}</TableCell>
                                            <TableCell>{formatDateTime(row.orderTimestamp)}</TableCell>
                                            <TableCell>{row.supplierName}</TableCell>
                                            <TableCell>{row.productName}</TableCell>
                                            <TableCell>{row.categoryName}</TableCell>
                                            <TableCell>{row.storeName}</TableCell>
                                            <TableCell align="right">{formatNumber(row.orderedQuantity)}</TableCell>
                                            <TableCell align="right" sx={{ color: row.receivedQuantity < row.orderedQuantity ? theme.palette.warning.dark : 'inherit' }}>{formatNumber(row.receivedQuantity)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.unitPrice)}</TableCell>
                                            <TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(row.totalCost)}</TableCell>
                                            <TableCell>{formatDate(row.expectedReceiptDateKey)}</TableCell>
                                            <TableCell>{formatDate(row.actualReceiptDateKey)}</TableCell>
                                            <TableCell align="right">{formatDays(row.leadTimePlannedDays)}</TableCell>
                                            <TableCell align="right">{formatDays(row.leadTimeActualDays)}</TableCell>
                                            <TableCell align="right" sx={{ color: row.leadTimeVarianceDays > ON_TIME_THRESHOLD_DAYS ? POSITIVE_VARIANCE_COLOR : (row.leadTimeVarianceDays < -ON_TIME_THRESHOLD_DAYS ? NEGATIVE_VARIANCE_COLOR : 'inherit') }}>
                                                {formatVarianceDays(row.leadTimeVarianceDays)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.receiptStatus} size="small" color={getStatusColor(row.receiptStatus)} variant="outlined" sx={{fontSize: '0.7rem', height: '20px'}}/>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Empty rows */}
                                {!loading && sortedData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 29 * emptyRows }}><TableCell colSpan={16} /></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     {/* Pagination */}
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

export default PurchaseOptimizationDashboard;