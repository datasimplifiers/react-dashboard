import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, Tabs, Tab, RadioGroup, FormControlLabel, Radio, useTheme // Keep useTheme import
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { subDays, format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';

// MUI Icons
import StoreIcon from '@mui/icons-material/Store';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove'; // For no change
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PercentIcon from '@mui/icons-material/Percent';

// Import mock data functions
import { generateMockSalesData, getMockStores, getMockCategories } from '../utils/mockDataGenerator'; // Adjust path if needed

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF5722', '#607D8B'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // Order for chart

// --- Helper Functions --- (Keep as before)
const formatCurrency = (value) => `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPercent = (value) => `${value.toFixed(1)}%`;
const formatDateForDisplay = (date) => format(date, 'MMM d, yyyy');
const formatDateForAxis = (dateString) => { try { const p = parseISO(dateString); return isValid(p) ? format(p, 'MMM d') : 'Invalid'; } catch (e) { return 'Error'; } };
const getPreviousPeriod = (startDate, endDate) => { /* ... keep as before ... */ if (!isValid(startDate) || !isValid(endDate)) return [null, null]; const diff = differenceInDays(endDate, startDate); if (diff < 0) return [null, null]; const prevEnd = subDays(startOfDay(startDate), 1); const prevStart = subDays(prevEnd, diff); return [startOfDay(prevStart), endOfDay(prevEnd)]; };
const calculatePopChange = (current, previous) => { /* ... keep as before ... */ if (previous === 0 || previous === null || current === null || !isFinite(current) || !isFinite(previous)) return null; if (current === previous) return 0.0; return ((current - previous) / previous) * 100; };

// --- KpiCard Component --- (Keep as before)
const KpiCard = ({ title, value, formatFunc = (v) => v.toLocaleString(), previousValue, icon, bgColor = '#e3f2fd', borderColor = '#2196f3' }) => {
    const theme = useTheme(); const change = calculatePopChange(value, previousValue); let ChangeIcon = RemoveIcon; let changeColor = theme.palette.text.secondary; let changeText = 'No prev data';
    if (change !== null) { if (change > 0.05) { ChangeIcon = TrendingUpIcon; changeColor = theme.palette.success.main; changeText = `${change.toFixed(1)}% vs PP`; } else if (change < -0.05) { ChangeIcon = TrendingDownIcon; changeColor = theme.palette.error.main; changeText = `${change.toFixed(1)}% vs PP`; } else { changeColor = theme.palette.text.secondary; changeText = `${change.toFixed(1)}% vs PP`; } }
    const displayValue = (value === null || value === undefined || !isFinite(value)) ? 'N/A' : formatFunc(value);
    return ( <Card elevation={3} sx={{ backgroundColor: bgColor, borderLeft: `5px solid ${borderColor}`, height: '100%' }}><CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', p: {xs: 1, sm: 2} }}><Box><Typography color="textSecondary" gutterBottom sx={{ fontSize: {xs: '0.8rem', sm: '0.9rem'}, fontWeight: 500 }}>{title}</Typography><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>{icon && React.cloneElement(icon, { sx: { mr: 1, color: borderColor, fontSize: {xs: '1.2rem', sm:'1.5rem'} } })}<Typography variant="h5" component="div" sx={{ mr: 1, fontSize: {xs: '1.2rem', sm:'1.75rem'} }}>{displayValue}</Typography></Box></Box><Box sx={{ display: 'flex', alignItems: 'center', height: '20px', mt: 'auto' }}>{ChangeIcon && <ChangeIcon sx={{ fontSize: '1rem', color: changeColor, mr: 0.5 }} />}<Typography variant="caption" sx={{ color: changeColor, fontWeight: 'medium' }}>{changeText}</Typography></Box></CardContent></Card> );
};

// --- Main Component ---
const StoreSalesAnalytics = () => {
    const theme = useTheme(); // Moved to top

    // State Hooks (Keep as before)
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [allSalesData, setAllSalesData] = useState([]); const [selectedStore, setSelectedStore] = useState('ALL'); const [selectedCategory, setSelectedCategory] = useState('ALL'); const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 29)), endOfDay(new Date())]); const [tablePage, setTablePage] = useState(0); const [rowsPerPage, setRowsPerPage] = useState(10); const [orderBy, setOrderBy] = useState('netSalesAmount'); const [order, setOrder] = useState('desc'); const [productView, setProductView] = useState('all'); const [topN, setTopN] = useState(10); const [selectedCategoryForTable, setSelectedCategoryForTable] = useState(null);

    // Dimension Data (Keep as before)
    const stores = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Stores' }, ...getMockStores()], []);
    const categories = useMemo(() => [{ categoryKey: 'ALL', name: 'All Categories' }, ...getMockCategories()], []);

    // Data Fetching Simulation (Keep as before)
    useEffect(() => {
        setLoading(true); setError(null); console.log("Initiating data fetch effect..."); try { const [currentStart, currentEnd] = dateRange; if (!isValid(currentStart) || !isValid(currentEnd)) { throw new Error("Invalid initial date range state during fetch setup."); } const [prevStart, prevEnd] = getPreviousPeriod(currentStart, currentEnd); const earliestDate = prevStart && isValid(prevStart) ? prevStart : currentStart; const latestDate = currentEnd; if (!isValid(earliestDate) || !isValid(latestDate)) { throw new Error("Could not determine a valid fetch date range."); } const fetchDataRange = [earliestDate, latestDate]; console.log("Attempting to generate mock data for range:", fetchDataRange); setTimeout(() => { try { const data = generateMockSalesData(fetchDataRange[0], fetchDataRange[1]); console.log("Generated mock data count:", data.length); if (!Array.isArray(data)) { throw new Error("Mock data generation did not return an array."); } setAllSalesData(data); setLoading(false); } catch (generationError) { console.error("Error inside mock data generation:", generationError); setError(`Failed to generate sales data: ${generationError.message}`); setAllSalesData([]); setLoading(false); } }, 1000); } catch (err) { console.error("Error setting up data fetch:", err); setError(`Setup error: ${err.message}`); setAllSalesData([]); setLoading(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtering Logic (Keep as before)
    const filterDataByPeriod = useCallback((data, startDate, endDate) => { if (!data || data.length === 0 || !isValid(startDate) || !isValid(endDate)) return []; const start = startOfDay(startDate); const end = endOfDay(endDate); const filtered = data.filter(item => { if (!item || !item.timestamp || !item.storeKey || !item.categoryKey) return false; let itemDate; try { itemDate = parseISO(item.timestamp); if (!isValid(itemDate)) return false; } catch (e) { return false; } const storeMatch = selectedStore === 'ALL' || item.storeKey === selectedStore; const categoryMatch = selectedCategory === 'ALL' || item.categoryKey === selectedCategory; const dateMatch = itemDate >= start && itemDate <= end; return storeMatch && categoryMatch && dateMatch; }); return filtered; }, [selectedStore, selectedCategory]);
    const currentPeriodData = useMemo(() => { const [start, end] = dateRange; return filterDataByPeriod(allSalesData, start, end); }, [allSalesData, dateRange, filterDataByPeriod]);
    const previousPeriodData = useMemo(() => { const [start, end] = dateRange; const [prevStart, prevEnd] = getPreviousPeriod(start, end); return filterDataByPeriod(allSalesData, prevStart, prevEnd); }, [allSalesData, dateRange, filterDataByPeriod]);

    // KPI Calculations (Keep as before)
    const calculateKpis = useCallback((data) => { const d = { tS: 0, tP: 0, tU: 0, aT: 0, uT: 0, aDP: 0, upt: 0 }; if (!data || !Array.isArray(data) || data.length === 0) return d; let tS=0,tP=0,tU=0,tGS=0,tDA=0; const tIds=new Set(); for (const i of data){ if(i&&typeof i.netSalesAmount==='number'&&isFinite(i.netSalesAmount))tS+=i.netSalesAmount; if(i&&typeof i.grossProfit==='number'&&isFinite(i.grossProfit))tP+=i.grossProfit; if(i&&typeof i.quantitySold==='number'&&isFinite(i.quantitySold))tU+=i.quantitySold; if(i&&typeof i.grossSalesAmount==='number'&&isFinite(i.grossSalesAmount))tGS+=i.grossSalesAmount; if(i&&typeof i.discountAmount==='number'&&isFinite(i.discountAmount))tDA+=i.discountAmount; if(i&&i.transactionId)tIds.add(i.transactionId);} const uT=tIds.size; const aT=uT>0?tS/uT:0; const aDP=tGS>0?(tDA/tGS)*100:0; const upt=uT>0?tU/uT:0; return{totalSales:isFinite(tS)?tS:0,totalProfit:isFinite(tP)?tP:0,totalUnits:isFinite(tU)?tU:0,avgTransaction:isFinite(aT)?aT:0,uniqueTransactions:uT,avgDiscountPerc:isFinite(aDP)?aDP:0,upt:isFinite(upt)?upt:0}; }, []);
    const currentKpis = useMemo(() => calculateKpis(currentPeriodData), [currentPeriodData, calculateKpis]);
    const previousKpis = useMemo(() => calculateKpis(previousPeriodData), [previousPeriodData, calculateKpis]);

    // --- Chart Data Aggregations --- (Keep as before, logs are still useful)
    const salesTrendData = useMemo(() => { /* console.log("Trend In:", currentPeriodData?.length); */ if (!currentPeriodData || currentPeriodData.length === 0) return []; const sBD = currentPeriodData.reduce((a, i) => { if (i && i.dateKey && typeof i.netSalesAmount === 'number' && isFinite(i.netSalesAmount)) { const d = i.dateKey; if (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}$/)) { a[d] = (a[d] || 0) + i.netSalesAmount; } } return a; }, {}); const t = Object.entries(sBD).map(([d, s])=>({ date: d, sales: parseFloat(s.toFixed(2)) })).sort((a, b) => { try { return parseISO(a.date) - parseISO(b.date); } catch(e) { return 0; } }).map(d => ({ ...d, displayDate: formatDateForAxis(d.date) })); /* console.log("Trend Out:", t.length); */ return t; }, [currentPeriodData]);
    const salesByCategoryData = useMemo(() => { /* console.log("Cat In:", currentPeriodData?.length); */ if (!currentPeriodData || currentPeriodData.length === 0) return []; const sBC = currentPeriodData.reduce((a, i) => { if (i && i.categoryName && typeof i.netSalesAmount === 'number' && isFinite(i.netSalesAmount)) { const cN = i.categoryName || 'Unknown'; a[cN] = (a[cN] || 0) + i.netSalesAmount; } return a; }, {}); const cD = Object.entries(sBC).map(([n, s]) => ({ name: n, sales: parseFloat(s.toFixed(2)) })).sort((a, b) => b.sales - a.sales); /* console.log("Cat Out:", cD.length); */ return cD; }, [currentPeriodData]);
    const salesByDayOfWeekData = useMemo(() => { /* console.log("Day In:", currentPeriodData?.length); */ if (!currentPeriodData || currentPeriodData.length === 0) return []; const sBD = currentPeriodData.reduce((a, i) => { if (i && i.dayOfWeek && typeof i.netSalesAmount === 'number' && isFinite(i.netSalesAmount)) { const d = i.dayOfWeek; if (typeof d === 'string' && DAYS_OF_WEEK.includes(d)) { a[d] = (a[d] || 0) + i.netSalesAmount; } } return a; }, {}); const dD = DAYS_OF_WEEK.map(d => ({ name: d.substring(0, 3), sales: parseFloat((sBD[d] || 0).toFixed(2)) })); /* console.log("Day Out:", dD); */ return dD; }, [currentPeriodData]);

    // --- Product Performance Data & Table Logic --- (Keep as before)
    const productPerformanceData = useMemo(() => { if (!currentPeriodData || currentPeriodData.length === 0) return []; const dTA = selectedCategoryForTable ? currentPeriodData.filter(i => i && i.categoryName === selectedCategoryForTable) : currentPeriodData; if (!dTA || dTA.length === 0) return []; const sBP = dTA.reduce((a, i) => { if (!i || !i.productKey || !i.productName || !i.categoryName) return a; if (!a[i.productKey]) { a[i.productKey] = { productKey: i.productKey, productName: i.productName, categoryName: i.categoryName, tQS: 0, nSA: 0, gP: 0, gSA: 0, tDA: 0 }; } if (typeof i.quantitySold === 'number' && isFinite(i.quantitySold)) a[i.productKey].tQS += i.quantitySold; if (typeof i.netSalesAmount === 'number' && isFinite(i.netSalesAmount)) a[i.productKey].nSA += i.netSalesAmount; if (typeof i.grossProfit === 'number' && isFinite(i.grossProfit)) a[i.productKey].gP += i.grossProfit; if (typeof i.grossSalesAmount === 'number' && isFinite(i.grossSalesAmount)) a[i.productKey].gSA += i.grossSalesAmount; if (typeof i.discountAmount === 'number' && isFinite(i.discountAmount)) a[i.productKey].tDA += i.discountAmount; return a; }, {}); const iPD = Object.values(sBP).map(p => { const nS=isFinite(p.nSA)?parseFloat(p.nSA.toFixed(2)):0; const pr=isFinite(p.gP)?parseFloat(p.gP.toFixed(2)):0; const gS=isFinite(p.gSA)?parseFloat(p.gSA.toFixed(2)):0; const q=isFinite(p.tQS)?p.tQS:0; const d=isFinite(p.tDA)?p.tDA:0; const aSP=q>0?parseFloat((nS/q).toFixed(2)):0; const pM=nS>0?parseFloat(((pr/nS)*100).toFixed(2)):0; const aDP=gS>0?parseFloat(((d/gS)*100).toFixed(2)):0; return { ...p, totalQuantitySold:q, netSalesAmount:nS, grossProfit:pr, avgSellingPrice: isFinite(aSP)?aSP:0, profitMargin: isFinite(pM)?pM:0, avgDiscountPerc: isFinite(aDP)?aDP:0 }; }); const tUO = iPD.reduce((s, p) => s + p.totalQuantitySold, 0); const aUSO = iPD.length > 0 ? tUO / iPD.length : 1; const fPD = iPD.map(p => { const iSM = p.totalQuantitySold < 10 && p.totalQuantitySold < (aUSO * 0.2); return { ...p, isSlowMover:iSM }; }); return fPD; }, [currentPeriodData, selectedCategoryForTable]);

    // --- Stable Sort & Comparator Functions --- (Keep as before)
     const stableSort = useCallback((a, c) => { const sT = a.map((e, i) => [e, i]); sT.sort((x, y) => { const o = c(x[0], y[0]); if (o !== 0) return o; return x[1] - y[1]; }); return sT.map((e) => e[0]); }, []);
    const descendingComparator = useCallback((a, b, oB) => { let vA=a[oB]; let vB=b[oB]; if(vA==null&&vB==null)return 0; if(vA==null)return 1; if(vB==null)return -1; if(typeof vA==='string'&&typeof vB==='string'){vA=vA.toLowerCase(); vB=vB.toLowerCase();} if(vB<vA)return -1; if(vB>vA)return 1; return 0; }, []);
     const getComparator = useCallback((o, oB) => { return o === 'desc' ? (a, b) => descendingComparator(a, b, oB) : (a, b) => -descendingComparator(a, b, oB); }, [descendingComparator]);

    // Apply sorting and Top/Bottom N filtering (Keep as before)
    const sortedAndFilteredProductData = useMemo(() => { if (!productPerformanceData || productPerformanceData.length === 0) return []; let s = stableSort(productPerformanceData, getComparator(order, orderBy)); if (productView === 'top') return s.slice(0, topN); if (productView === 'bottom') { s = stableSort(productPerformanceData, getComparator('asc', orderBy)); return s.slice(0, topN); } return s; }, [productPerformanceData, order, orderBy, productView, topN, stableSort, getComparator]);

    // Table Sorting Handler (Keep as before)
    const handleRequestSort = useCallback((p) => { const iA = orderBy === p && order === 'asc'; setOrder(iA ? 'desc' : 'asc'); setOrderBy(p); }, [order, orderBy]);

    // Pagination (Keep as before)
    const handleChangePage = (e, nP) => setTablePage(nP); const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setTablePage(0); };
    const emptyRows = useMemo(() => { const c = sortedAndFilteredProductData.length; return c > 0 ? Math.max(0, rowsPerPage - (c - tablePage * rowsPerPage)) : 0; }, [sortedAndFilteredProductData, tablePage, rowsPerPage]);

    // Interactivity Handlers (Keep as before)
    const handleCategoryClick = useCallback((p) => { const cN = p?.name || p?.payload?.name || p?.activeLabel; if (cN) { setSelectedCategoryForTable(prv => prv === cN ? null : cN); setTablePage(0); } else { console.warn("Could not determine category name:", p); } }, []);
    const clearTableCategoryFilter = useCallback(() => { setSelectedCategoryForTable(null); }, []);

    // Export Logic (Keep as before)
    const handleExport = useCallback(() => { /* ... Keep export logic ... */ if (!sortedAndFilteredProductData || sortedAndFilteredProductData.length === 0) { alert("No data."); return; } const h = ["Product", "Category", "Units Sold", "Avg Price (EGP)", "Net Sales (EGP)", "Profit (EGP)", "Margin (%)", "Avg Discount (%)", "Slow Mover"]; const r = sortedAndFilteredProductData.map(p => [`"${p.productName.replace(/"/g, '""')}"`, p.categoryName, p.totalQuantitySold, p.avgSellingPrice, p.netSalesAmount, p.grossProfit, p.profitMargin.toFixed(1), p.avgDiscountPerc.toFixed(1), p.isSlowMover ? 'Yes' : 'No']); let c = "data:text/csv;charset=utf-8," + h.join(",") + "\n" + r.map(e => e.join(",")).join("\n"); try { const u = encodeURI(c); const l = document.createElement("a"); l.setAttribute("href", u); const dP = (isValid(dateRange[0]) && isValid(dateRange[1])) ? `${format(dateRange[0], 'yyyyMMdd')}-${format(dateRange[1], 'yyyyMMdd')}` : 'all'; l.setAttribute("download", `prod_perf_${selectedStore}_${dP}.csv`); document.body.appendChild(l); l.click(); document.body.removeChild(l); } catch (e) { console.error("CSV Error:", e); alert("Export failed."); } }, [sortedAndFilteredProductData, selectedStore, dateRange]);

    // --- Render Logic ---
    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>; }
    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }

    // *** DEBUGGING: Add temporary display of chart data ***
    const showDebugData = false; // Set to true to show data below charts

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>Store Sales Analysis</Typography>

                {/* Filters */}
                <Paper elevation={2} sx={{ p: {xs: 1, sm: 2}, mb: 3 }}>
                    {/* ... Filter Grid ... */}
                     <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Store</InputLabel><Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} label="Store">{stores.map(s => <MenuItem key={s.storeKey} value={s.storeKey}>{s.storeName}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Category</InputLabel><Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category">{categories.map(c => <MenuItem key={c.categoryKey} value={c.categoryKey}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} md={6}><DateRangePicker localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(range) => { if (range && range.length === 2 && isValid(range[0]) && isValid(range[1])) { setDateRange([startOfDay(range[0]), endOfDay(range[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} /></Grid>
                    </Grid>
                </Paper>

                {/* KPIs */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    {/* ... KPI Grid Items ... */}
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Sales" value={currentKpis.totalSales} previousValue={previousKpis.totalSales} formatFunc={formatCurrency} icon={<PointOfSaleIcon />} bgColor='#e3f2fd' borderColor='#2196f3' /></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Total Profit" value={currentKpis.totalProfit} previousValue={previousKpis.totalProfit} formatFunc={formatCurrency} icon={<TrendingUpIcon />} bgColor='#e8f5e9' borderColor='#4caf50'/></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Units Sold" value={currentKpis.totalUnits} previousValue={previousKpis.totalUnits} icon={<InventoryIcon />} bgColor='#f3e5f5' borderColor='#9c27b0' /></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg. Transaction" value={currentKpis.avgTransaction} previousValue={previousKpis.avgTransaction} formatFunc={formatCurrency} icon={<ShoppingCartIcon />} bgColor='#fff3e0' borderColor='#ff9800' /></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Units Per Trans (UPT)" value={currentKpis.upt} previousValue={previousKpis.upt} formatFunc={v => v.toFixed(1)} icon={<ShoppingCartIcon />} bgColor='#e0f7fa' borderColor='#00bcd4'/></Grid>
                     <Grid item xs={6} sm={4} md={2}><KpiCard title="Avg. Discount %" value={currentKpis.avgDiscountPerc} previousValue={previousKpis.avgDiscountPerc} formatFunc={formatPercent} icon={<PercentIcon />} bgColor='#fce4ec' borderColor='#e91e63' /></Grid>
                </Grid>

                 {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} lg={6}> {/* Sales Trend Chart */}
                        <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}> {/* Ensure flex column */}
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}> <Typography variant="h6" sx={{ color: 'text.primary', mb:0 }}>Sales Trend</Typography> <Typography variant="caption" color="text.secondary">{isValid(dateRange[0]) && isValid(dateRange[1]) ? `${formatDateForDisplay(dateRange[0])} - ${formatDateForDisplay(dateRange[1])}` : ''}</Typography> </Box>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}> {/* Added wrapper for chart */}
                                <ResponsiveContainer width="100%" height="100%">
                                    {salesTrendData.length > 0 ? (
                                        <LineChart data={salesTrendData} margin={{ top: 5, right: 5, left: 25, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={"#e0e0e0"}/> {/* Simplified stroke */}
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: "#666" }} interval="preserveStartEnd" /> {/* Simplified fill */}
                                            <YAxis tickFormatter={(v) => `EGP ${v / 1000}k`} fontSize={10} tick={{ fill: "#666" }} />
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                            <Line type="monotone" dataKey="sales" name="Net Sales" stroke={"#8884d8"} strokeWidth={2} dot={false} activeDot={{ r: 6 }}/>
                                        </LineChart>
                                    ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data</Typography></Box> )}
                                </ResponsiveContainer>
                             </Box>
                             {showDebugData && <pre style={{fontSize: '10px', maxHeight:'50px', overflow:'auto'}}>Trend Data: {JSON.stringify(salesTrendData)}</pre>}
                        </Paper>
                    </Grid>
                     <Grid item xs={12} md={6} lg={3}> {/* Sales by Category Chart */}
                         <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, flexShrink: 0 }}>Sales by Category</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {salesByCategoryData.length > 0 ? (
                                         <BarChart data={salesByCategoryData} layout="vertical" margin={{ top: 0, right: 20, left: 65, bottom: 0 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={"#e0e0e0"} />
                                             <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} fontSize={10} tick={{ fill: "#666" }}/>
                                             <YAxis dataKey="name" type="category" width={65} interval={0} fontSize={10} tick={{ fill: "#666" }} />
                                             <Tooltip formatter={(v) => [formatCurrency(v), "Net Sales"]}/>
                                             <Bar dataKey="sales" name="Net Sales" onClick={handleCategoryClick} style={{ cursor: 'pointer' }}>{salesByCategoryData.map((e, i) => ( <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} /> ))}</Bar>
                                         </BarChart>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data</Typography></Box> )}
                                 </ResponsiveContainer>
                             </Box>
                              {showDebugData && <pre style={{fontSize: '10px', maxHeight:'50px', overflow:'auto'}}>Category Data: {JSON.stringify(salesByCategoryData)}</pre>}
                         </Paper>
                     </Grid>
                      <Grid item xs={12} md={6} lg={3}> {/* Sales by Day of Week Chart */}
                        <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, flexShrink: 0 }}>Sales by Day of Week</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {salesByDayOfWeekData.some(d => d.sales > 0) ? (
                                        <BarChart data={salesByDayOfWeekData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={"#e0e0e0"} />
                                            <XAxis dataKey="name" fontSize={10} tick={{ fill: "#666" }}/>
                                            <YAxis tickFormatter={(v) => `${v / 1000}k`} fontSize={10} tick={{ fill: "#666" }}/>
                                            <Tooltip formatter={(v) => [formatCurrency(v), "Net Sales"]} />
                                            <Bar dataKey="sales" name="Net Sales">{salesByDayOfWeekData.map((e, i) => ( <Cell key={`cell-${i}`} fill={COLORS[(i + 2) % COLORS.length]} /> ))}</Bar>
                                        </BarChart>
                                    ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data</Typography></Box> )}
                                </ResponsiveContainer>
                             </Box>
                              {showDebugData && <pre style={{fontSize: '10px', maxHeight:'50px', overflow:'auto'}}>Day Data: {JSON.stringify(salesByDayOfWeekData)}</pre>}
                        </Paper>
                    </Grid>
                </Grid>

                 {/* Product Performance Table */}
                 <Paper elevation={3} sx={{ p: {xs: 1, sm: 2}, overflow: 'hidden' }}>
                     {/* ... Table Header Area (Controls etc) ... */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}> <Typography variant="h6" sx={{ color: 'text.primary' }}>Product Performance</Typography>{selectedCategoryForTable && (<Chip label={`Category: ${selectedCategoryForTable}`} onDelete={clearTableCategoryFilter} color="primary" variant="outlined" size="small" deleteIcon={<FilterListOffIcon />} />)}</Box> <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs: 1, sm: 2}, flexWrap: 'wrap' }}> <FormControl component="fieldset" size="small"><RadioGroup row value={productView} onChange={(e) => { setProductView(e.target.value); setTablePage(0); }}><FormControlLabel value="all" control={<Radio size="small"/>} label="All" sx={{'.MuiFormControlLabel-label': {fontSize: '0.9rem'}}}/><FormControlLabel value="top" control={<Radio size="small"/>} label={`Top ${topN}`} sx={{'.MuiFormControlLabel-label': {fontSize: '0.9rem'}}}/><FormControlLabel value="bottom" control={<Radio size="small"/>} label={`Bottom ${topN}`} sx={{'.MuiFormControlLabel-label': {fontSize: '0.9rem'}}}/></RadioGroup></FormControl> <Button variant="outlined" size="small" onClick={handleExport} startIcon={<DownloadIcon />}>Export CSV</Button></Box> </Box>
                     {/* ... TableContainer, Table, TableHead, TableBody ... */}
                      <TableContainer sx={{ maxHeight: 600 }}>
                         <Table stickyHeader size="small">
                             <TableHead>
                                 <TableRow>{[ { id: 'productName', label: 'Product', minWidth: 170, align: 'left'}, { id: 'categoryName', label: 'Category', minWidth: 120, align: 'left'}, { id: 'totalQuantitySold', label: 'Units Sold', minWidth: 80, align: 'right'}, { id: 'netSalesAmount', label: 'Net Sales', minWidth: 100, align: 'right', format: formatCurrency }, { id: 'profitMargin', label: 'Margin %', minWidth: 80, align: 'right', format: formatPercent }, { id: 'avgDiscountPerc', label: 'Avg Disc %', minWidth: 80, align: 'right', format: formatPercent }, { id: 'isSlowMover', label: 'Slow Mover', minWidth: 60, align: 'center' }].map((h) => (<TableCell key={h.id} align={h.align} sortDirection={orderBy === h.id ? order : false} sx={{ py: 1, minWidth: h.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold' }}>{h.id !== 'isSlowMover' ? (<TableSortLabel active={orderBy === h.id} direction={orderBy === h.id ? order : 'asc'} onClick={() => handleRequestSort(h.id)}>{h.label}</TableSortLabel>) : h.label }</TableCell>))}</TableRow>
                             </TableHead>
                             <TableBody>{sortedAndFilteredProductData.length === 0 && !loading ? ( <TableRow><TableCell colSpan={7} align="center" sx={{py: 3}}>No product data matches the current filters.</TableCell></TableRow> ) : ( sortedAndFilteredProductData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((p) => (<TableRow hover key={p.productKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}><TableCell>{p.productName}</TableCell><TableCell>{p.categoryName}</TableCell><TableCell align="right">{p.totalQuantitySold.toLocaleString()}</TableCell><TableCell align="right">{formatCurrency(p.netSalesAmount)}</TableCell><TableCell align="right">{formatPercent(p.profitMargin)}</TableCell><TableCell align="right">{formatPercent(p.avgDiscountPerc)}</TableCell><TableCell align="center">{p.isSlowMover && (<MuiTooltip title="Low sales volume" placement="top" arrow><WarningAmberIcon color="warning" fontSize='small'/></MuiTooltip>)}</TableCell></TableRow>)))} {sortedAndFilteredProductData.length > 0 && emptyRows > 0 && ( <TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={7} /></TableRow> )}</TableBody>
                         </Table>
                     </TableContainer>
                     {/* ... Pagination ... */}
                      {sortedAndFilteredProductData.length > 0 && ( <TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedAndFilteredProductData.length} rowsPerPage={rowsPerPage} page={tablePage} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }} /> )}
                 </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default StoreSalesAnalytics;